import * as mysql from 'mysql2';

import { TestResultRecord } from '../../../../common/domain/test-results';
import { getConnection } from '../../../../common/framework/mysql/database';
import { multipleTestResultsQuery } from '../database/query-builder';

export const getMultipleResult = async (
  staffNumber: string,
  applicationReferences: string[],
): Promise<TestResultRecord[]> => {
  const connection: mysql.Connection = getConnection();
  let batch;
  try {
    const [rows, fields] = await connection.promise().query(
      multipleTestResultsQuery(staffNumber, applicationReferences),
    );
    batch = rows;
  } catch (err) {
    throw err;
  } finally {
    connection.end();
  }
  return batch;
};
