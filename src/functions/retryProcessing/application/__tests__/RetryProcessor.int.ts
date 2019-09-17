import * as mysql from 'mysql2';
import { RetryProcessor } from '../RetryProcessor';
import { IRetryProcessor } from '../IRetryProcessor';
import  { RetryTestCases, InterfaceIds } from '../../application/__tests__/common/TestEnums';
import moment = require('moment');
import {
  getErroredTestAppRefs,
  getTestResultAppRefsForResultStatus,
  getAllUploadQueueRecords,
  getProcessingUploadQueueRecords,
  getAppRefInterfaceCombosWithProcessingStatusAndRetriesOccurred,
} from './common/HelperSQLQueries';
import { setIsolationLevelSerializable } from '../../framework/database/query-templates';

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
      const acceptedTestAppRefs = await getTestResultAppRefsForResultStatus(db, 'PROCESSED');
      expect(changedRowCount).toBe(1);
      expect(acceptedTestAppRefs).toContain(RetryTestCases.SuccessfulUpload);
    });

    it('should mark UPLOAD_QUEUE for reprocessing when they failed but not exceeded the retry limit', async () => {
      const changedRowCount = await retryProcessor.processErrorsToRetry(3, 3, 3);
      const appRefInterfaces = await getAppRefInterfaceCombosWithProcessingStatusAndRetriesOccurred(db);

      expect(changedRowCount).toBe(12);
      // TARS
      expect(appRefInterfaces).toContain(
        {
          application_reference: RetryTestCases.FailedTars,
          interface:  InterfaceIds.TARS,
        });
      expect(appRefInterfaces).toContain(
        {
          application_reference: RetryTestCases.FailedTarsAndRsis,
          interface:  InterfaceIds.TARS,
        });
      expect(appRefInterfaces).toContain(
        {
          application_reference: RetryTestCases.FailedTarsAndNotify,
          interface:  InterfaceIds.TARS,
        });
      expect(appRefInterfaces).toContain(
        {
          application_reference: RetryTestCases.FailedTarsRsisAndNotify,
          interface:  InterfaceIds.TARS,
        });
      // NOTIFY
      expect(appRefInterfaces).toContain(
        {
          application_reference: RetryTestCases.FailedNotify,
          interface:  InterfaceIds.NOTIFY,
        });
      expect(appRefInterfaces).toContain(
        {
          application_reference: RetryTestCases.FailedTarsAndNotify,
          interface:  InterfaceIds.NOTIFY,
        });
      expect(appRefInterfaces).toContain(
        {
          application_reference: RetryTestCases.FailedRsisAndNotify,
          interface:  InterfaceIds.NOTIFY,
        });
      expect(appRefInterfaces).toContain(
        {
          application_reference: RetryTestCases.FailedTarsRsisAndNotify,
          interface:  InterfaceIds.NOTIFY,
        });
      // RSIS
      expect(appRefInterfaces).toContain(
        {
          application_reference: RetryTestCases.FailedRsis,
          interface:  InterfaceIds.RSIS,
        });
      expect(appRefInterfaces).toContain(
        {
          application_reference: RetryTestCases.FailedTarsAndRsis,
          interface:  InterfaceIds.RSIS,
        });
      expect(appRefInterfaces).toContain(
        { application_reference: RetryTestCases.FailedRsisAndNotify,
          interface:  InterfaceIds.RSIS,
        });
      expect(appRefInterfaces).toContain(
        { application_reference: RetryTestCases.FailedTarsRsisAndNotify,
          interface:  InterfaceIds.RSIS,
        });
    });

    it('should abort TEST_RESULT records that have exceeded the retry count for any interface', async () => {
      const changedRowCount = await retryProcessor.processErrorsToAbort(3, 3, 3);
      const erroredTestAppRefs = await getErroredTestAppRefs(db);

      expect(changedRowCount).toBe(7);
      expect(erroredTestAppRefs).toContain(RetryTestCases.FailedTarsExceeded); // Failed TARS
      expect(erroredTestAppRefs).toContain(RetryTestCases.FailedRsisExceeded); // Failed RSIS
      expect(erroredTestAppRefs).toContain(RetryTestCases.FailedNotifyExceeded); // Failed Notify
      expect(erroredTestAppRefs).toContain(RetryTestCases.FailedTarsAndRsisExceeded); // Failed TARS+RSIS
      expect(erroredTestAppRefs).toContain(RetryTestCases.FailedTarsAndNotifyExceeded); // Failed TARS+Notify
      expect(erroredTestAppRefs).toContain(RetryTestCases.FailedRSISAndNotifyExceeded); // Failed RSIS+Notify
      expect(erroredTestAppRefs).toContain(RetryTestCases.FailedTarsRSISAndNotifyExceeded); // Failed TARS+RSIS+Notify
    });

    it('should update TEST_RESULT and UPLOAD_QUEUE to make them ready for reprocessing post intervention', async () => {
      const changedRowCount = await retryProcessor.processSupportInterventions();
      const processingAppRefs = await getTestResultAppRefsForResultStatus(db, 'PROCESSING');
      const processingUploadQueueRecords = await getProcessingUploadQueueRecords(db);

      expect(changedRowCount).toBe(45);
      // TEST_RESULT test_status PENDING -> PROCESSING
      expect(processingAppRefs).toContain(RetryTestCases.FailedTarsPending);
      expect(processingAppRefs).toContain(RetryTestCases.FailedRsisPending);
      expect(processingAppRefs).toContain(RetryTestCases.FailedNotifyPending);
      expect(processingAppRefs).toContain(RetryTestCases.FailedTarsAndRsisPending);
      expect(processingAppRefs).toContain(RetryTestCases.FailedTarsAndNotifyPending);
      expect(processingAppRefs).toContain(RetryTestCases.FailedRsisAndNotifyPending);
      expect(processingAppRefs).toContain(RetryTestCases.FailedTarsRsisAndNotifyPending);
      expect(processingAppRefs).toContain(RetryTestCases.AcceptedTarsNotifyFailed);
      // UPLOAD_QUEUE upload_status ERROR -> PROCESSING
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.FailedTarsPending, interface:  InterfaceIds.TARS });
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.FailedRsisPending, interface:  InterfaceIds.RSIS });
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.FailedNotifyPending, interface:  InterfaceIds.NOTIFY });
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.FailedTarsAndRsisPending, interface:  InterfaceIds.TARS });
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.FailedTarsAndRsisPending, interface:  InterfaceIds.RSIS });
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.FailedTarsAndNotifyPending, interface:  InterfaceIds.TARS });
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.FailedTarsAndNotifyPending, interface:  InterfaceIds.NOTIFY });
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.FailedRsisAndNotifyPending, interface:  InterfaceIds.NOTIFY });
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.FailedRsisAndNotifyPending, interface:  InterfaceIds.RSIS });
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.FailedTarsRsisAndNotifyPending, interface:  InterfaceIds.TARS });
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.FailedTarsRsisAndNotifyPending, interface:  InterfaceIds.NOTIFY });
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.FailedTarsRsisAndNotifyPending, interface:  InterfaceIds.RSIS });
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.AcceptedTarsNotifyFailed, interface:  InterfaceIds.NOTIFY });
      expect(processingUploadQueueRecords).toContain(
          { application_reference: RetryTestCases.AcceptedTarsNotifyFailed, interface:  InterfaceIds.RSIS });
    });
  });

  describe('setSerializableIsolationLevel', () => {
    it('should set the Transaction isolation level to Serializable', async () => {
      const newConnection: mysql.Connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'results',
        password: '',
        port: 3306,
      });
      const newRetryProcessor = new RetryProcessor(db);

      // Enables viewing of the current transaction isolation level
      await newConnection.promise().query(`set @@global.show_compatibility_56=ON;`);

      await newConnection.promise().query(setIsolationLevelSerializable);

      const response = await newConnection.promise().query(
        `SELECT * FROM information_schema.session_variables WHERE variable_name = 'tx_isolation';`);
      expect(JSON.stringify(response)).toMatch(/"VARIABLE_VALUE":"SERIALIZABLE"/);
    });
  });

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
    await createRetryScenario(
        RetryTestCases.UploadedNotProcessed, 'PROCESSING', today, 'PROCESSING', 0, 'PROCESSING', 0, 'PROCESSING', 0);
    await createRetryScenario(
        RetryTestCases.FailedValidation, 'ERROR', today, 'PROCESSING', 0, 'PROCESSING', 0, 'PROCESSING', 0);
    await createRetryScenario(
        RetryTestCases.PendingTars, 'PROCESSING', today, 'PROCESSING', 0, 'ACCEPTED', 2, 'ACCEPTED', 0);
    await createRetryScenario(
        RetryTestCases.PendingRsis, 'PROCESSING', today, 'ACCEPTED', 2, 'PROCESSING', 0, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.PendingNotify, 'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'PROCESSING', 0);
    await createRetryScenario(
        RetryTestCases.PendingTarsAndRsis, 'PROCESSING', today, 'PROCESSING', 0, 'PROCESSING', 0, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.PendingTarsAndNotify, 'PROCESSING', today, 'PROCESSING', 0, 'ACCEPTED', 2, 'PROCESSING', 0);
    await createRetryScenario(
        RetryTestCases.PendingRsisAndNotify, 'PROCESSING', today, 'ACCEPTED', 2, 'PROCESSING', 0, 'PROCESSING', 0);
    await createRetryScenario(
        RetryTestCases.SuccessfulUpload, 'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.SuccessfulUploadTerminatedNoNotify,
        'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, null, null);
    await createRetryScenario(
        RetryTestCases.FailedTars, 'PROCESSING', today, 'FAILED', 2, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedRsis, 'PROCESSING', today, 'ACCEPTED', 2, 'FAILED', 2, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedNotify, 'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'FAILED', 2);
    await createRetryScenario(
        RetryTestCases.FailedTarsAndRsis, 'PROCESSING', today, 'FAILED', 2, 'FAILED', 2, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedTarsAndNotify, 'PROCESSING', today, 'FAILED', 2, 'ACCEPTED', 2, 'FAILED', 2);
    await createRetryScenario(
        RetryTestCases.FailedRsisAndNotify, 'PROCESSING', today, 'ACCEPTED', 2, 'FAILED', 2, 'FAILED', 2);
    await createRetryScenario(
        RetryTestCases.FailedTarsRsisAndNotify, 'PROCESSING', today, 'FAILED', 2, 'FAILED', 2, 'FAILED', 2);
    await createRetryScenario(
        RetryTestCases.RetryTars, 'PROCESSING', today, 'PROCESSING', 2, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.RetryRsis, 'PROCESSING', today, 'ACCEPTED', 2, 'PROCESSING', 2, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.RetryNotify, 'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'PROCESSING', 2);
    await createRetryScenario(
        RetryTestCases.RetryTarsAndRsis, 'PROCESSING', today, 'PROCESSING', 2, 'PROCESSING', 2, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.RetryTarsAndNotify, 'PROCESSING', today, 'PROCESSING', 2, 'ACCEPTED', 2, 'PROCESSING', 2);
    await createRetryScenario(
        RetryTestCases.RetryRSISAndNotify, 'PROCESSING', today, 'ACCEPTED', 2, 'PROCESSING', 2, 'PROCESSING', 2);
    await createRetryScenario(
        RetryTestCases.RetryTarsRsisAndNotify, 'PROCESSING', today, 'PROCESSING', 2, 'PROCESSING', 2, 'PROCESSING', 2);
    await createRetryScenario(
        RetryTestCases.FailedTarsExceeded, 'PROCESSING', today, 'FAILED', 9, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedRsisExceeded, 'PROCESSING', today, 'ACCEPTED', 2, 'FAILED', 9, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedNotifyExceeded, 'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'FAILED', 9);
    await createRetryScenario(
        RetryTestCases.FailedTarsAndRsisExceeded, 'PROCESSING', today, 'FAILED', 9, 'FAILED', 9, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedTarsAndNotifyExceeded, 'PROCESSING', today, 'FAILED', 9, 'ACCEPTED', 2, 'FAILED', 9);
    await createRetryScenario(
        RetryTestCases.FailedRSISAndNotifyExceeded, 'PROCESSING', today, 'ACCEPTED', 2, 'FAILED', 9, 'FAILED', 9);
    await createRetryScenario(
        RetryTestCases.FailedTarsRSISAndNotifyExceeded, 'PROCESSING', today, 'FAILED', 9, 'FAILED', 9, 'FAILED', 9);
    await createRetryScenario(
        RetryTestCases.FailedTarsError, 'ERROR', today, 'FAILED', 9, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedRsisError, 'ERROR', today, 'ACCEPTED', 2, 'FAILED', 9, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedNotifyError, 'ERROR', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'FAILED', 9);
    await createRetryScenario(
        RetryTestCases.FailedTarsAndRsisError, 'ERROR', today, 'FAILED', 9, 'FAILED', 9, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedTarsAndNotifyError, 'ERROR', today, 'FAILED', 9, 'ACCEPTED', 2, 'FAILED', 9);
    await createRetryScenario(
        RetryTestCases.FailedRsisAndNotifyError, 'ERROR', today, 'ACCEPTED', 2, 'FAILED', 9, 'FAILED', 9);
    await createRetryScenario(
        RetryTestCases.FailedTarsRsisAndNotifyError, 'ERROR', today, 'FAILED', 9, 'FAILED', 9, 'FAILED', 9);
    await createRetryScenario(
        RetryTestCases.FailedTarsPending, 'PENDING', today, 'FAILED', 9, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedRsisPending, 'PENDING', today, 'ACCEPTED', 2, 'FAILED', 9, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedNotifyPending, 'PENDING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'FAILED', 9);
    await createRetryScenario(
        RetryTestCases.FailedTarsAndRsisPending, 'PENDING', today, 'FAILED', 9, 'FAILED', 9, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedTarsAndNotifyPending, 'PENDING', today, 'FAILED', 9, 'ACCEPTED', 2, 'FAILED', 9);
    await createRetryScenario(
        RetryTestCases.FailedRsisAndNotifyPending, 'PENDING', today, 'ACCEPTED', 2, 'FAILED', 9, 'FAILED', 9);
    await createRetryScenario(
        RetryTestCases.FailedTarsRsisAndNotifyPending, 'PENDING', today, 'FAILED', 9, 'FAILED', 9, 'FAILED', 9);
    await createRetryScenario(
        RetryTestCases.FailedTarsRetry, 'PROCESSING', today, 'PROCESSING', 0, 'ACCEPTED', 2, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedRsisRetry, 'PROCESSING', today, 'ACCEPTED', 2, 'PROCESSING', 0, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedNotifyRetry, 'PROCESSING', today, 'ACCEPTED', 2, 'ACCEPTED', 2, 'PROCESSING', 0);
    await createRetryScenario(
        RetryTestCases.FailedTarsAndRsisRetry, 'PROCESSING', today, 'PROCESSING', 0, 'PROCESSING', 0, 'ACCEPTED', 2);
    await createRetryScenario(
        RetryTestCases.FailedTarsAndNotifyRetry, 'PROCESSING', today, 'PROCESSING', 0, 'ACCEPTED', 2, 'PROCESSING', 0);
    await createRetryScenario(
        RetryTestCases.FailedRsisAndNotifyRetry, 'PROCESSING', today, 'ACCEPTED', 2, 'PROCESSING', 0, 'PROCESSING', 0);
    await createRetryScenario(
        RetryTestCases.FailedTarsRsisAndNotifyRetry,
        'PROCESSING', today, 'PROCESSING', 0, 'PROCESSING', 0, 'PROCESSING', 0);
    // Delete all UPLOAD_QUEUE records
    await createRetryScenario(
        RetryTestCases.SuccessfulUploadAfterMonth,
        'PROCESSED', todayMinus31, 'ACCEPTED', 2, 'ACCEPTED', 2, 'ACCEPTED', 2);
    // Don't delete UPLOAD_QUEUE, result still PROCESSIN';
    await createRetryScenario(
      RetryTestCases.AcceptedTarsNotifyAndRsisProcessing,
      'PROCESSING', todayMinus31, 'ACCEPTED', 0, 'PROCESSING', 0, 'PROCESSING', 0);
    await createRetryScenario(
      RetryTestCases.AcceptedTarsNotifyFailed, 'PENDING', today, 'ACCEPTED', 0, 'FAILED', 9, null, null);
  };

});
