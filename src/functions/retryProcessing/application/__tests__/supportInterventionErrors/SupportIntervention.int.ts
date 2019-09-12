import * as mysql from 'mysql2';
import { IRetryProcessor } from '../../IRetryProcessor';
import { RetryProcessor } from '../../RetryProcessor';
import {
  getAutosaveQueueRecords,
  getTestResultAppRefsForResultStatus,
  getProcessingUploadQueueRecords,
} from '../common/HelperSQLQueries';
import {
  getTestResultData,
  getQueueResultData,
} from './supportInterventionTestData';
import {
  insertAutosaveTestResultData,
  insertAutosaveQueueResultData,
  deleteAutosaveTestResultData,
} from '../../helpers/autosave-helpers';
import { SupportInterventionTestCases, InterfaceIds } from '../common/TestEnums';
import { UploadStatus } from '../../../../../common/domain/upload-status';

// TODO: Move to a common folder to be referenced by multiple test scenarios
const autosaveRecord = (appRef: SupportInterventionTestCases, interf: InterfaceIds, status: UploadStatus = null) => {
  return {
    application_reference: appRef,
    interface: interf,
    upload_status: status,
  };
};
// TODO: Move to a common folder to be referenced by multiple test scenarios
const processingRecord = (appRef: SupportInterventionTestCases, interf: InterfaceIds) => {
  return {
    application_reference: appRef,
    interface: interf,
  };
};

const testCases: SupportInterventionTestCases[] = [
  SupportInterventionTestCases.AutosaveNoUploadRecords,
  SupportInterventionTestCases.FullSubNoUploadRecords,
  SupportInterventionTestCases.FullSubTarsProcRsisFailNotifyProc,
  SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyFail,
  SupportInterventionTestCases.FullSubAllThreeFail,
  SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyAccept,
  SupportInterventionTestCases.AutosaveTarsFailNotifyProc,
  SupportInterventionTestCases.AutosaveTarsFailNotifyFail,
  SupportInterventionTestCases.AutosaveTarsFailNotifyAccept,
];

describe('SupportIntervention', () => {
  let db: mysql.Connection;
  let retryProcessor: IRetryProcessor;

  beforeAll(() => {
    db = mysql.createConnection({
      host: 'localhost',
      user: 'results_user',
      database: 'results',
      password: 'Pa55word1',
      port: 3306,
    });
    retryProcessor = new RetryProcessor(db);
  });

  beforeEach(async () => {
    await insertAutosaveTestResultData(db, getTestResultData());
    await insertAutosaveQueueResultData(db, getQueueResultData());
  });

  afterEach(async () => {
    await deleteAutosaveTestResultData(db, 'TEST_RESULT', testCases);
    await deleteAutosaveTestResultData(db, 'UPLOAD_QUEUE', testCases);
  });

  describe('AUTOSAVE - FAILED VALIDATION (NO RECORDS CREATED', () => {

    it('should create a new PROCESSING record for TARS & NOTIFY (NOT RSIS) and set result to PROCESSING', async () => {

      await retryProcessor.processSupportInterventions();
      const autosaveRecords = await getAutosaveQueueRecords(db);
      const processingResults = await getTestResultAppRefsForResultStatus(db, 'PROCESSING');

      expect(autosaveRecords).toContain(
        autosaveRecord(
          SupportInterventionTestCases.AutosaveNoUploadRecords, InterfaceIds.TARS, UploadStatus.PROCESSING));
      expect(autosaveRecords).toContain(
        autosaveRecord(
          SupportInterventionTestCases.AutosaveNoUploadRecords, InterfaceIds.NOTIFY, UploadStatus.PROCESSING));
      expect(autosaveRecords).not.toContain(
        autosaveRecord(
          SupportInterventionTestCases.AutosaveNoUploadRecords, InterfaceIds.RSIS, UploadStatus.PROCESSING));

      expect(processingResults).toContain(SupportInterventionTestCases.AutosaveNoUploadRecords);
    });

  });

  describe('FULL SUBMISSION - FAILED VALIDATION (NO RECORDS CREATED', () => {

    it('should create new records for TARS, NOTIFY & RSIS and set result to PROCESSING (full submission)', async () => {

      await retryProcessor.processSupportInterventions();
      const processingUploadQueueRecords = await getProcessingUploadQueueRecords(db);
      const processingResults = await getTestResultAppRefsForResultStatus(db, 'PROCESSING');

      expect(processingUploadQueueRecords).toContain(
        processingRecord(SupportInterventionTestCases.FullSubNoUploadRecords, InterfaceIds.TARS));
      expect(processingUploadQueueRecords).toContain(
        processingRecord(SupportInterventionTestCases.FullSubNoUploadRecords, InterfaceIds.NOTIFY));
      expect(processingUploadQueueRecords).toContain(
        processingRecord(SupportInterventionTestCases.FullSubNoUploadRecords, InterfaceIds.RSIS));

      expect(processingResults).toContain(SupportInterventionTestCases.FullSubNoUploadRecords);
    });
  });

  describe('FULL SUBMISSION - 1 OR MORE INTERFACES FAILED', () => {
    it('should set result status PENDING->PROCESSING and set and queue status ERROR->PROCESSING', async () => {

      await retryProcessor.processSupportInterventions();
      const processingUploadQueueRecords = await getProcessingUploadQueueRecords(db);
      const processingResults = await getTestResultAppRefsForResultStatus(db, 'PROCESSING');

      expect(processingUploadQueueRecords).toContain(
        processingRecord(SupportInterventionTestCases.FullSubTarsProcRsisFailNotifyProc, InterfaceIds.RSIS));

      expect(processingUploadQueueRecords).toContain(
        processingRecord(SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyFail, InterfaceIds.NOTIFY));
      expect(processingUploadQueueRecords).toContain(
        processingRecord(SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyFail, InterfaceIds.RSIS));

      expect(processingUploadQueueRecords).toContain(
        processingRecord(SupportInterventionTestCases.FullSubAllThreeFail, InterfaceIds.TARS));
      expect(processingUploadQueueRecords).toContain(
        processingRecord(SupportInterventionTestCases.FullSubAllThreeFail, InterfaceIds.NOTIFY));
      expect(processingUploadQueueRecords).toContain(
        processingRecord(SupportInterventionTestCases.FullSubAllThreeFail, InterfaceIds.RSIS));

      expect(processingUploadQueueRecords).toContain(
        processingRecord(SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyAccept, InterfaceIds.RSIS));

      expect(processingResults).toContain(SupportInterventionTestCases.FullSubTarsProcRsisFailNotifyProc);
      expect(processingResults).toContain(SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyFail);
      expect(processingResults).toContain(SupportInterventionTestCases.FullSubAllThreeFail);
      expect(processingResults).toContain(SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyAccept);
    });
  });

  describe('AUTOSAVE - 1 OR MORE INTERFACES FAILED', () => {
    it('should set result status PENDING->PROCESSING (with autosave) and set and queue ERROR->PROCESSING', async () => {

      await retryProcessor.processSupportInterventions();
      const autosaveRecords = await getAutosaveQueueRecords(db);
      const processingResults = await getTestResultAppRefsForResultStatus(db, 'PROCESSING');

      expect(autosaveRecords).toContain(
        autosaveRecord(
          SupportInterventionTestCases.AutosaveTarsFailNotifyProc, InterfaceIds.TARS, UploadStatus.PROCESSING));
      expect(autosaveRecords).toContain(
        autosaveRecord(
          SupportInterventionTestCases.AutosaveTarsFailNotifyProc, InterfaceIds.NOTIFY, UploadStatus.PROCESSING));
      expect(autosaveRecords).not.toContain(
        autosaveRecord(
          SupportInterventionTestCases.AutosaveTarsFailNotifyProc, InterfaceIds.RSIS, UploadStatus.PROCESSING));

      expect(autosaveRecords).toContain(
        autosaveRecord(
          SupportInterventionTestCases.AutosaveTarsFailNotifyFail, InterfaceIds.TARS, UploadStatus.PROCESSING));
      expect(autosaveRecords).toContain(
        autosaveRecord(
          SupportInterventionTestCases.AutosaveTarsFailNotifyFail, InterfaceIds.NOTIFY, UploadStatus.PROCESSING));
      expect(autosaveRecords).not.toContain(
        autosaveRecord(
          SupportInterventionTestCases.AutosaveTarsFailNotifyFail, InterfaceIds.RSIS, UploadStatus.PROCESSING));

      expect(autosaveRecords).toContain(
        autosaveRecord(
          SupportInterventionTestCases.AutosaveTarsFailNotifyAccept, InterfaceIds.TARS, UploadStatus.PROCESSING));
      expect(autosaveRecords).toContain(
        autosaveRecord(
          SupportInterventionTestCases.AutosaveTarsFailNotifyAccept, InterfaceIds.NOTIFY, UploadStatus.ACCEPTED));
      expect(autosaveRecords).not.toContain(
        autosaveRecord(
          SupportInterventionTestCases.AutosaveTarsFailNotifyAccept, InterfaceIds.RSIS, UploadStatus.PROCESSING));

      expect(processingResults).toContain(SupportInterventionTestCases.AutosaveTarsFailNotifyProc);
      expect(processingResults).toContain(SupportInterventionTestCases.AutosaveTarsFailNotifyFail);
      expect(processingResults).toContain(SupportInterventionTestCases.AutosaveTarsFailNotifyAccept);
    });
  });
});
