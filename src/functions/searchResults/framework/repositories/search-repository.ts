import { getConnection } from '../../../../common/framework/mysql/database';
import * as mysql from 'mysql2';
import { TestResultRecord } from '../../../../common/domain/test-results';
import { buildDriverDetailsSearchQuery, DriverDetail } from '../database/query-builder';

export class SearchRepository {

  async searchForTestResultWithDriverDetails(
    driverDetailsKey: DriverDetail, driverDetailsValue: string,
  ): Promise<TestResultRecord> {
    const connection: mysql.Connection = getConnection();
    let result: TestResultRecord;
    try {
      result = await connection.promise().query(
        buildDriverDetailsSearchQuery(driverDetailsKey, driverDetailsValue),
      );
    } catch (err) {
      throw err;
    } finally {
      connection.end();
    }
    return result;
  }
}
