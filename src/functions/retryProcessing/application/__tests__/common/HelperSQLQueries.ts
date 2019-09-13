import * as mysql from 'mysql2';

interface UploadQueueInterface {
  application_reference: number;
  interface: number;
  upload_status: number;
}

interface AppRefInterface {
  application_reference: number;
  interface: number;
}

export const getErroredTestAppRefs = (db: mysql.Connection): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      SELECT DISTINCT tr.application_reference
      FROM TEST_RESULT tr
      JOIN UPLOAD_QUEUE uq
        ON tr.application_reference = uq.application_reference
        AND result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'ERROR')
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

export const getErroredTestAppRef = (db: mysql.Connection, appRef: number): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    const formattedQuery = db.format(
      `
      SELECT DISTINCT tr.application_reference
      FROM TEST_RESULT tr
      JOIN UPLOAD_QUEUE uq
        ON tr.application_reference = uq.application_reference
        AND result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'ERROR')
      WHERE tr.application_reference = ?
      `,
      [appRef]);

    db.query(
      formattedQuery,
      [],
      (err, results, fields) => {
        if (err) {
          reject(err);
        }
        resolve(results.map(row => row.application_reference));
      });
  });
};

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
export const getAutosaveQueueRecord =
  (db: mysql.Connection, interfaceId: number, id: number): Promise<UploadQueueInterface[]> => {
    return new Promise((resolve, reject) => {
      const formattedQuery = db.format(
        `
        SELECT tr.application_reference, uq.interface, uq.upload_status FROM TEST_RESULT tr
        LEFT JOIN UPLOAD_QUEUE uq ON tr.application_reference = uq.application_reference
        WHERE tr.autosave = 1
        AND uq.interface = ?
        AND tr.application_reference = ?
        `,
        [interfaceId, id]);

      db.query(
        formattedQuery,
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

export const getTestResultAutosaveFlag =
  (db: mysql.Connection, appRef: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      const formattedQuery = db.format(
       `
       SELECT CONVERT(tr.autosave, signed) autosave
       FROM TEST_RESULT tr
       WHERE tr.application_reference = ?
       `,
       [appRef]);

      db.query(
        formattedQuery,
        [],
        (err, result, fields) => {
          if (err) {
            reject(err);
          }
          const autosaveValue = result[0]['autosave'];
          resolve(autosaveValue);
        });
    });
  };

export const getQueueCount =
  (db: mysql.Connection, appRef: number, interfaceId): Promise<number> => {
    return new Promise((resolve, reject) => {
      const formattedQuery = db.format(
       `
       SELECT COUNT(1) uqcount
       FROM UPLOAD_QUEUE uq
       WHERE uq.application_reference = ?
       AND   uq.interface = ?
       `,
       [appRef, interfaceId]);

      db.query(
        formattedQuery,
        [],
        (err, result, fields) => {
          if (err) {
            reject(err);
          }
          const countValue = result[0]['uqcount'];
          resolve(countValue);
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

export const getProcessingUploadQueueRecords = (db: mysql.Connection): Promise<AppRefInterface[]> => {
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

export const getAppRefInterfaceCombosWithProcessingStatusAndRetriesOccurred =
  (db: mysql.Connection): Promise<AppRefInterface[]> => {
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

export const getAllUploadQueueRecords = (db: mysql.Connection): Promise<AppRefInterface[]> => {
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
