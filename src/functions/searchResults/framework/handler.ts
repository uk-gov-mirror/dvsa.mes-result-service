import { APIGatewayEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import Response from '../../../common/application/api/Response';
import { SearchRepository } from './repositories/search-repository';
import { DriverDetail } from './database/query-builder';

export async function handler(event: APIGatewayEvent, fnCtx: Context): Promise<Response> {
  // TODO: Retrieve isLDTM value from fnCtx for LDTM searches
  const { filter, value } = event.queryStringParameters;
  try {
    // TODO: Add some joi validation to the url params
    // TODO: Retrieve staffNumber from JWT in event.headers.Authorization
    const result = await new SearchRepository().searchForTestResultWithDriverDetails(filter as DriverDetail, value);
    return createResponse(result, HttpStatus.OK);
  } catch (err) {
    console.log('### error in driver details search ###');
    console.log(err);
    return createResponse(err, HttpStatus.BAD_REQUEST);
  }

}
