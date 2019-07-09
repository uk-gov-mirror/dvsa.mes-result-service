import * as jwtVerificationSvc from '../jwt-verification-service';
import { APIGatewayEvent, APIGatewayProxyEvent } from 'aws-lambda';
import {
  sampleToken_12345678,
  sampleTest_12345678,
} from '../../framework/__tests__/handler.spec.data';
import { getStaffIdFromTest } from '../../framework/handler';
const lambdaTestUtils = require('aws-lambda-test-utils');

describe('JWTVerificationService', () => {

  let dummyApigwEvent: APIGatewayEvent;

  beforeEach(() => {
    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({
      headers: {
        Authorization: sampleToken_12345678,
      },
    });
    // @ts-ignore
    dummyApigwEvent.requestContext = {
      authorizer: {
        staffNumber: '12345678',
      },
    };
  });

  describe('verifyRequest', () => {
    it('should return false if there is no staff number in the context', () => {
      const noAuthContextRequest: APIGatewayProxyEvent = {
        ...dummyApigwEvent,
        // @ts-ignore
        requestContext: {},
      };
      const res = jwtVerificationSvc.verifyRequest(noAuthContextRequest, getStaffIdFromTest(sampleTest_12345678));
      expect(res).toEqual(false);
    });
    it('should return false if the staff number in the request context doesnt match the compared staff number', () => {
      const nonMatchingRequestContext: APIGatewayProxyEvent = {
        ...dummyApigwEvent,
        // @ts-ignore
        requestContext: {
          authorizer: {
            staffNumber: '0000',
          },
        },
      };
      const res = jwtVerificationSvc.verifyRequest(nonMatchingRequestContext, getStaffIdFromTest(sampleTest_12345678));
      expect(res).toEqual(false);
    });
    it('should return true when the staff number in the request context matches for the provided staff number', () => {
      const matchingRequestContext: APIGatewayProxyEvent = {
        ...dummyApigwEvent,
        // @ts-ignore
        requestContext: {
          authorizer: {
            staffNumber: '12345678',
          },
        },
      };
      const res = jwtVerificationSvc.verifyRequest(matchingRequestContext, getStaffIdFromTest(sampleTest_12345678));
      expect(res).toEqual(true);
    });
  });

});
