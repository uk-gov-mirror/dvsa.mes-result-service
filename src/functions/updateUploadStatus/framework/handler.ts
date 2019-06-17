import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import Response from '../../../common/application/api/Response';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { isNullOrBlank } from '../../../functions/postResult/framework/handler';
import { updateUpload } from '../application/update-upload-service';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {

  await bootstrapConfig();

  let body: string;
  let appRef: number;
  const appRefPathParam = event.pathParameters['appRef'];

  if (isNullOrBlank(event.body) || isNullOrBlank(appRefPathParam)) {
    return createResponse({ message: 'Empty path appRef or request body' }, HttpStatus.BAD_REQUEST);
  }

  appRef = parseInt(appRefPathParam, 10);
  if (isNaN(appRef)) {
    return createResponse(
      { message: `Error application reference is NaN: ${appRefPathParam}` }, HttpStatus.BAD_REQUEST);
  }

  try {
    body = JSON.parse(event.body);
  } catch (err) {
    console.log(err);
    return createResponse({ message: 'Error parsing request body into JSON' }, HttpStatus.BAD_REQUEST);
  }

  try {
    await updateUpload(appRef, body);
  } catch (err) {
    console.log(err);
    return createResponse(
      { message: `Error updating the status in UUS of Reference Number: ${appRef}` }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  return createResponse({}, HttpStatus.CREATED);
}
