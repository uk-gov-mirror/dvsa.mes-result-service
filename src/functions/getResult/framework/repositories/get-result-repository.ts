import * as mysql from 'mysql2';

import { TestResultRecord } from '../../../../common/domain/test-results';
import { getConnection } from '../../../../common/framework/mysql/database';
import { buildGetResultQuery } from '../database/query-builder';

export const getResult = async (
  appRef: string,
): Promise<TestResultRecord[]> => {
  const connection: mysql.Connection = getConnection();
  let batch;
  try {
    const [rows, fields] = await connection.promise().query(
      buildGetResultQuery(appRef),
    );
    batch = rows;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    connection.end();
  }
  return batch;
};
