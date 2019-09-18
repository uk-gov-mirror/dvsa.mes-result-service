import { StalledSubmissionTestResultCases, InterfaceIds } from './common/TestEnums';
import { IRetryProcessor } from '../IRetryProcessor';
import * as mysql from 'mysql2';
import { RetryProcessor } from '../RetryProcessor';
import {
  insertAutosaveTestResultData,
  insertAutosaveQueueResultData,
  deleteAutosaveTestResultData,
  getAutosaveQueueRecords,
  getAutosaveTestResultRecords,
} from '../helpers/autosave-helpers';
import { ProcessingStatus } from '../../../../common/domain/processing-status';
import { AutosaveTestData } from '../helpers/mock-test-data';
import { AutosaveQueueData } from '../mock-queue-data';
import { UploadStatus } from '../../../../common/domain/upload-status';

describe('AutosaveStalledSubmissionProcessing', () => {
  const testCases: StalledSubmissionTestResultCases[] = [
    StalledSubmissionTestResultCases.AutosavedDateInPastNoRsisUpload,
    StalledSubmissionTestResultCases.AutosavedDateNotInPastNoRsisUpload,
    StalledSubmissionTestResultCases.NotAutosavedDateInPastNoRsisUpload,
    StalledSubmissionTestResultCases.NotAutosavedDateNotInPastNoRsisUpload,
  ];

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
    const testResultData = getTestResultData();
    const queueResultData = getQueueResultData();

    await insertAutosaveTestResultData(db, testResultData);
    await insertAutosaveQueueResultData(db, queueResultData);
  });

  afterEach(async () => {
    await deleteAutosaveTestResultData(db, 'TEST_RESULT', testCases);
    await deleteAutosaveTestResultData(db, 'UPLOAD_QUEUE', testCases);
  });

  it('should add one RSIS record for an autosaved record with a date in the past', async () => {
    const createdRowCount = await retryProcessor.processStalledTestResults(15);
    const autosaveQueueRecords = await getAutosaveQueueRecords(db);

    expect(createdRowCount).toBe(1);

    expect(autosaveQueueRecords).toContain(
      {
        application_reference: StalledSubmissionTestResultCases.AutosavedDateInPastNoRsisUpload,
        interface: InterfaceIds.TARS,
        upload_status: UploadStatus.PROCESSING,
      },
    );
    expect(autosaveQueueRecords).toContain(
      {
        application_reference: StalledSubmissionTestResultCases.AutosavedDateInPastNoRsisUpload,
        interface: InterfaceIds.NOTIFY,
        upload_status: UploadStatus.PROCESSING,
      },
    );
    expect(autosaveQueueRecords).toContain(
      {
        application_reference: StalledSubmissionTestResultCases.AutosavedDateInPastNoRsisUpload,
        interface: InterfaceIds.RSIS,
        upload_status: UploadStatus.PROCESSING,
      },
    );

    expect(autosaveQueueRecords).not.toContain(
      {
        application_reference: StalledSubmissionTestResultCases.AutosavedDateNotInPastNoRsisUpload,
        interface: InterfaceIds.RSIS,
        upload_status: UploadStatus.PROCESSING,
      },
    );

    expect(autosaveQueueRecords).not.toContain(
      {
        application_reference: StalledSubmissionTestResultCases.NotAutosavedDateInPastNoRsisUpload,
        interface: InterfaceIds.RSIS,
        upload_status: UploadStatus.PROCESSING,
      },
    );

    expect(autosaveQueueRecords).not.toContain(
      {
        application_reference: StalledSubmissionTestResultCases.NotAutosavedDateNotInPastNoRsisUpload,
        interface: InterfaceIds.RSIS,
        upload_status: UploadStatus.PROCESSING,
      },
    );
  });
});

const getTestResultData = (): AutosaveTestData[] => {
  return [
    {
      applicationReference: StalledSubmissionTestResultCases.AutosavedDateInPastNoRsisUpload,
      staffNumber: '1',
      testDate: '2019-09-01',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: true,
    },
    {
      applicationReference: StalledSubmissionTestResultCases.AutosavedDateNotInPastNoRsisUpload,
      staffNumber: '1',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: true,
    },
    {
      applicationReference: StalledSubmissionTestResultCases.NotAutosavedDateInPastNoRsisUpload,
      staffNumber: '1',
      testDate: '2019-09-01',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: false,
    },
    {
      applicationReference: StalledSubmissionTestResultCases.NotAutosavedDateNotInPastNoRsisUpload,
      staffNumber: '1',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: false,
    },
  ];
};

const getQueueResultData = (): AutosaveQueueData[] => {
  return [
    {
      applicationReference: StalledSubmissionTestResultCases.AutosavedDateInPastNoRsisUpload,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: StalledSubmissionTestResultCases.AutosavedDateInPastNoRsisUpload,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: StalledSubmissionTestResultCases.AutosavedDateNotInPastNoRsisUpload,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: StalledSubmissionTestResultCases.AutosavedDateNotInPastNoRsisUpload,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: StalledSubmissionTestResultCases.NotAutosavedDateInPastNoRsisUpload,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: StalledSubmissionTestResultCases.NotAutosavedDateInPastNoRsisUpload,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: StalledSubmissionTestResultCases.NotAutosavedDateNotInPastNoRsisUpload,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: StalledSubmissionTestResultCases.NotAutosavedDateNotInPastNoRsisUpload,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
      timestamp: null,
    },
  ];
};
