import { APIGatewayEvent, Context } from 'aws-lambda';

import { bootstrapConfig } from '../../../common/framework/config/config';
import Response from '../../../common/application/api/Response';
import { GetResultRepository } from './respositories/get-result-repository';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import createResponse from '../../../common/application/utils/createResponse';

export async function handler(event: APIGatewayEvent, fnCtx: Context): Promise<Response> {
  await bootstrapConfig();
  try {
    const appRefPathParam = event.pathParameters['app-ref'];
    const staffNumberParam = event.pathParameters['staff-number'];
    // TODO: Perform validation
    const result = await new GetResultRepository().getResult(appRefPathParam, staffNumberParam);
    return createResponse(result, HttpStatus.OK);
  } catch (err) {
    console.log(err);
    return createResponse(err, HttpStatus.BAD_REQUEST);
  }
}
