import * as mysql from 'mysql2';
import { RetryProcessor } from '../RetryProcessor';
import { IRetryProcessor } from '../IRetryProcessor';
import { getErroredTestAppRefs } from './common/HelperSQLQueries';

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
      const acceptedTestAppRefs = await getTestResultAppRefsForResultStatus('PROCESSED');
      expect(changedRowCount).toBe(3);
      expect(acceptedTestAppRefs).toContain(9);
      expect(acceptedTestAppRefs).toContain(10);
    });

    it('should mark UPLOAD_QUEUE for reprocessing when they failed but not exceeded the retry limit', async () => {
      const changedRowCount = await retryProcessor.processErrorsToRetry(3, 3, 3);
      const appRefInterfaces = await getAppRefInterfaceCombosWithProcessingStatusAndRetriesOccurred();

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
      const processingAppRefs = await getTestResultAppRefsForResultStatus('PROCESSING');
      const processingUploadQueueRecords = await getProcessingUploadQueueRecords();

      expect(changedRowCount).toBe(45);
      // TEST_RESULT test_status PENDING -> PROCESSING
      expect(processingAppRefs).toContain(39);
      expect(processingAppRefs).toContain(40);
      expect(processingAppRefs).toContain(41);
      expect(processingAppRefs).toContain(42);
      expect(processingAppRefs).toContain(43);
      expect(processingAppRefs).toContain(44);
      expect(processingAppRefs).toContain(45);
      expect(processingAppRefs).toContain(55);
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
      expect(processingUploadQueueRecords).toContain({ application_reference: 55, interface: 1 });
      expect(processingUploadQueueRecords).toContain({ application_reference: 55, interface: 2 });
    });

    it('should clean out old UPLOAD_QUEUE records', async () => {
      const deletedRowCount = await retryProcessor.processOldEntryCleanup(30);
      const allUploadQueueRecords = await getAllUploadQueueRecords();

      expect(deletedRowCount).toBe(3);
      expect(allUploadQueueRecords.some(record => record.application_reference === 53)).toBe(false);
      expect(allUploadQueueRecords.some(record => record.application_reference === 54)).toBe(true);
    });
  });

  const getTestResultAppRefsForResultStatus = (resultStatus: string): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT application_reference FROM TEST_RESULT
        WHERE result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = '${resultStatus}')
        `,
        [],
        (err, results, fields) => {
          if (err) {
            reject(err);
          }
          resolve(results.map(row => row.application_reference));
        });
    });
  };

  interface AppRefInterface {
    application_reference: number;
    interface: number;
  }

  const getAppRefInterfaceCombosWithProcessingStatusAndRetriesOccurred = (): Promise<AppRefInterface[]> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT application_reference, interface
        FROM UPLOAD_QUEUE
        WHERE
          retry_count > 0
          AND upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'PROCESSING');
        `,
        [],
        (err, results, fields) => {
          if (err) {
            reject(err);
          }
          resolve(results.map(row => ({ application_reference: row.application_reference, interface: row.interface })));
        });
    });
  };

  const getProcessingUploadQueueRecords = (): Promise<AppRefInterface[]> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT application_reference, interface FROM UPLOAD_QUEUE
        WHERE
          upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'PROCESSING')
        `,
        [],
        (err, results, fields) => {
          if (err) {
            reject(err);
          }
          resolve(results.map(row => ({ application_reference: row.application_reference, interface: row.interface })));
        });
    });
  };

  const getAllUploadQueueRecords = (): Promise<AppRefInterface[]> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT application_reference, interface FROM UPLOAD_QUEUE
        `,
        [],
        (err, results, fields) => {
          if (err) {
            reject(err);
          }
          resolve(results.map(row => ({ application_reference: row.application_reference, interface: row.interface })));
        });
    });
  };

});
