import * as jwtVerificationSvc from '../jwt-verification-service';
import { APIGatewayEvent } from 'aws-lambda';
import {
    sampleToken_12345678,
    sampleTest_12345678,
    sampleTest_87654321,
    sampleTest_empty,
} from '../../framework/__tests__/handler.spec.data';
import { getStaffIdFromTest } from '../../framework/handler';
const lambdaTestUtils = require('aws-lambda-test-utils');

describe('JWTVerificationService', () => {

  let dummyApigwEvent: APIGatewayEvent;

  beforeEach(() => {
    process.env.EMPLOYEE_ID_EXT_KEY = 'extn.employeeId';
    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({
      headers: {
        Authorization: sampleToken_12345678,
      },
    });
  });

  describe('verifyRequest', () => {
    it('should return true if valid employeeId from JWT and staffId from body match', () => {
      const res = jwtVerificationSvc.verifyRequest(dummyApigwEvent.headers, getStaffIdFromTest(sampleTest_12345678));
      expect(res).toEqual(true);
    });
    it('should return false if employeeId and JWT dont match', () => {
      const res = jwtVerificationSvc.verifyRequest(dummyApigwEvent.headers, getStaffIdFromTest(sampleTest_87654321));
      expect(res).toEqual(false);
    });
    it('should return false if missing employeeId from JWT', () => {
      dummyApigwEvent.headers.Authorization = null;
      const res = jwtVerificationSvc.verifyRequest(dummyApigwEvent.headers, getStaffIdFromTest(sampleTest_87654321));
      expect(res).toEqual(false);
    });
    it('should return false if missing staffId from body', () => {
      const res = jwtVerificationSvc.verifyRequest(dummyApigwEvent.headers, getStaffIdFromTest(sampleTest_empty));
      expect(res).toEqual(false);
    });
  });

  describe('getEmployeeIdFromToken', () => {
    it('should return null if token is null', () => {
      const res = jwtVerificationSvc.getEmployeeIdFromToken(null);
      expect(res).toEqual(null);
    });
    it('should return null if EMPLOYEE_ID_EXT_KEY is null', () => {
      process.env.EMPLOYEE_ID_EXT_KEY = null;
      const res = jwtVerificationSvc.getEmployeeIdFromToken(sampleToken_12345678);
      expect(res).toEqual(null);
    });
  });

  describe('getEmployeeIdStringProperty', () => {
    it('should return null if employeeId is null', () => {
      const res = jwtVerificationSvc.getEmployeeIdStringProperty(null);
      expect(res).toEqual(null);
    });
    it('should return null if employeeId is a number', () => {
      const res = jwtVerificationSvc.getEmployeeIdStringProperty(1234567890);
      expect(res).toEqual(null);
    });
    it('should return null if employeeId is an empty string', () => {
      const res = jwtVerificationSvc.getEmployeeIdStringProperty(' ');
      expect(res).toEqual(null);
    });
    it('should return the employeeId if it is valid', () => {
      const res = jwtVerificationSvc.getEmployeeIdStringProperty('1234567890');
      expect(res).toEqual('1234567890');
    });
  });

  describe('getEmployeeIdFromArray', () => {
    it('should return the first value of the array', () => {
      const exampleArr = ['first', 'second', 'third'];
      const resp = jwtVerificationSvc.getEmployeeIdFromArray(exampleArr);
      expect(resp).toEqual('first');
    });
    it('should return null if empty array', () => {
      const exampleArr = [];
      const rtn = jwtVerificationSvc.getEmployeeIdFromArray(exampleArr);
      expect(rtn).toBeNull();
    });
  });
});
