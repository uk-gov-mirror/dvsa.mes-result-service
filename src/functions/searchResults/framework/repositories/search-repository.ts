import { getConnection } from '../../../../common/framework/mysql/database';
import * as mysql from 'mysql2';
import { TestResultRecord } from '../../../../common/domain/test-results';
import { buildDriverDetailsSearchQuery } from '../database/query-builder';
import { QueryParameters } from '../../domain/query_parameters';

export class SearchRepository {

  async searchForTestResultWithDriverDetails(
    queryParameters : QueryParameters,
  ): Promise<TestResultRecord> {
    const connection: mysql.Connection = getConnection();
    let result: TestResultRecord;
    try {
      result = await connection.promise().query(
        buildDriverDetailsSearchQuery(queryParameters),
      );
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      connection.end();
    }
    return result;
  }
}
