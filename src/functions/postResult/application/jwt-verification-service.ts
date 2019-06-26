import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import * as logger from '../../../common/application/utils/logger';
import jwtDecode = require('jwt-decode');
import { getEmployeeIdFromToken } from '../../../common/application/utils/getEmployeeId';

export const verifyRequest = (headers: { [key: string]: string }, staffId: string): boolean => {

  if (staffId === null) {
    logger.warn('No staffId found in the test data');
    return false;
  }
  const employeeId = getEmployeeIdFromToken(headers.Authorization);
  if (employeeId === null) {
    logger.warn(`No valid authorisation token in request ${employeeId}`);
    return false;
  }
  if (employeeId === staffId) {
    return true;
  }
  return false;
};
