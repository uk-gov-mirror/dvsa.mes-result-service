import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { isNullOrBlank } from '../../../functions/postResult/framework/handler';
import { updateUpload } from '../application/update-upload-service';
import { error, warn, bootstrapLogging } from '@dvsa/mes-microservice-common/application/utils/logger';
import { InconsistentUpdateError } from '../domain/InconsistentUpdateError';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {

  bootstrapLogging('update-upload-status', event);
  await bootstrapConfig();

  let body: string;
  let appRef: number;
  const appRefPathParam = event.pathParameters['app-ref'];

  if (isNullOrBlank(event.body) || isNullOrBlank(appRefPathParam)) {
    return createResponse({ message: 'Empty path app-ref or request body' }, HttpStatus.BAD_REQUEST);
  }

  appRef = parseInt(appRefPathParam, 10);
  if (isNaN(appRef)) {
    return createResponse(
      { message: `Error application reference is NaN: ${appRefPathParam}` }, HttpStatus.BAD_REQUEST);
  }

  try {
    body = JSON.parse(event.body);
  } catch (err) {
    error('Failure parsing request body', event.body);
    return createResponse({ message: 'Error parsing request body into JSON' }, HttpStatus.BAD_REQUEST);
  }

  try {
    await updateUpload(appRef, body);
  } catch (err) {
    if (err instanceof InconsistentUpdateError) {
      warn('InconsistentUpdateError', err);
      return createResponse(
        { message: `Failed to update a single record for application reference ${appRef}` },
        HttpStatus.NOT_FOUND,
      );
    }
    error(err);
    return createResponse(
      { message: `Error updating the status in UUS of Reference Number: ${appRef}` }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  return createResponse({}, HttpStatus.CREATED);
}
