import * as mysql from 'mysql2';
import { RetryProcessor } from '../RetryProcessor';
import { IRetryProcessor } from '../IRetryProcessor';
import {
  getErroredTestAppRefs,
  getTestResultAppRefsForResultStatus,
  getAllUploadQueueRecords,
  getProcessingUploadQueueRecords,
  getAppRefInterfaceCombosWithProcessingStatusAndRetriesOccurred,
} from './common/HelperSQLQueries';

describe('RetryProcessor database test', () => {
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

  /**
   * See the test data scripts in /spec/infra for the scenarios being tested here.
   */
  describe('Query correctness', () => {
    it('should move TEST_RESULTs with all successful UPLOAD_QUEUE records to PROCESSED', async () => {
      const changedRowCount = await retryProcessor.processSuccessful();
      const acceptedTestAppRefs = await getTestResultAppRefsForResultStatus(db, 'PROCESSED');
      expect(changedRowCount).toBe(1);
      expect(acceptedTestAppRefs).toContain(9);
    });

    it('should mark UPLOAD_QUEUE for reprocessing when they failed but not exceeded the retry limit', async () => {
      const changedRowCount = await retryProcessor.processErrorsToRetry(3, 3, 3);
      const appRefInterfaces = await getAppRefInterfaceCombosWithProcessingStatusAndRetriesOccurred(db);

      expect(changedRowCount).toBe(18);
      // TARS
      expect(appRefInterfaces).toContain({ application_reference: 11, interface: 0 });
      expect(appRefInterfaces).toContain({ application_reference: 14, interface: 0 });
      expect(appRefInterfaces).toContain({ application_reference: 15, interface: 0 });
      expect(appRefInterfaces).toContain({ application_reference: 17, interface: 0 });
      // NOTIFY
      expect(appRefInterfaces).toContain({ application_reference: 13, interface: 1 });
      expect(appRefInterfaces).toContain({ application_reference: 15, interface: 1 });
      expect(appRefInterfaces).toContain({ application_reference: 16, interface: 1 });
      expect(appRefInterfaces).toContain({ application_reference: 17, interface: 1 });
      // RSIS
      expect(appRefInterfaces).toContain({ application_reference: 12, interface: 2 });
      expect(appRefInterfaces).toContain({ application_reference: 14, interface: 2 });
      expect(appRefInterfaces).toContain({ application_reference: 16, interface: 2 });
      expect(appRefInterfaces).toContain({ application_reference: 17, interface: 2 });
    });

    it('should abort TEST_RESULT records that have exceeded the retry count for any interface', async () => {
      const changedRowCount = await retryProcessor.processErrorsToAbort(3, 3, 3);
      const erroredTestAppRefs = await getErroredTestAppRefs(db);

      expect(changedRowCount).toBe(12);
      expect(erroredTestAppRefs).toContain(25); // Failed TARS
      expect(erroredTestAppRefs).toContain(26); // Failed RSIS
      expect(erroredTestAppRefs).toContain(27); // Failed Notify
      expect(erroredTestAppRefs).toContain(28); // Failed TARS+RSIS
      expect(erroredTestAppRefs).toContain(29); // Failed TARS+Notify
      expect(erroredTestAppRefs).toContain(30); // Failed RSIS+Notify
      expect(erroredTestAppRefs).toContain(31); // Failed TARS+RSIS+Notify
    });

    it('should update TEST_RESULT and UPLOAD_QUEUE to make them ready for reprocessing post intervention', async () => {
      const changedRowCount = await retryProcessor.processSupportInterventions();
      const processingAppRefs = await getTestResultAppRefsForResultStatus(db, 'PROCESSING');
      const processingUploadQueueRecords = await getProcessingUploadQueueRecords(db);

      expect(changedRowCount).toBe(45);
      // TEST_RESULT test_status PENDING -> PROCESSING
      expect(processingAppRefs).toContain(39);
      expect(processingAppRefs).toContain(40);
      expect(processingAppRefs).toContain(41);
      expect(processingAppRefs).toContain(42);
      expect(processingAppRefs).toContain(43);
      expect(processingAppRefs).toContain(44);
      expect(processingAppRefs).toContain(45);
      // UPLOAD_QUEUE upload_status ERROR -> PROCESSING
      expect(processingUploadQueueRecords).toContain({ application_reference: 39, interface: 0 });
      expect(processingUploadQueueRecords).toContain({ application_reference: 40, interface: 2 });
      expect(processingUploadQueueRecords).toContain({ application_reference: 41, interface: 1 });
      expect(processingUploadQueueRecords).toContain({ application_reference: 42, interface: 0 });
      expect(processingUploadQueueRecords).toContain({ application_reference: 42, interface: 2 });
      expect(processingUploadQueueRecords).toContain({ application_reference: 43, interface: 0 });
      expect(processingUploadQueueRecords).toContain({ application_reference: 43, interface: 1 });
      expect(processingUploadQueueRecords).toContain({ application_reference: 44, interface: 1 });
      expect(processingUploadQueueRecords).toContain({ application_reference: 44, interface: 2 });
      expect(processingUploadQueueRecords).toContain({ application_reference: 45, interface: 0 });
      expect(processingUploadQueueRecords).toContain({ application_reference: 45, interface: 1 });
      expect(processingUploadQueueRecords).toContain({ application_reference: 45, interface: 2 });
    });

  });
});
