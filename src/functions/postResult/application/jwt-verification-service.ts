import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import * as logger from '../../../common/application/utils/logger';
import jwtDecode = require('jwt-decode');

export const verifyRequest = (headers: { [key: string]: string }, test: StandardCarTestCATBSchema): boolean => {

  const employeeId = getEmployeeIdFromToken(headers.Authorization);
  if (employeeId === null) {
    logger.warn(`No valid authorisation token in request ${employeeId}`);
    return false;
  }
  const staffId = getStaffIdFromTest(test);
  if (staffId === null) {
    logger.warn('No staffId found in the test data');
    return false;
  }
  if (employeeId === staffId) {
    return true;
  }
  return false;
};

export const getEmployeeIdFromToken = (token: string): string | null => {
  if (token === null || token === undefined) {
    logger.warn('No authorisation token in request');
    return null;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    const employeeIdKey = process.env.EMPLOYEE_ID_EXT_KEY;
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
};

export const getEmployeeIdStringProperty = (employeeId: any): string | null => {
  if (typeof employeeId !== 'string' || employeeId.trim().length === 0) {
    logger.warn('No employeeId found in authorisation token');
    return null;
  }
  return employeeId;
};

export const getEmployeeIdFromArray = (attributeArr: string[]): string | null => {
  if (attributeArr.length === 0) {
    logger.warn('No employeeId found in authorisation token');
    return null;
  }
  return attributeArr[0];
};

export const getStaffIdFromTest = (test: StandardCarTestCATBSchema) => {
  if (test && test.journalData && test.journalData.examiner && test.journalData.examiner.staffNumber) {
    return test.journalData.examiner.staffNumber;
  }
  logger.warn('No staffId found in the test data');
  return null;
};
