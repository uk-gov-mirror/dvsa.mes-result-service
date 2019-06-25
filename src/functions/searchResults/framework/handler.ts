import { APIGatewayEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import Response from '../../../common/application/api/Response';
import { SearchRepository } from './repositories/search-repository';
import { bootstrapConfig } from '../../../common/framework/config/config';
import joi from '@hapi/joi';
import { QueryParameters } from '../domain/query_parameters';
import { SearchResultTestSchema } from '@dvsa/mes-search-schema/index';

export async function handler(event: APIGatewayEvent, fnCtx: Context): Promise<Response> {
  await bootstrapConfig();
  try {
    // TODO: Retrieve isLDTM value from fnCtx for LDTM searches
    // TODO: Create index for searchable columns
    // Temporary workaround having isLDTM as a parameter

    if (!event.queryStringParameters) {
      return createResponse('Query parameters have to be supplied', HttpStatus.BAD_REQUEST);
    }

    const queryParameters : QueryParameters = new QueryParameters();
    const isLDTM = event.queryStringParameters.isLDTM;

    // Set the parameters from the event to the queryParameter holder object
    // Todo move all IF statements to a common shared method
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
    if (event.queryStringParameters.dtcCode) {
      queryParameters.dtcCode = event.queryStringParameters.dtcCode;
    }
    if (event.queryStringParameters.applicationReference) {
      queryParameters.applicationReference = event.queryStringParameters.applicationReference;
    }

    // TODO: Update the validation, not working at the moment, seems to fail for every request
    // const parametersSchema = joi.object().keys({
    //   startDate: joi.date().format('YYYY-MM-DD').optional(),
    //   endDate: joi.date().format('YYYY-MM-DD').optional(),
    //   driverId: joi.string().alphanum().max(16).optional(),
    //   staffNumber: joi.string().alphanum().optional(),
    //   dtcCode: joi.string().alphanum().optional(),
    //   appRef: joi.number().max(1000000000000).optional(),
    // });

    // const validationResult =
    //   joi.validate({
    //     driverId: queryParameters.driverId,
    //     staffNumber: queryParameters.staffNumber,
    //     dtcCode: queryParameters.dtcCode,
    //     appRef: queryParameters.appRef
    //    }, parametersSchema);

    // if (validationResult.error) {
    //   return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
    // }

    const ldtmPermittedQueries = [
      'startDate', 'staffNumber', 'endDate', 'driverNumber',
      'dtcCode', 'applicationReference',
    ];

    const dePermittedQueries = ['driverNumber', 'applicationReference'];

    // This is to be safe, incase new parameters are added for DE only in the future
    if (isLDTM) {
      for (const key in queryParameters) {
        if (!ldtmPermittedQueries.includes(key)) {
          return createResponse(`LDTM is not permitted to use the parameter ${key}`, HttpStatus.BAD_REQUEST);
        }
      }
    }

    if (!isLDTM) {
      for (const key in queryParameters) {
        if (!dePermittedQueries.includes(key)) {
          return createResponse(`DE is not permitted to use the parameter ${key}`, HttpStatus.BAD_REQUEST);
        }
      }
      // TODO: Attach individuals staffNumber as a queryParameter
      // Retrieve staffNumber from JWT in event.headers.Authorization
    }

    const result = await new SearchRepository().searchForTestResultWithDriverDetails(queryParameters);
    
    const results = result[0].map(row => row.test_result);
    const condensedTestResult : SearchResultTestSchema [] = [];

    for (let testResultRow of results) {
      condensedTestResult.push(
        {
          "costCode": testResultRow.journalData.testCentre.costCode,
          "testDate": testResultRow.journalData.testSlotAttributes.start,
          "staffNumber": testResultRow.journalData.examiner.staffNumber,
          "candidateName": testResultRow.journalData.candidate.candidate,
          "applicationReference": testResultRow.journalData.applicationReference.applicationId,
          "category": testResultRow.category,
          "activityCode": testResultRow.activityCode
        }
      )
    }

    return createResponse(condensedTestResult, HttpStatus.OK);
  } catch (err) {
    return createResponse(err, HttpStatus.BAD_REQUEST);
  }

}
