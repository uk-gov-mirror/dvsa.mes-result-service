import * as mysql from 'mysql2';
import { RetryProcessor } from '../RetryProcessor';
import { IRetryProcessor } from '../IRetryProcessor';

describe('RetryProcessor database test', () => {
  let db: mysql.Connection;
  let retryProcessor: IRetryProcessor;

  beforeEach(() => {
    db = mysql.createConnection({
      host: 'localhost',
      user: 'results_user',
      database: 'results',
      password: 'Pa55word1',
    });
    retryProcessor = new RetryProcessor(db);
  });

  describe('Query correctness', () => {
    it('should move TEST_RESULTs with all successful UPLOAD_QUEUE records to PROCESSED', async () => {
      await retryProcessor.processSuccessful();
      await checkProcessSuccessfulUpdatedTestResult();
      await checkProcessSuccessfulUpdatedTerminatedTestResult();
    });

    it('should mark UPLOAD_QUEUE for reprocessing when they have failed but not exceeded the retry limit', async () => {
      await retryProcessor.processErrorsToRetry(3, 3, 3);
      await checkErrorsToRetryUpdatedUpLoadQueues();
    });

    it('should abort UPLOAD_QUEUE records that have exceeded the retry count for that interface', async () => {
      await retryProcessor.processErrorsToAbort(3, 3, 3);
      await checkErrorsToAbortUpdatedTestResult();
    });

    it('should update TEST_RESULT and UPLOAD_QUEUE to make them ready for reprocessing', async () => {
      await retryProcessor.processSupportInterventions();
      await checkSupportInterventionUpdatedUploadQueues();
      await checkSupportInterventionUpdatedTestResult();
    });

    it('should clean out old UPLOAD_QUEUE records', async () => {
      await retryProcessor.processOldEntryCleanup(30);
      await checkOldEntryCleanupDeleteUploadQueues();
    });
  });

  const checkProcessSuccessfulUpdatedTestResult = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT * FROM TEST_RESULT WHERE application_reference = 1
        and staff_number = '1234' and result_status = 2
        `,
        [],
        (err, results, fields) => {
          if (err || !results.length) {
            reject('Row not found or incorrect state');
          }
          resolve();
        });
    });
  };

  const checkProcessSuccessfulUpdatedTerminatedTestResult = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT * FROM TEST_RESULT WHERE application_reference = 6
        and staff_number = '1234' and result_status = 2
        `,
        [],
        (err, results, fields) => {
          if (err || !results.length) {
            reject('Row not found or incorrect state');
          }
          resolve();
        });
    });
  };

  const checkErrorsToRetryUpdatedUpLoadQueues = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT COUNT(*) as rowcount FROM UPLOAD_QUEUE WHERE application_reference = 2
        and staff_number = '1234' and upload_status = 0
        `,
        [],
        (err, results, fields) => {
          if (err || !results.length) {
            reject('Row not found or incorrect state');
          }
          if (results.rowcount && results.rowcount !== 3) {
            reject('Row count does not match expected (3)');
          }
          resolve();
        });
    });
  };

  const checkErrorsToAbortUpdatedTestResult = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT *  FROM TEST_RESULT WHERE application_reference = 3
        and staff_number = '1234'
        `,
        [],
        (err, results, fields) => {
          if (err || !results.length) {
            reject('Row not found or incorrect state');
          }
          if (results.result_status && results.result_status !== 4) {
            reject('result status Row count does not match expected (4)');
          }
          resolve();
        });
    });
  };

  const checkSupportInterventionUpdatedUploadQueues = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT COUNT(*) as rowcount FROM UPLOAD_QUEUE WHERE application_reference = 4
        and staff_number = '1234' and upload_status = 0
        `,
        [],
        (err, results, fields) => {
          if (err || !results.length) {
            reject('Row not found or incorrect state');
          }
          if (results.rowcount && results.rowcount !== 3) {
            reject('Row count does not match expected (3)');
          }
          resolve();
        });
    });
  };

  const checkSupportInterventionUpdatedTestResult = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT * FROM TEST_RESULT WHERE application_reference = 4
        and staff_number = '1234' and result_status = 1
        `,
        [],
        (err, results, fields) => {
          if (err || !results.length) {
            reject('Row not found or incorrect state');
          }
          resolve();
        });
    });
  };

  const checkOldEntryCleanupDeleteUploadQueues = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.query(
        `
        SELECT COUNT(*) as rowcount FROM UPLOAD_QUEUE WHERE application_reference = 5
        and staff_number = '1234'
        `,
        [],
        (err, results, fields) => {
          if (err || !results.length) {
            reject('Row not found or incorrect state');
          }
          if (results.rowcount && results.rowcount !== 0) {
            reject('Row count does not match expected (0)');
          }
          resolve();
        });
    });
  };

});
