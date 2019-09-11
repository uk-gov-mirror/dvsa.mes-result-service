import * as mysql from 'mysql2';
import { IRetryProcessor } from '../IRetryProcessor';
import { RetryProcessor } from '../RetryProcessor';
import {
  getAutosaveQueueRecords,
  insertAutosaveTestResultData,
  deleteAutosaveTestResultData,
  insertAutosaveQueueResultData,
} from '../helpers/autosave-helpers';
import { AutosaveTestData } from '../helpers/mock-test-data';
import { AutosaveQueueData } from '../mock-queue-data';

describe('Clean up operations', () => {
  let db: mysql.Connection;
  let retryProcessor: IRetryProcessor;

  beforeAll(async () => {
    db = mysql.createConnection({
      host: 'localhost',
      user: 'results_user',
      database: 'results',
      password: 'Pa55word1',
      port: 3306,
    });
    retryProcessor = new RetryProcessor(db);
  });

  describe('Clean up PROCESSED UPLOAD_QUEUE records', () => {
    beforeEach(async () => {
      const testResultData = getTestResultData();
      const queueResultData = getQueueResultData();

      await insertAutosaveTestResultData(db, testResultData);
      await insertAutosaveQueueResultData(db, queueResultData);
    });

    afterEach(async () => {
      await deleteAutosaveTestResultData(db, 'TEST_RESULT', [56, 57, 58, 59]);
      await deleteAutosaveTestResultData(db, 'UPLOAD_QUEUE', [56, 57, 58, 59]);
    });

    it('should delete UPLOAD_QUEUE records that are PROCESSED with a timestamp less than the start_date provided',
       async () => {
         const changedRowCount = await retryProcessor.processOldEntryCleanup(1);
         const autosaveQueueRecords = await getAutosaveQueueRecords(db);

         expect(changedRowCount).toBe(3);

        // assert UPLOAD_QUEUE records have been deleted for app-ref 56 and 57
         expect(autosaveQueueRecords).not.toContain(
           {
             application_reference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisAccepted,
             interface: 0,
             upload_status: 1,
           });
         expect(autosaveQueueRecords).not.toContain(
           {
             application_reference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisAccepted,
             interface: 1,
             upload_status: 1,
           });
         expect(autosaveQueueRecords).not.toContain(
           {
             application_reference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisAccepted,
             interface: 2,
             upload_status: 1,
           });

        // assert UPLOAD_QUEUE records have been retained for app-ref 58
         expect(autosaveQueueRecords).toContain(
           {
             application_reference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
             interface: 0,
             upload_status: 1,
           });
         expect(autosaveQueueRecords).toContain(
           {
             application_reference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
             interface: 1,
             upload_status: 1,
           });
         expect(autosaveQueueRecords).toContain(
           {
             application_reference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
             interface: 2,
             upload_status: 0,
           });
       });

  });

  const getTestResultData = (): AutosaveTestData[] => {
    return [
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisAccepted,
        staffNumber: '1',
        driverSurname: 'Bloggs',
        resultStatus: 1, // ACCEPTED
        autosave: true,
      },
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
        staffNumber: '1',
        driverSurname: 'Bloggs',
        resultStatus: 0, // ACCEPTED
        autosave: true,
      },
    ];
  };

  const getQueueResultData = (): AutosaveQueueData[] => {
    return [
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisAccepted,
        staffNumber: '1',
        timestamp: '2019-09-01 13:59:59',
        interface: 0, // TARS
        uploadStatus: 1, // ACCEPTED
        retryCount: 0,
      },
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisAccepted,
        staffNumber: '1',
        timestamp: '2019-09-01 13:59:59',
        interface: 1, // NOTIFY
        uploadStatus: 1, // ACCEPTED
        retryCount: 0,
      },
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisAccepted,
        staffNumber: '1',
        timestamp: '2019-09-01 13:59:59',
        interface: 2, // RSIS
        uploadStatus: 1, // ACCEPTED
        retryCount: 0,
      },
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
        staffNumber: '1',
        timestamp: '2019-09-01 13:59:59',
        interface: 0, // TARS
        uploadStatus: 1, // ACCEPTED
        retryCount: 0,
      },
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
        staffNumber: '1',
        timestamp: '2019-09-01 13:59:59',
        interface: 1, // NOTIFY
        uploadStatus: 1, // ACCEPTED
        retryCount: 0,
      },
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
        staffNumber: '1',
        timestamp: '2019-09-01 13:59:59',
        interface: 2, // RSIS
        uploadStatus: 0, // ACCEPTED
        retryCount: 0,
      },
    ];
  };

});

export enum RetryUploadCleanUpTestCases {
  TarsAcceptedNotifyAcceptedRsisAccepted = 56,
  TarsAcceptedNotifyAcceptedRsisProcessing = 57,
}
