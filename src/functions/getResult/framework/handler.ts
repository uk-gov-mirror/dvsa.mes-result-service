import { APIGatewayEvent } from 'aws-lambda';

import { bootstrapConfig } from '../../../common/framework/config/config';
import { createResponse } from '@dvsa/mes-microservice-common/application/api/create-response';
import { getResult } from './repositories/get-result-repository';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';
import * as joi from 'joi';
import { TestResultRecord } from '../../../common/domain/test-results';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';
import { gzipSync } from 'zlib';
import {
  getAppRefFromPathParameters,
  getStaffNumberFromPathParameters,
} from '../../../common/application/utils/getPathParms';
import {bootstrapLogging, error} from '@dvsa/mes-microservice-common/application/utils/logger';

export async function handler(event: APIGatewayEvent) {
  try {
    bootstrapLogging('get-result', event);

    await bootstrapConfig();

    const appRefPathParam = getAppRefFromPathParameters(event);
    const staffNumberParam = getStaffNumberFromPathParameters(event);

    const parametersSchema = joi.object().keys({
      staffNumber: joi.string().alphanum(),
      appRef: joi.string().max(12),
    });

    const validationResult = parametersSchema.validate({
      staffNumber: staffNumberParam,
      appRef: appRefPathParam,
    });

    if (validationResult.error) {
      error('Validation error', validationResult.error);
      return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
    }

    const result: TestResultRecord[] = await getResult(appRefPathParam);

    const results: TestResultSchemasUnion[] = result.map(row => row.test_result);

    if (results.length === 0) {
      error('No records found matching criteria');
      return createResponse('No records found matching criteria', HttpStatus.BAD_REQUEST);
    }

    if (results.length > 1) {
      error(`More than one record found for URL params (${appRefPathParam}, ${staffNumberParam})`);
      return createResponse('More than one record found, internal error', HttpStatus.BAD_REQUEST);
    }

    const compressedPayload = gzipSync(JSON.stringify(results[0])).toString('base64');
    return createResponse(compressedPayload, HttpStatus.OK);
  } catch (err) {
    error('Internal server error', err);
    return createResponse(err, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
