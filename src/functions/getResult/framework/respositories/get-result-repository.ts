import * as mysql from 'mysql2';

import { TestResultRecord } from '../../../../common/domain/test-results';
import { getConnection } from '../../../../common/framework/mysql/database';
import { buildGetResultQuery } from '../database/query-builder';

export class GetResultRepository {

  async getResult(
    appRef: string,
    staffNumber: string,
  ): Promise<TestResultRecord> {
    const connection: mysql.Connection = getConnection();
    let result: TestResultRecord;
    try {
      result = await connection.promise().query(
        buildGetResultQuery(appRef, staffNumber),
      );
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
      connection.end();
    }
    return result;
  }
}
