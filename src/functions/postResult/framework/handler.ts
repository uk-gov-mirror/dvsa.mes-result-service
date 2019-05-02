import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import Response from '../../../common/application/api/Response';
import { HttpStatus } from '../../../common/application/api/HttpStatus';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {
  console.log(`Invoked with body ${event.body}`);
  return createResponse({}, HttpStatus.CREATED);
}
