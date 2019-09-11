import * as mysql from 'mysql2';
import { RetryProcessor } from '../RetryProcessor';
import { IRetryProcessor } from '../IRetryProcessor';
import { getErroredTestAppRefs } from './common/HelperSQLQueries';
import { AutosaveTestData } from '../helpers/mock-test-data';
import moment = require('moment');
import { create } from 'domain';

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
  beforeEach(async () => {
    await createRetryScenarios();
  });

  afterEach(async () => {
    await truncateTestresults();
    await truncateUploadQueue();
  });

  /**
   * See the test data scripts in /spec/infra for the scenarios being tested here.
   */
  describe('Query correctness', () => {
    it('should move TEST_RESULTs with all successful UPLOAD_QUEUE records to PROCESSED', async () => {
      const changedRowCount = await retryProcessor.processSuccessful();
      const acceptedTestAppRefs = await getTestResultAppRefsForResultStatus('PROCESSED');
      expect(changedRowCount).toBe(1);
      expect(acceptedTestAppRefs).toContain(9);
    });

    it('should mark UPLOAD_QUEUE for reprocessing when they failed but not exceeded the retry limit', async () => {
      const changedRowCount = await retryProcessor.processErrorsToRetry(3, 3, 3);
      const appRefInterfaces = await getAppRefInterfaceCombosWithProcessingStatusAndRetriesOccurred();

      expect(changedRowCount).toBe(12);
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

      expect(changedRowCount).toBe(7);
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
  const truncateTestresults = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      db.query(
          `
          TRUNCATE TABLE TEST_RESULT
          `,
          [],
          (err, results, fields) => {
            if (err) {
              reject(err);
            }
            resolve(1);
          });
    });
  };
  const truncateUploadQueue = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      db.query(
          `
          TRUNCATE TABLE UPLOAD_QUEUE
          `,
          [],
          (err, results, fields) => {
            if (err) {
              reject(err);
            }
            resolve(1);
          });
    });
  };
  const createRetryScenario = (appRef: number, resultStatus: string,
                               dateTime: string,
                               tarsStatus: string,
                               tarsRetryCount: number,
                               rsisStatus: string,
                               rsisRetryCount: number,
                               notifyStatus: string,
                               notifyRetryCount: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      const formattedQuery = db.format(
            `CALL sp_create_retry_process_scenario(?,?,?,?,?,?,?,?,?)`, [
              appRef, resultStatus, dateTime, tarsStatus, tarsRetryCount,
              rsisStatus, rsisRetryCount, notifyStatus, notifyRetryCount]);
      db.query(
                formattedQuery,
                [],
                (err, results, fields) => {
                  if (err) {
                    reject(err);
                  }
                  resolve(1);
                });

    });
  };

  const createRetryScenarios  = async () => {
    const today = moment().format('YYYY-MM-DD HH:mm:ss');
    const todayMinus31 = moment().subtract(31, 'days').format('YYYY-MM-DD HH:mm:ss');

    // #############################################################
    // # Scenarios
    // # https://wiki.dvsacloud.uk/display/MES/Retry+Lambda+Scenarios
    // #############################################################
    await createRetryScenario(1, 'PROCESSING', today, 'PROCESSING', 0, 'PROCESSING', 0, 'PROCESSING', 0);
    await createRetryScenario(2, 'ERROR', today, 'PROCESSING', 0, 'PROCESSING', 0, 'PROCESSING', 0);
    await createRetryScenario(3, 'PROCESSING', today, 'PROCESSING', 0, 'ACCEPTED', 2, 'ACCEPTED', 0);
    await createRetryScenario(4, 'PROCESSING', today, 'ACCEPTED', 2, 'PROCESSING', 0, 'ACCEPTED', 2);
    await createRetryScenario(5, 'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'PROCESSING', 0);
    await createRetryScenario(6, 'PROCESSING', today, 'PROCESSING', 0, 'PROCESSING', 0, 'ACCEPTED', 2);
    await createRetryScenario(7, 'PROCESSING', today, 'PROCESSING', 0, 'ACCEPTED', 2, 'PROCESSING', 0);
    await createRetryScenario(8, 'PROCESSING', today, 'ACCEPTED', 2, 'PROCESSING', 0, 'PROCESSING', 0);
    await createRetryScenario(9, 'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(10, 'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, null, null);
    await createRetryScenario(11, 'PROCESSING', today, 'FAILED', 2, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(12, 'PROCESSING', today, 'ACCEPTED', 2, 'FAILED', 2, 'ACCEPTED', 2);
    await createRetryScenario(13, 'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'FAILED', 2);
    await createRetryScenario(14, 'PROCESSING', today, 'FAILED', 2, 'FAILED', 2, 'ACCEPTED', 2);
    await createRetryScenario(15, 'PROCESSING', today, 'FAILED', 2, 'ACCEPTED', 2, 'FAILED', 2);
    await createRetryScenario(16, 'PROCESSING', today, 'ACCEPTED', 2, 'FAILED', 2, 'FAILED', 2);
    await createRetryScenario(17, 'PROCESSING', today, 'FAILED', 2, 'FAILED', 2, 'FAILED', 2);
    await createRetryScenario(18, 'PROCESSING', today, 'PROCESSING', 2, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(19, 'PROCESSING', today, 'ACCEPTED', 2, 'PROCESSING', 2, 'ACCEPTED', 2);
    await createRetryScenario(20, 'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'PROCESSING', 2);
    await createRetryScenario(21, 'PROCESSING', today, 'PROCESSING', 2, 'PROCESSING', 2, 'ACCEPTED', 2);
    await createRetryScenario(22, 'PROCESSING', today, 'PROCESSING', 2, 'ACCEPTED', 2, 'PROCESSING', 2);
    await createRetryScenario(23, 'PROCESSING', today, 'ACCEPTED', 2, 'PROCESSING', 2, 'PROCESSING', 2);
    await createRetryScenario(24, 'PROCESSING', today, 'PROCESSING', 2, 'PROCESSING', 2, 'PROCESSING', 2);
    await createRetryScenario(25, 'PROCESSING', today, 'FAILED', 9, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(26, 'PROCESSING', today, 'ACCEPTED', 2, 'FAILED', 9, 'ACCEPTED', 2);
    await createRetryScenario(27, 'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'FAILED', 9);
    await createRetryScenario(28, 'PROCESSING', today, 'FAILED', 9, 'FAILED', 9, 'ACCEPTED', 2);
    await createRetryScenario(29, 'PROCESSING', today, 'FAILED', 9, 'ACCEPTED', 2, 'FAILED', 9);
    await createRetryScenario(30, 'PROCESSING', today, 'ACCEPTED', 2, 'FAILED', 9, 'FAILED', 9);
    await createRetryScenario(31, 'PROCESSING', today, 'FAILED', 9, 'FAILED', 9, 'FAILED', 9);
    await createRetryScenario(32, 'ERROR', today, 'FAILED', 9, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(33, 'ERROR', today, 'ACCEPTED', 2, 'FAILED', 9, 'ACCEPTED', 2);
    await createRetryScenario(34, 'ERROR', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'FAILED', 9);
    await createRetryScenario(35, 'ERROR', today, 'FAILED', 9, 'FAILED', 9, 'ACCEPTED', 2);
    await createRetryScenario(36, 'ERROR', today, 'FAILED', 9, 'ACCEPTED', 2, 'FAILED', 9);
    await createRetryScenario(37, 'ERROR', today, 'ACCEPTED', 2, 'FAILED', 9, 'FAILED', 9);
    await createRetryScenario(38, 'ERROR', today, 'FAILED', 9, 'FAILED', 9, 'FAILED', 9);
    await createRetryScenario(39, 'PENDING', today, 'FAILED', 9, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(40, 'PENDING', today, 'ACCEPTED', 2, 'FAILED', 9, 'ACCEPTED', 2);
    await createRetryScenario(41, 'PENDING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'FAILED', 9);
    await createRetryScenario(42, 'PENDING', today, 'FAILED', 9, 'FAILED', 9, 'ACCEPTED', 2);
    await createRetryScenario(43, 'PENDING', today, 'FAILED', 9, 'ACCEPTED', 2, 'FAILED', 9);
    await createRetryScenario(44, 'PENDING', today, 'ACCEPTED', 2, 'FAILED', 9, 'FAILED', 9);
    await createRetryScenario(45, 'PENDING', today, 'FAILED', 9, 'FAILED', 9, 'FAILED', 9);
    await createRetryScenario(46, 'PROCESSING', today, 'PROCESSING', 0, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(47, 'PROCESSING', today, 'ACCEPTED', 2, 'PROCESSING', 0, 'ACCEPTED', 2);
    await createRetryScenario(48, 'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'PROCESSING', 0);
    await createRetryScenario(49, 'PROCESSING', today, 'PROCESSING', 0, 'PROCESSING', 0, 'ACCEPTED', 2);
    await createRetryScenario(50, 'PROCESSING', today, 'PROCESSING', 0, 'ACCEPTED', 2, 'PROCESSING', 0);
    await createRetryScenario(51, 'PROCESSING', today, 'ACCEPTED', 2, 'PROCESSING', 0, 'PROCESSING', 0);
    await createRetryScenario(52, 'PROCESSING', today, 'PROCESSING', 0, 'PROCESSING', 0, 'PROCESSING', 0);
    // Delete all UPLOAD_QUEUE records
    await createRetryScenario(53, 'PROCESSED', todayMinus31, 'ACCEPTED', 2, 'ACCEPTED', 2, 'ACCEPTED', 2);
    // Don't delete UPLOAD_QUEUE, result still PROCESSIN';
    await createRetryScenario(54, 'PROCESSING', todayMinus31, 'ACCEPTED', 0, 'PROCESSING', 0, 'PROCESSING', 0);
    await createRetryScenario(55, 'PENDING', today, 'ACCEPTED', 0, 'FAILED', 9, null, null);
  };

});
