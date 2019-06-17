import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import * as mysql from 'mysql2';
import { IntegrationType } from '../domain/result-integration';
import { getConnection } from '../../../common/framework/mysql/database';
import { buildTestResultInsert, buildUploadQueueInsert } from '../framework/database/query-builder';
import { isCompletedTest } from './isCompletedTest';
import { hasCandidateCommunicationPermission } from './hasCandidateCommunicationPermission';

export const saveTestResult = async (testResult: StandardCarTestCATBSchema,
                                     hasValidationError: boolean = false): Promise<void> => {
  const connection: mysql.Connection = getConnection();

  const { activityCode, communicationPreferences } = testResult;

  try {
    await connection.promise().query(buildTestResultInsert(testResult, hasValidationError));
    await connection.promise().query(buildUploadQueueInsert(testResult, IntegrationType.TARS));
    if (
      isCompletedTest(activityCode) &&
      hasCandidateCommunicationPermission(communicationPreferences.communicationMethod)
    ) {
      await connection.promise().query(buildUploadQueueInsert(testResult, IntegrationType.NOTIFY));
    }
    await connection.promise().query(buildUploadQueueInsert(testResult, IntegrationType.RSIS));
  } catch (err) {
    connection.rollback();
    throw err;
  } finally {
    connection.end();
  }
};
