import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import * as mysql from 'mysql2';
import { IntegrationType } from '../domain/result-integration';
import { getConnection } from '../../../common/framework/mysql/database';
import { buildTestResultInsert, buildUploadQueueInsert } from '../framework/database/query-builder';

export const saveTestResult = async (
  testResult: StandardCarTestCATBSchema,
  hasValidationError: boolean = false,
): Promise<void> => {
  const connection: mysql.Connection = getConnection();

  try {
    await connection.promise().query(buildTestResultInsert(testResult, hasValidationError));
    await trySaveUploadQueueRecords(connection, testResult, hasValidationError);
  } catch (err) {
    connection.rollback();
    throw err;
  } finally {
    connection.end();
  }
};

const trySaveUploadQueueRecords = async (
  connection: mysql.Connection,
  testResult: StandardCarTestCATBSchema,
  hasValidationError: boolean,
): Promise<void> => {
  if (!hasValidationError) {
    await connection.promise().query(buildUploadQueueInsert(testResult, IntegrationType.TARS));
    await connection.promise().query(buildUploadQueueInsert(testResult, IntegrationType.NOTIFY));
    await connection.promise().query(buildUploadQueueInsert(testResult, IntegrationType.RSIS));
  }
};
