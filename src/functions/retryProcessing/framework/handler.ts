import { Context, ScheduledEvent } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import Response from '../../../common/application/api/Response';
import { RetryProcessor } from '../application/RetryProcessor';
import { bootstrapConfig } from '../../../../src/common/framework/config/config';
import { IRetryProcessor } from '../application/IRetryProcessor';
import { error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { IRetryProcessingFacade } from '../domain/IRetryProcessingFacade';
import { RetryProcessingFacade } from '../domain/RetryProcessingFacade';
import { getConnection } from '../../../common/framework/mysql/database';
import { setIsolationLevelSerializable } from './database/query-templates';

export async function handler(event: ScheduledEvent, fnCtx: Context): Promise<Response> {
  await bootstrapConfig();

  const connection = getConnection();
  const retryProcessor: IRetryProcessor = new RetryProcessor(connection);
  const retryProcessingFacade: IRetryProcessingFacade = new RetryProcessingFacade(retryProcessor);

  try {
    await connection.promise().query(setIsolationLevelSerializable);
    await retryProcessingFacade.processRetries();
  } catch (err) {
    error('Uncaught error in handler', err);
    return createResponse(err, HttpStatus.INTERNAL_SERVER_ERROR);
  } finally {
    if (connection) connection.end();
  }
  return createResponse({}, HttpStatus.OK);
}
