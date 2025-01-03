import { APIGatewayEvent } from 'aws-lambda';

import { bootstrapConfig } from '../../../common/framework/config/config';
import { createResponse } from '@dvsa/mes-microservice-common/application/api/create-response';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';
import { bootstrapLogging, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { FullResultQueryParameters } from '../domain/query_parameters';
import { TestResultRecord } from '../../../common/domain/test-results';
import { gzipSync } from 'zlib';
import { getMultipleResult } from './repositories/get-result-repository';
import { decompressRequestBody } from '../../../common/application/utils/decompression-service';
import { getStaffNumberFromRequestContext } from '@dvsa/mes-microservice-common/framework/security/authorisation';

export async function handler(event: APIGatewayEvent) {
  try {
    bootstrapLogging('postMultipleResults', event);

    await bootstrapConfig();

    const queryParameters: FullResultQueryParameters = new FullResultQueryParameters();
    const staffNumber: string = getStaffNumberFromRequestContext(event.requestContext);

    if (!event.body) {
      error('Null or blank request body');
      return createResponse('Null or blank request body', HttpStatus.BAD_REQUEST);
    }

    const parameters = decompressRequestBody(event.body);

    if (!staffNumber) {
      error('No staffNumber supplied');
      return createResponse('staffNumber has to be supplied', HttpStatus.BAD_REQUEST);
    }

    if (!parameters.applicationReferences) {
      error('No applicationReferences supplied');
      return createResponse('applicationReferences have to be supplied', HttpStatus.BAD_REQUEST);
    }

    queryParameters.applicationReferences = parameters.applicationReferences;
    if (parameters.applicationReferences.length === 0) {
      error('applicationReferences is empty or contains an empty string');
      return createResponse('applicationReferences cannot be empty', HttpStatus.BAD_REQUEST);
    }

    const result: TestResultRecord[] =
      await getMultipleResult(staffNumber, queryParameters.applicationReferences);

    const compressedPayload = gzipSync(JSON.stringify(result)).toString('base64');
    return createResponse(compressedPayload, HttpStatus.OK);
  } catch (err) {
    error('Internal server error', err);
    return createResponse('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
