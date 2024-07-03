import { APIGatewayEvent } from 'aws-lambda';

import { bootstrapConfig } from '../../../common/framework/config/config';
import { createResponse } from '@dvsa/mes-microservice-common/application/api/create-response';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';
import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { FullResultQueryParameters } from '../domain/query_parameters';
import { TestResultRecord } from '../../../common/domain/test-results';
import { gzipSync } from 'zlib';
import { getMultipleResult } from './repositories/get-result-repository';

export async function handler(event: APIGatewayEvent) {
  try {
    bootstrapLogging('getMultipleResults', event);

    await bootstrapConfig();

    const queryParameters: FullResultQueryParameters = new FullResultQueryParameters();

    if (!event.queryStringParameters) {
      error('No query params supplied');
      return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
    }

    if (!event.queryStringParameters.staffNumber) {
      error('No staffNumber supplied');
      return createResponse('staffNumber has to be supplied', HttpStatus.BAD_REQUEST);
    }
    queryParameters.staffNumber = event.queryStringParameters.staffNumber;

    if (!event.queryStringParameters.applicationReferences) {
      error('No applicationReferences supplied');
      return createResponse('applicationReferences have to be supplied', HttpStatus.BAD_REQUEST);
    }

    queryParameters.applicationReferences = event.queryStringParameters.applicationReferences.split(',');
    if (queryParameters.applicationReferences.length === 0) {
      error('applicationReferences is empty or contains an empty string');
      return createResponse('applicationReferences cannot be empty', HttpStatus.BAD_REQUEST);
    }


    const result: TestResultRecord[] =
      await getMultipleResult(queryParameters.staffNumber, queryParameters.applicationReferences);

    const compressedPayload = gzipSync(JSON.stringify(result)).toString('base64');
    return createResponse(compressedPayload, HttpStatus.OK);
  } catch (err) {
    error('Internal server error', err);
    return createResponse(err, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
