import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import Response from '../../../common/application/api/Response';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { decompressTestResult } from '../application/decompression-service';
import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import { saveTestResult } from '../application/save-result-service';
import { TestResultDecompressionError } from '../domain/errors/test-result-decompression-error';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { validateMESJoiSchema } from '../domain/mes-joi-schema-service';
import * as logger from '../../../common/application/utils/logger';
import jwtDecode from 'jwt-decode';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {

  const staffNumber = getStaffNumber(event.pathParameters);
  if (staffNumber === null) {
    return createResponse('No staffNumber provided', HttpStatus.BAD_REQUEST);
  }

  if (process.env.EMPLOYEE_ID_VERIFICATION_DISABLED !== 'true') {
    const employeeId = getEmployeeIdFromToken(event.headers.Authorization);
    if (employeeId === null) {
      return createResponse('Invalid authorisation token', HttpStatus.UNAUTHORIZED);
    }
    if (employeeId !== staffNumber) {
      logger.warn(`Invalid staff number (${staffNumber}) requested by employeeId ${employeeId}`);
      return createResponse('Invalid staffNumber', HttpStatus.FORBIDDEN);
    }
  }

  await bootstrapConfig();
  console.log(`Invoked with body ${event.body}`);
  const { body } = event;
  const hasValidationError: boolean = false;

  if (isNullOrBlank(body)) {
    return createResponse({}, HttpStatus.BAD_REQUEST);
  }

  try {
    const testResult: StandardCarTestCATBSchema = decompressTestResult(body as string);
    const validationResult = validateMESJoiSchema(testResult);

    if (validationResult.error) {
      // Validation error thrown with no action possible by examiner - save results in error state - return HTTP 201
      // to prevent app stalling at 'upload pending'.
      console.error(`Could not validate the test result body ${validationResult.error}`);
      await saveTestResult(testResult, hasValidationError);
      return createResponse({ }, HttpStatus.CREATED);
    }

    await saveTestResult(testResult);
  } catch (err) {
    if (err instanceof TestResultDecompressionError) {
      console.error(`Could not decompress test result body ${body}`);
      return createResponse({ message: 'The test result body could not be decompressed' }, HttpStatus.BAD_REQUEST);
    }
    console.error(err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  return createResponse({}, HttpStatus.CREATED);
}

export const isNullOrBlank = (body: string | null): boolean => {
  return body === null || body === undefined || body.trim().length === 0;
};

export function getStaffNumber(pathParams: { [key: string]: string } | null): string | null {
  if (pathParams === null
    || typeof pathParams.staffNumber !== 'string'
    || pathParams.staffNumber.trim().length === 0) {
    logger.warn('No staffNumber path parameter found');
    return null;
  }
  return pathParams.staffNumber;
}

export function getEmployeeIdFromToken(token: string): string | null {
  if (token === null) {
    logger.warn('No authorisation token in request');
    return null;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    const employeeIdKey = process.env.EMPLOYEE_ID_EXT_KEY || '';
    if (employeeIdKey.length === 0) {
      logger.error('No key specified to find employee ID from JWT');
      return null;
    }

    const employeeIdFromJwt = decodedToken[employeeIdKey];
    if (!employeeIdFromJwt) {
      logger.warn('No employeeId found in authorisation token');
      return null;
    }

    return Array.isArray(employeeIdFromJwt) ?
      getEmployeeIdFromArray(employeeIdFromJwt) : getEmployeeIdStringProperty(employeeIdFromJwt);
  } catch (err) {
    logger.error(err);
    return null;
  }
}

export function getEmployeeIdFromArray(attributeArr: string[]): string | null {
  if (attributeArr.length === 0) {
    logger.warn('No employeeId found in authorisation token');
    return null;
  }
  return attributeArr[0];
}

export function getEmployeeIdStringProperty(employeeId: any): string | null {
  if (typeof employeeId !== 'string' || employeeId.trim().length === 0) {
    logger.warn('No employeeId found in authorisation token');
    return null;
  }
  return employeeId;
}
