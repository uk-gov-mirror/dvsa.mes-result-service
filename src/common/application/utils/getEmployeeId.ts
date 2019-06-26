import jwtDecode = require('jwt-decode');
import * as logger from '../../../common/application/utils/logger';

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
