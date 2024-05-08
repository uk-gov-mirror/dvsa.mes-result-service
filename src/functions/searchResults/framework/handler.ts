import { APIGatewayEvent } from 'aws-lambda';
import { bootstrapLogging, debug, error, info } from '@dvsa/mes-microservice-common/application/utils/logger';
import { createResponse } from '@dvsa/mes-microservice-common/application/api/create-response';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';
import { getConciseSearchResults } from './repositories/search-repository';
import { bootstrapConfig } from '../../../common/framework/config/config';
import * as joi from 'joi';
import { QueryParameters } from '../domain/query_parameters';
import { SearchResultTestSchema } from '@dvsa/mes-search-schema';
import { get } from 'lodash';
import { ExaminerRole } from '@dvsa/mes-microservice-common/domain/examiner-role';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';
import { TestResultRecord } from '../../../common/domain/test-results';
import { getStaffNumberFromRequestContext } from '@dvsa/mes-microservice-common/framework/security/authorisation';
import { formatApplicationReference } from '@dvsa/mes-microservice-common/domain/tars';

export async function handler(event: APIGatewayEvent) {
  try {
    bootstrapLogging('search-test-results', event);

    await bootstrapConfig();

    const queryParameters: QueryParameters = new QueryParameters();

    if (!event.queryStringParameters) {
      error('No query params supplied');
      return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
    }

    // Set the parameters from the event to the queryParameter holder object
    if (event.queryStringParameters.startDate) {
      queryParameters.startDate = event.queryStringParameters.startDate;
    }
    if (event.queryStringParameters.endDate) {
      queryParameters.endDate = event.queryStringParameters.endDate;
    }
    if (event.queryStringParameters.driverNumber) {
      queryParameters.driverNumber = event.queryStringParameters.driverNumber;
    }
    if (event.queryStringParameters.staffNumber) {
      queryParameters.staffNumber = event.queryStringParameters.staffNumber;
    }
    // guard against filtering on rekey without providing a staff number

    if (event.queryStringParameters.rekey) {
      queryParameters.rekey = !!(event.queryStringParameters.rekey === 'true' && queryParameters.staffNumber);
    }
    if (event.queryStringParameters.dtcCode) {
      queryParameters.dtcCode = event.queryStringParameters.dtcCode;
    }
    if (event.queryStringParameters.applicationReference) {
      queryParameters.applicationReference = event.queryStringParameters.applicationReference;
    }
    if (event.queryStringParameters.excludeAutoSavedTests) {
      queryParameters.excludeAutoSavedTests = event.queryStringParameters.excludeAutoSavedTests === 'true' ?
        'true' : 'false';
    }
    if (event.queryStringParameters.activityCode) {
      queryParameters.activityCode = event.queryStringParameters.activityCode;
    }
    if (event.queryStringParameters.category) {
      queryParameters.category = event.queryStringParameters.category;
    }
    if (event.queryStringParameters.passCertificateNumber) {
      queryParameters.passCertificateNumber = event.queryStringParameters.passCertificateNumber;
    }

    if (Object.keys(queryParameters).length === 0) {
      error('No query params supplied');
      return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
    }

    const parametersSchema = joi.object().keys({
      startDate: joi.string().regex(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/).optional()
        .label('Please provide a valid date with the format \'YYYY-MM-DD\''),
      endDate: joi.string().regex(/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/).optional()
        .label('Please provide a valid date with the format \'YYYY-MM-DD\''),
      driverId: joi.string().alphanum().max(16).optional(),
      staffNumber: joi.string().alphanum().optional(),
      rekey: joi.boolean().optional(),
      dtcCode: joi.string().alphanum().optional(),
      appRef: joi.number().max(1000000000000).optional(),
      excludeAutoSavedTests: joi.string().optional(),
      activityCode: joi.string().alphanum().optional(),
      category: joi.string().optional(),
      passCertificateNumber: joi.string().optional(),
    });

    const validationResult = parametersSchema.validate({
      driverId: queryParameters.driverNumber,
      staffNumber: queryParameters.staffNumber,
      rekey: queryParameters.rekey,
      dtcCode: queryParameters.dtcCode,
      appRef: queryParameters.applicationReference,
      startDate: queryParameters.startDate,
      endDate: queryParameters.endDate,
      excludeAutoSavedTests: queryParameters.excludeAutoSavedTests,
      activityCode: queryParameters.activityCode,
      category: queryParameters.category,
      passCertificateNumber: queryParameters.passCertificateNumber,
    });

    if (validationResult.error) {
      error('Validation error', validationResult.error);
      return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
    }

    const ldtmPermittedQueries = [
      'startDate', 'staffNumber', 'endDate', 'driverNumber',
      'dtcCode', 'applicationReference', 'excludeAutoSavedTests',
      'activityCode', 'category', 'passCertificateNumber',
      'rekey',
    ];

    const dePermittedQueries = ['driverNumber', 'applicationReference', 'excludeAutoSavedTests'];

    const isLDTM = event.requestContext.authorizer.examinerRole === ExaminerRole.LDTM;

    const isDLG = event.requestContext.authorizer.examinerRole === ExaminerRole.DLG;

    const staffNumber: string = getStaffNumberFromRequestContext(event.requestContext);

    const searchingForOwnTest = isSearchingForOwnTests(queryParameters, staffNumber);

    debug('Searching using', queryParameters);

    debug('Searching as', event.requestContext.authorizer.examinerRole);

    // This is to be safe, incase new parameters are added for DE only in the future
    if (isDLG || isLDTM || searchingForOwnTest) {
      for (const key in queryParameters) {
        if (!ldtmPermittedQueries.includes(key)) {
          const role = isLDTM ? 'LDTM' : 'User searching for own test';
          error(`${role} is not permitted to use the parameter ${key}`);
          return createResponse(`${role} is not permitted to use the parameter ${key}`, HttpStatus.BAD_REQUEST);
        }
      }
    } else if (!isLDTM && !isDLG) {
      for (const key in queryParameters) {
        if (!dePermittedQueries.includes(key)) {
          error(`DE is not permitted to use the parameter ${key}`);
          return createResponse(`DE is not permitted to use the parameter ${key}`, HttpStatus.BAD_REQUEST);
        }
      }
      queryParameters.staffNumber = staffNumber;
    }

    const result: TestResultRecord[] = await getConciseSearchResults(queryParameters);

    const results: any[] = result.map((row) => {
      return {
        ...row.test_result,
        autosave: row.autosave.readIntBE(0, row.autosave.length),
      };
    }
    );

    const condensedTestResult: SearchResultTestSchema[] = [];

    for (const testResultRow of results) {
      const appRef = testResultRow.journalData.applicationReference;
      condensedTestResult.push(
        {
          costCode: testResultRow.journalData.testCentre.costCode,
          testDate: testResultRow.journalData.testSlotAttributes.start,
          driverNumber: testResultRow.journalData.candidate.driverNumber,
          candidateName: testResultRow.journalData.candidate.candidateName,
          applicationReference: formatApplicationReference(appRef),
          category: testResultRow.category,
          activityCode: testResultRow.activityCode,
          passCertificateNumber: get(testResultRow, 'passCompletion.passCertificateNumber', null),
          grade: get(testResultRow, 'testData.review.grade', null),
          autosave: testResultRow.autosave,
        },
      );
    }

    info('Number of test results returning ', results.length);
    return createResponse(condensedTestResult, HttpStatus.OK);
  } catch (err) {
    error('Search results', err);
    return createResponse(err, HttpStatus.BAD_REQUEST);
  }
}

const isSearchingForOwnTests = (queryParameters: QueryParameters, staffNumber: string): boolean => {
  return queryParameters && queryParameters.staffNumber === staffNumber;
};
