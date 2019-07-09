import * as logger from '../../../common/application/utils/logger';
import { APIGatewayEventRequestContext } from 'aws-lambda';

export const getEmployeeIdFromRequestContext = (requestContext: APIGatewayEventRequestContext): string | null => {
  if (requestContext.authorizer && typeof requestContext.authorizer.staffNumber === 'string') {
    return requestContext.authorizer.staffNumber;
  }
  logger.error('No staff number found in request context');
  return null;
};
