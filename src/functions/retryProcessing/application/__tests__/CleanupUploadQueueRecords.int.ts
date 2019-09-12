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
import { RetryUploadCleanUpTestCases, InterfaceIds } from './common/TestEnums';
import { ProcessingStatus } from '../../../../common/domain/processing-status';

describe('Clean up operations', () => {
  let db: mysql.Connection;
  let retryProcessor: IRetryProcessor;
  const testCases: RetryUploadCleanUpTestCases[] =
    [
      RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisAccepted,
      RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
    ];

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
      await deleteAutosaveTestResultData(db, 'TEST_RESULT', testCases);
      await deleteAutosaveTestResultData(db, 'UPLOAD_QUEUE', testCases);
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
             interface: InterfaceIds.TARS,
             upload_status: ProcessingStatus.ACCEPTED,
           });
         expect(autosaveQueueRecords).not.toContain(
           {
             application_reference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisAccepted,
             interface: InterfaceIds.NOTIFY,
             upload_status: ProcessingStatus.ACCEPTED,
           });
         expect(autosaveQueueRecords).not.toContain(
           {
             application_reference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisAccepted,
             interface: InterfaceIds.RSIS,
             upload_status: ProcessingStatus.ACCEPTED,
           });

        // assert UPLOAD_QUEUE records have been retained for app-ref 58
         expect(autosaveQueueRecords).toContain(
           {
             application_reference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
             interface: InterfaceIds.TARS,
             upload_status: ProcessingStatus.ACCEPTED,
           });
         expect(autosaveQueueRecords).toContain(
           {
             application_reference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
             interface: InterfaceIds.NOTIFY,
             upload_status: ProcessingStatus.ACCEPTED,
           });
         expect(autosaveQueueRecords).toContain(
           {
             application_reference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
             interface: InterfaceIds.RSIS,
             upload_status: ProcessingStatus.PROCESSING,
           });
       });

  });

  const getTestResultData = (): AutosaveTestData[] => {
    return [
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisAccepted,
        staffNumber: '1',
        driverSurname: 'Bloggs',
        resultStatus: ProcessingStatus.ACCEPTED, // ACCEPTED
        autosave: true,
      },
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
        staffNumber: '1',
        driverSurname: 'Bloggs',
        resultStatus: ProcessingStatus.PROCESSING, // ACCEPTED
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
        interface: InterfaceIds.TARS, // TARS
        uploadStatus: ProcessingStatus.ACCEPTED, // ACCEPTED
        retryCount: 0,
      },
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisAccepted,
        staffNumber: '1',
        timestamp: '2019-09-01 13:59:59',
        interface: InterfaceIds.NOTIFY, // NOTIFY
        uploadStatus: ProcessingStatus.ACCEPTED, // ACCEPTED
        retryCount: 0,
      },
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisAccepted,
        staffNumber: '1',
        timestamp: '2019-09-01 13:59:59',
        interface: InterfaceIds.RSIS, // RSIS
        uploadStatus: ProcessingStatus.ACCEPTED, // ACCEPTED
        retryCount: 0,
      },
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
        staffNumber: '1',
        timestamp: '2019-09-01 13:59:59',
        interface: InterfaceIds.TARS, // TARS
        uploadStatus: ProcessingStatus.ACCEPTED, // ACCEPTED
        retryCount: 0,
      },
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
        staffNumber: '1',
        timestamp: '2019-09-01 13:59:59',
        interface: InterfaceIds.NOTIFY, // NOTIFY
        uploadStatus: ProcessingStatus.ACCEPTED, // ACCEPTED
        retryCount: 0,
      },
      {
        applicationReference: RetryUploadCleanUpTestCases.TarsAcceptedNotifyAcceptedRsisProcessing,
        staffNumber: '1',
        timestamp: '2019-09-01 13:59:59',
        interface: InterfaceIds.RSIS, // RSIS
        uploadStatus: ProcessingStatus.PROCESSING, // ACCEPTED
        retryCount: 0,
      },
    ];
  };

});
