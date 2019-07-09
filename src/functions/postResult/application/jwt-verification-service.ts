import * as logger from '../../../common/application/utils/logger';
import { getEmployeeIdFromRequestContext } from '../../../common/application/utils/getEmployeeId';
import { APIGatewayProxyEvent } from 'aws-lambda';

export const verifyRequest = (request: APIGatewayProxyEvent, staffId: string): boolean => {
  const employeeId = getEmployeeIdFromRequestContext(request.requestContext);
  if (employeeId === null) {
    logger.warn('No employee ID found in request context');
    return false;
  }
  return employeeId === staffId;
};
