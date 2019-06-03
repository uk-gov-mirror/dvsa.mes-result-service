import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import * as mysql from 'mysql2';
import { IntegrationType } from '../domain/result-integration';
import { getConnection } from '../../../common/framework/mysql/database';
import { buildTestResultInsert, buildUploadQueueInsert } from '../framework/database/query-builder';

export const saveTestResult = async (testResult: StandardCarTestCATBSchema): Promise<void> => {
  const connection: mysql.Connection = getConnection();

  try {
    await connection.promise().query(buildTestResultInsert(testResult));
    await connection.promise().query(buildUploadQueueInsert(testResult, IntegrationType.TARS));
    await connection.promise().query(buildUploadQueueInsert(testResult, IntegrationType.RSIS));
    await connection.promise().query(buildUploadQueueInsert(testResult, IntegrationType.NOTIFY));
  } catch (err) {
    connection.rollback();
    throw err;
  } finally {
    connection.end();
  }
};
