import { APIGatewayEvent, Context } from 'aws-lambda';
import { handler, getStaffIdFromTest } from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, It, Times } from 'typemoq';
import * as decompressionService from '../../application/decompression-service';
import { TestResultDecompressionError } from '../../domain/errors/test-result-decompression-error';
import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import { HttpStatus } from '../../../../common/application/api/HttpStatus';
import * as saveResultSvc from '../../application/save-result-service';
import * as configSvc from '../../../../common/framework/config/config';
import * as joiValidationSvc from '../../domain/mes-joi-schema-service';
import * as jwtVerificationSvc from '../../application/jwt-verification-service';
import { ValidationResult } from '@hapi/joi';
import { sampleToken_12345678, sampleTest_12345678, sampleTest_empty } from '../__tests__/handler.spec.data';

describe('postResult handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;
  const moqDecompressionSvc = Mock.ofInstance(decompressionService.decompressTestResult);
  const moqSaveResultSvc = Mock.ofInstance(saveResultSvc.saveTestResult);
  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);
  const moqJoiValidationSvc = Mock.ofInstance(joiValidationSvc.validateMESJoiSchema);
  const moqJWTVerificationSvc = Mock.ofInstance(jwtVerificationSvc.verifyRequest);

  beforeEach(() => {
    moqDecompressionSvc.reset();
    moqSaveResultSvc.reset();
    moqBootstrapConfig.reset();
    moqJoiValidationSvc.reset();
    moqJWTVerificationSvc.reset();

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({
      headers: {
        Authorization: sampleToken_12345678,
      },
    });

    dummyContext = lambdaTestUtils.mockContextCreator(() => null);
    process.env.EMPLOYEE_ID_EXT_KEY = 'extn.employeeId';

    spyOn(decompressionService, 'decompressTestResult').and.callFake(moqDecompressionSvc.object);
    spyOn(saveResultSvc, 'saveTestResult').and.callFake(moqSaveResultSvc.object);
    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
    spyOn(joiValidationSvc, 'validateMESJoiSchema').and.callFake(moqJoiValidationSvc.object);
  });

  describe('configuration initialisation', () => {
    it('should always bootstrap the config', async () => {
      await handler(dummyApigwEvent, dummyContext);
      moqBootstrapConfig.verify(x => x(), Times.once());
    });
  });

  describe('invalid response body handling', () => {
    it('should return a 400 response if there is no body on the request', async () => {
      dummyApigwEvent.body = null;
      const resp = await handler(dummyApigwEvent, dummyContext);
      expect(resp.statusCode).toBe(400);
      expect(JSON.parse(resp.body).message).toEqual('Error: Null or blank request body');
    });
    it('should return a 400 response if the request body is blank', async () => {
      dummyApigwEvent.body = '       ';
      const resp = await handler(dummyApigwEvent, dummyContext);
      expect(resp.statusCode).toBe(400);
      expect(JSON.parse(resp.body).message).toEqual('Error: Null or blank request body');
    });
  });

  describe('handling of failed decompression', () => {
    it('should repond 400 when the decompression service throws a decompression failed error', async () => {
      dummyApigwEvent.body = 'thiswontdecompress';
      moqDecompressionSvc.setup(x => x(It.isAny())).throws(new TestResultDecompressionError());
      const resp = await handler(dummyApigwEvent, dummyContext);
      expect(resp.statusCode).toBe(400);
      expect(JSON.parse(resp.body).message).toBe('The test result body could not be decompressed');
    });
  });

  describe('JWT verification', () => {
    it('should respond with error 401 if fails JWT verification', async () => {
      dummyApigwEvent.headers.Authorization = null;
      const resp = await handler(dummyApigwEvent, dummyContext);
      expect(resp.statusCode).toEqual(401);
      expect(JSON.parse(resp.body).message).toBe('EmployeeId and staffId do not match');
    });
  });

  describe('calling saveTestResult', () => {
    it('should pass decompressed test result to saveTestResult', async () => {
      dummyApigwEvent.body = 'avalidcompressedresult';
      const fakeTestResult = Mock.ofType<StandardCarTestCATBSchema>();
      const validationResult = Mock.ofType<ValidationResult<any>>();

      moqDecompressionSvc.setup(x => x(It.isAny())).returns(() => fakeTestResult.object);
      moqJoiValidationSvc.setup(x => x(It.isAny())).returns(() => validationResult.object.value);
      spyOn(jwtVerificationSvc, 'verifyRequest').and.callFake(moqJWTVerificationSvc.object);
      moqJWTVerificationSvc.setup(x => x(It.isAny(), It.isAny())).returns(() => true);

      console.log(`the fake test result looks like ${fakeTestResult.object}`);
      const resp = await handler(dummyApigwEvent, dummyContext);

      moqDecompressionSvc.verify(x => x(It.isValue('avalidcompressedresult')), Times.once());
      moqSaveResultSvc.verify(x => x(It.isAny()), Times.once());
      expect(resp.statusCode).toBe(HttpStatus.CREATED);
    });
    it('should return a 500 response when saveTestResult fails', async () => {
      dummyApigwEvent.body = 'avalidcompressedresult';
      const fakeTestResult = Mock.ofType<StandardCarTestCATBSchema>();
      moqDecompressionSvc.setup(x => x(It.isAny())).returns(() => fakeTestResult.object);
      moqSaveResultSvc.setup(x => x(It.isAny())).throws(new Error('something we didnt expect'));
      moqJWTVerificationSvc.setup(x => x(It.isAny(), It.isAny())).returns(() => true);
      spyOn(jwtVerificationSvc, 'verifyRequest').and.callFake(moqJWTVerificationSvc.object);
      moqJWTVerificationSvc.setup(x => x(It.isAny(), It.isAny())).returns(() => true);

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
  describe('getStaffIdFromTest', () => {
    it('should return null if there is no staffId', () => {
      const resp = getStaffIdFromTest(sampleTest_empty);
      expect(resp).toEqual(null);
    });
    it('should return the correct staffId if available', () => {
      const resp = getStaffIdFromTest(sampleTest_12345678);
      expect(resp).toEqual('12345678');
    });
  });
});
