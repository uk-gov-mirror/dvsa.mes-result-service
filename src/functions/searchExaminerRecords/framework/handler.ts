import { APIGatewayEvent } from 'aws-lambda';
import { bootstrapLogging, debug, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { QueryParameters } from '../../searchResults/domain/query_parameters';
import { createResponse } from '@dvsa/mes-microservice-common/application/api/create-response';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';
import {
  validateExaminerRecordsSchema,
} from '../application/validate-request';
import { gzipSync } from 'zlib';
import { ExaminerRecordModel } from '@dvsa/mes-microservice-common/domain/examiner-records';
import { getExaminerRecords } from './repositories/search-repository';
import moment from 'moment';

export async function handler(event: APIGatewayEvent) {
  try {
    bootstrapLogging('search-examiner-records', event);

    await bootstrapConfig();

    debug('Config bootstrapped');

    const queryParameters: QueryParameters = new QueryParameters();

    if (!event.queryStringParameters) {
      error('No query params supplied');
      return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
    }

    const allowedQueries = ['startDate', 'endDate', 'staffNumber'];

    for (const key in event.queryStringParameters) {
      if (!allowedQueries.includes(key)) {
        error(`Not permitted to use the parameter ${key}`);
        return createResponse(`Not permitted to use the parameter ${key}`, HttpStatus.BAD_REQUEST);
      }
    }

    // Set the parameters from the event to the queryParameter holder object
    queryParameters.startDate = event.queryStringParameters.startDate ?
      event.queryStringParameters.startDate :
      moment().subtract(18, 'months').format('YYYY-MM-DD').toString();
    queryParameters.endDate = event.queryStringParameters.endDate ?
      event.queryStringParameters.endDate :
      moment().format('YYYY-MM-DD').toString();
    if (event.queryStringParameters.staffNumber) queryParameters.staffNumber = event.queryStringParameters.staffNumber;

    debug('Validating request');

    const {error: joiError} = validateExaminerRecordsSchema(queryParameters);

    if (joiError) {
      error('Validation error', joiError);
      return createResponse(joiError, HttpStatus.BAD_REQUEST);
    }

    debug('Validating passed');

    const result: ExaminerRecordModel[] = await getExaminerRecords(queryParameters);

    if (result.length > 0) {
      debug(`Results found for ${queryParameters.staffNumber} with a payload size of ${result.length}`);
    } else {
      debug(`No results found for ${queryParameters.staffNumber}`);
    }

    return createResponse(gzipSync(JSON.stringify(result)).toString('base64'), HttpStatus.OK);
  } catch (err) {
    error('Unknown error', JSON.stringify(err));
    return createResponse('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
