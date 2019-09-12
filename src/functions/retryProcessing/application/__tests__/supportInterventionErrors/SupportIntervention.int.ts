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
  TestCases,
  Interface,
  UploadStatus,
} from './supportInterventionTestData';
import {
  insertAutosaveTestResultData,
  insertAutosaveQueueResultData,
  deleteAutosaveTestResultData,
} from '../../helpers/autosave-helpers';

// TODO: Move to a common folder to be referenced by multiple test scenarios
const autosaveRecord = (appRef: TestCases, interf: Interface, status: UploadStatus = null) => {
  return {
    application_reference: appRef,
    interface: interf,
    upload_status: status,
  };
};
// TODO: Move to a common folder to be referenced by multiple test scenarios
const processingRecord = (appRef: TestCases, interf: Interface) => {
  return {
    application_reference: appRef,
    interface: interf,
  };
};

const testCasesArray: TestCases[] = [
  TestCases.AutosaveNoUploadRecords,
  TestCases.FullSubNoUploadRecords,
  TestCases.FullSubTarsProcRsisFailNotifyProc,
  TestCases.FullSubTarsAcceptRsisFailNotifyFail,
  TestCases.FullSubAllThreeFail,
  TestCases.FullSubTarsAcceptRsisFailNotifyAccept,
  TestCases.AutosaveTarsFailNotifyProc,
  TestCases.AutosaveTarsFailNotifyFail,
  TestCases.AutosaveTarsFailNotifyAccept,
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
    await deleteAutosaveTestResultData(db, 'TEST_RESULT', testCasesArray);
    await deleteAutosaveTestResultData(db, 'UPLOAD_QUEUE', testCasesArray);
  });

  describe('AUTOSAVE - FAILED VALIDATION (NO RECORDS CREATED', () => {

    it('should create a new PROCESSING record for TARS & NOTIFY (NOT RSIS) and set result to PROCESSING', async () => {

      await retryProcessor.processSupportInterventions();
      const autosaveRecords = await getAutosaveQueueRecords(db);
      const processingResults = await getTestResultAppRefsForResultStatus(db, 'PROCESSING');

      expect(autosaveRecords).toContain(
        autosaveRecord(TestCases.AutosaveNoUploadRecords, Interface.TARS, UploadStatus.PROCESSING));
      expect(autosaveRecords).toContain(
        autosaveRecord(TestCases.AutosaveNoUploadRecords, Interface.NOTIFY, UploadStatus.PROCESSING));
      expect(autosaveRecords).not.toContain(
        autosaveRecord(TestCases.AutosaveNoUploadRecords, Interface.RSIS, UploadStatus.PROCESSING));

      expect(processingResults).toContain(TestCases.AutosaveNoUploadRecords);
    });

  });

  describe('FULL SUBMISSION - FAILED VALIDATION (NO RECORDS CREATED', () => {

    it('should create new records for TARS, NOTIFY & RSIS and set result to PROCESSING (full submission)', async () => {

      await retryProcessor.processSupportInterventions();
      const processingUploadQueueRecords = await getProcessingUploadQueueRecords(db);
      const processingResults = await getTestResultAppRefsForResultStatus(db, 'PROCESSING');

      expect(processingUploadQueueRecords).toContain(
        processingRecord(TestCases.FullSubNoUploadRecords, Interface.TARS));
      expect(processingUploadQueueRecords).toContain(
        processingRecord(TestCases.FullSubNoUploadRecords, Interface.NOTIFY));
      expect(processingUploadQueueRecords).toContain(
        processingRecord(TestCases.FullSubNoUploadRecords, Interface.RSIS));

      expect(processingResults).toContain(TestCases.FullSubNoUploadRecords);
    });
  });

  describe('FULL SUBMISSION - 1 OR MORE INTERFACES FAILED', () => {
    it('should set result status PENDING->PROCESSING and set and queue status ERROR->PROCESSING', async () => {

      await retryProcessor.processSupportInterventions();
      const processingUploadQueueRecords = await getProcessingUploadQueueRecords(db);
      const processingResults = await getTestResultAppRefsForResultStatus(db, 'PROCESSING');

      expect(processingUploadQueueRecords).toContain(
        processingRecord(TestCases.FullSubTarsProcRsisFailNotifyProc, Interface.RSIS));

      expect(processingUploadQueueRecords).toContain(
        processingRecord(TestCases.FullSubTarsAcceptRsisFailNotifyFail, Interface.NOTIFY));
      expect(processingUploadQueueRecords).toContain(
        processingRecord(TestCases.FullSubTarsAcceptRsisFailNotifyFail, Interface.RSIS));

      expect(processingUploadQueueRecords).toContain(
        processingRecord(TestCases.FullSubAllThreeFail, Interface.TARS));
      expect(processingUploadQueueRecords).toContain(
        processingRecord(TestCases.FullSubAllThreeFail, Interface.NOTIFY));
      expect(processingUploadQueueRecords).toContain(
        processingRecord(TestCases.FullSubAllThreeFail, Interface.RSIS));

      expect(processingUploadQueueRecords).toContain(
        processingRecord(TestCases.FullSubTarsAcceptRsisFailNotifyAccept, Interface.RSIS));

      expect(processingResults).toContain(TestCases.FullSubTarsProcRsisFailNotifyProc);
      expect(processingResults).toContain(TestCases.FullSubTarsAcceptRsisFailNotifyFail);
      expect(processingResults).toContain(TestCases.FullSubAllThreeFail);
      expect(processingResults).toContain(TestCases.FullSubTarsAcceptRsisFailNotifyAccept);
    });
  });

  describe('AUTOSAVE - 1 OR MORE INTERFACES FAILED', () => {
    it('should set result status PENDING->PROCESSING (with autosave) and set and queue ERROR->PROCESSING', async () => {

      await retryProcessor.processSupportInterventions();
      const autosaveRecords = await getAutosaveQueueRecords(db);
      const processingResults = await getTestResultAppRefsForResultStatus(db, 'PROCESSING');

      expect(autosaveRecords).toContain(
        autosaveRecord(TestCases.AutosaveTarsFailNotifyProc, Interface.TARS, UploadStatus.PROCESSING));
      expect(autosaveRecords).toContain(
        autosaveRecord(TestCases.AutosaveTarsFailNotifyProc, Interface.NOTIFY, UploadStatus.PROCESSING));
      expect(autosaveRecords).not.toContain(
        autosaveRecord(TestCases.AutosaveTarsFailNotifyProc, Interface.RSIS, UploadStatus.PROCESSING));

      expect(autosaveRecords).toContain(
        autosaveRecord(TestCases.AutosaveTarsFailNotifyFail, Interface.TARS, UploadStatus.PROCESSING));
      expect(autosaveRecords).toContain(
        autosaveRecord(TestCases.AutosaveTarsFailNotifyFail, Interface.NOTIFY, UploadStatus.PROCESSING));
      expect(autosaveRecords).not.toContain(
        autosaveRecord(TestCases.AutosaveTarsFailNotifyFail, Interface.RSIS, UploadStatus.PROCESSING));

      expect(autosaveRecords).toContain(
        autosaveRecord(TestCases.AutosaveTarsFailNotifyAccept, Interface.TARS, UploadStatus.PROCESSING));
      expect(autosaveRecords).toContain(
        autosaveRecord(TestCases.AutosaveTarsFailNotifyAccept, Interface.NOTIFY, UploadStatus.ACCEPTED));
      expect(autosaveRecords).not.toContain(
        autosaveRecord(TestCases.AutosaveTarsFailNotifyAccept, Interface.RSIS, UploadStatus.PROCESSING));

      expect(processingResults).toContain(TestCases.AutosaveTarsFailNotifyProc);
      expect(processingResults).toContain(TestCases.AutosaveTarsFailNotifyFail);
      expect(processingResults).toContain(TestCases.AutosaveTarsFailNotifyAccept);
    });
  });
});
