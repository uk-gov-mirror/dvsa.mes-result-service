import { APIGatewayEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import Response from '../../../common/application/api/Response';

export async function handler(event: APIGatewayEvent, fnCtx: Context): Promise<Response> {
  return createResponse({}, HttpStatus.CREATED);
}
