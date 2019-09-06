import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import * as mysql from 'mysql2';
import { IntegrationType } from '../domain/result-integration';
import { getConnection } from '../../../common/framework/mysql/database';
import { buildTestResultInsert, buildUploadQueueInsert } from '../framework/database/query-builder';
import * as logger from '../../../common/application/utils/logger';

export const saveTestResult = async (
  testResult: StandardCarTestCATBSchema,
  hasValidationError: boolean = false,
  isPartialTestResult: boolean,
): Promise<void> => {
  const connection: mysql.Connection = getConnection();
  try {
    await connection.promise().query(`SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;`);
    connection.beginTransaction();
    await connection.promise().query(buildTestResultInsert(testResult, hasValidationError, isPartialTestResult));
    await trySaveUploadQueueRecords(connection, testResult, hasValidationError, isPartialTestResult);
    connection.commit();
  } catch (err) {
    connection.rollback();
    logger.error(`Error saving result: ${err}`);
    throw err;
  } finally {
    connection.end();
  }
};

const trySaveUploadQueueRecords = async (
  connection: mysql.Connection,
  testResult: StandardCarTestCATBSchema,
  hasValidationError: boolean,
  isPartialTestResult: boolean,
): Promise<void> => {
  if (!hasValidationError) {
    await connection.promise().query(buildUploadQueueInsert(testResult, IntegrationType.TARS));
    await connection.promise().query(buildUploadQueueInsert(testResult, IntegrationType.NOTIFY));
    if (!isPartialTestResult) {
      await connection.promise().query(buildUploadQueueInsert(testResult, IntegrationType.RSIS));
    }
  }
};
