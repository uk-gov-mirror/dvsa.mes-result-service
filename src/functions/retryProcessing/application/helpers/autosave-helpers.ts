import * as mysql from 'mysql2';
import { AutosaveTestData } from './mock-test-data';
import { AutosaveQueueData } from '../mock-queue-data';

/**
 * Insert TEST_RESULT records into database
 */
export const insertAutosaveTestResultData = (
  db: mysql.Connection,
  itemsToInsert: AutosaveTestData[],
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      INSERT INTO TEST_RESULT (
      application_reference, staff_number, test_result,
      test_date, tc_id, tc_cc, driver_number, driver_surname, result_status, autosave
      ) VALUES ?
      `,
      [itemsToInsert.map(item => [
        item.applicationReference,
        item.staffNumber,
        '{}',
        item.testDate ? item.testDate : new Date().toISOString().slice(0, 10),
        1,
        1,
        `dnum${item.applicationReference}`,
        item.driverSurname,
        item.resultStatus,
        item.autosave,
      ])],
      (err, results, fields) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
  });
};

/**
 * Insert UPLOAD_QUEUE records into database
 */
export const insertAutosaveQueueResultData = (
  db: mysql.Connection,
  itemsToInsert: AutosaveQueueData[],
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      INSERT INTO UPLOAD_QUEUE (
      application_reference, staff_number, timestamp, interface, upload_status, retry_count
      ) VALUES ?
      `,
      [itemsToInsert.map(item => [
        item.applicationReference,
        item.staffNumber,
        item.timestamp ? item.timestamp : new Date().toISOString().slice(0, 19).replace('T', ' '),
        item.interface,
        item.uploadStatus,
        item.retryCount,
      ])],
      (err, results, fields) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
  });
};

/**
 * Delete entries in either TEST_RESULT or UPLOAD_QUEUE
 */
export const deleteAutosaveTestResultData = (
  db: mysql.Connection,
  table: string,
  itemsToDelete: any,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.query(
      `DELETE FROM ${table} WHERE application_reference IN (${itemsToDelete})`,
      [],
      (err, results, fields) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
  });
};

/**
 * Return a result set of TEST_RESULT records that contains autosave data
 */
export const getAutosaveTestResultRecords = (db: mysql.Connection): Promise<TestResultInterface> => {
  return new Promise((resolve, reject) => {
    db.query(
      `
        SELECT application_reference, result_status FROM TEST_RESULT
        WHERE autosave = 1;
        `,
      [],
      (err, results, fields) => {
        if (err) {
          reject(err);
        }
        resolve(results.map(row =>
          ({
            application_reference: row.application_reference,
            result_status: row.result_status,
          })));
      });
  });
};

/**
 * Return a result set of UPLOAD_QUEUE records that contain autosave data
 */
export const getAutosaveQueueRecords = (db: mysql.Connection): Promise<UploadQueueInterface[]> => {
  return new Promise((resolve, reject) => {
    db.query(
      `
        SELECT tr.application_reference, uq.interface, uq.upload_status FROM TEST_RESULT tr
        LEFT JOIN UPLOAD_QUEUE uq ON tr.application_reference = uq.application_reference
        WHERE tr.autosave = 1;
        `,
      [],
      (err, results, fields) => {
        if (err) {
          reject(err);
        }
        resolve(results.map(row =>
          ({
            application_reference: row.application_reference,
            interface: row.interface,
            upload_status: row.upload_status,
          })));
      });
  });
};

/**
 * Update TEST_RESULT records to represent fully submitted tests
 */
export const updateTestResultAutosaveFlag = (
  db: mysql.Connection,
  startingAppRef: number,
  finishingAppRef: number,
  ): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.query(
      `
        UPDATE TEST_RESULT
        SET autosave = 0
        WHERE autosave = 1 AND application_reference BETWEEN ${startingAppRef} AND ${finishingAppRef};
        `,
      [],
      (err, results, fields) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
  });
};

export const getTestResultAppRefsForResultStatus = (db: mysql.Connection, resultStatus: string): Promise<number[]> => {
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

interface TestResultInterface {
  application_reference: number;
  result_status: number;
}
interface UploadQueueInterface {
  application_reference: number;
  interface: number;
  upload_status: number;
}
