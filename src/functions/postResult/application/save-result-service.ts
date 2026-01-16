import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';
import * as mysql from 'mysql2';
import {error, info} from '@dvsa/mes-microservice-common/application/utils/logger';
import { IntegrationType } from '../domain/result-integration';
import { getConnection } from '../../../common/framework/mysql/database';
import { buildTestResultInsert, buildUploadQueueInsert } from '../framework/database/query-builder';

export const saveTestResult = async (
  testResult: TestResultSchemasUnion,
  hasValidationError: boolean = false,
  isPartialTestResult: boolean,
): Promise<void> => {
  const connection: mysql.Connection = getConnection();
  try {
    info('pre connection.promise');
    await connection.promise().query('SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;');
    info('pre begin');
    connection.beginTransaction(null);
    info('pre promise().query');
    await connection.promise().query(buildTestResultInsert(testResult, hasValidationError, isPartialTestResult));
    info('pre trySaveUploadQueueRecords');
    await trySaveUploadQueueRecords(connection, testResult, hasValidationError, isPartialTestResult);
    info('pre commit');
    connection.commit();
  } catch (err) {
    error(`Error saving result: ${err}`);
    connection.rollback(null);
    throw err;
  } finally {
    connection.end();
  }
};

const trySaveUploadQueueRecords = async (
  connection: mysql.Connection,
  testResult: TestResultSchemasUnion,
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
