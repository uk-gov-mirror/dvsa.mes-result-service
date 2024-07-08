import { APIGatewayEvent } from 'aws-lambda';
import { handler } from '../handler';

const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, Times } from 'typemoq';
import * as configService from '../../../../common/framework/config/config';
import {
  sampleToken_12345678,
  testResult,
} from './handler.spec.data';
import * as multipleResultService from '../repositories/get-result-repository';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';
import { gzipSync } from 'zlib';
import * as authService from '@dvsa/mes-microservice-common/framework/security/authorisation';

describe('postMultipleResults', () => {
  let dummyApigwEvent: APIGatewayEvent;
  const moqMultipleResults = Mock.ofInstance(multipleResultService.getMultipleResult);
  const moqAuthService = Mock.ofInstance(authService.getStaffNumberFromRequestContext);
  const moqBootstrapConfig = Mock.ofInstance(configService.bootstrapConfig);

  // Simulate encoding and compressing the body
  const simulateEncodedCompressedBody = (bodyObject: object) => {
    const jsonString = JSON.stringify(bodyObject);
    const compressed = gzipSync(Buffer.from(jsonString));
    return compressed.toString('base64');
  };

  beforeEach(() => {
    moqBootstrapConfig.reset();
    moqAuthService.reset();
    moqMultipleResults.reset();

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent(
      {
        headers: {
          Authorization: sampleToken_12345678,
        },
      },
    );

    process.env.EMPLOYEE_ID_EXT_KEY = 'extn.employeeId';

    spyOn(configService, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
  });

  describe('configuration initialisation', () => {
    it('should always bootstrap the config', async () => {
      await handler(dummyApigwEvent);
      moqBootstrapConfig.verify(x => x(), Times.once());
    });
  });

  describe('handler', () => {
    it('should fail with bad request and give an error message', async () => {
      dummyApigwEvent.body = null;
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(JSON.parse(resp.body)).toEqual('Null or blank request body');
    });

    it('should fail with bad request and give an error message - no staffNumber', async () => {
      spyOn(authService, 'getStaffNumberFromRequestContext').and.returnValue(null);
      const bodyObject = { applicationReferences: ['123', '234'] };
      dummyApigwEvent.body = simulateEncodedCompressedBody(bodyObject);
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(JSON.parse(resp.body)).toEqual('staffNumber has to be supplied');
    });

    it('should fail with bad request and give an error message - staffNumber, no applicationReferences', async () => {
      spyOn(authService, 'getStaffNumberFromRequestContext').and.returnValue('1234567');
      const bodyObject = { something: null };
      dummyApigwEvent.body = simulateEncodedCompressedBody(bodyObject);

      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(JSON.parse(resp.body)).toEqual('applicationReferences have to be supplied');
    });

    it('should fail with bad request and give an error message - applicationReferences wrong format', async () => {
      spyOn(authService, 'getStaffNumberFromRequestContext').and.returnValue('1234567');
      const bodyObject = { applicationReferences: '' };
      dummyApigwEvent.body = simulateEncodedCompressedBody(bodyObject);

      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(JSON.parse(resp.body)).toEqual('applicationReferences have to be supplied');
    });

    it('should return 200 with an encoded payload', async () => {
      spyOn(authService, 'getStaffNumberFromRequestContext').and.returnValue('1234567');
      const bodyObject = { applicationReferences: ['123', '234'] };
      dummyApigwEvent.body = simulateEncodedCompressedBody(bodyObject);

      spyOn(multipleResultService, 'getMultipleResult').and.resolveTo(testResult);
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toEqual(HttpStatus.OK);
      expect(JSON.parse(resp.body)).toEqual(gzipSync(JSON.stringify(testResult)).toString('base64'));
    });

    it('returns internal server error when getMultipleResult throws error', async () => {
      spyOn(authService, 'getStaffNumberFromRequestContext').and.returnValue('1234567');
      const bodyObject = { applicationReferences: ['123', '234'] };
      dummyApigwEvent.body = simulateEncodedCompressedBody(bodyObject);

      spyOn(multipleResultService, 'getMultipleResult').and.throwError('Test error');
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });

  });
});
