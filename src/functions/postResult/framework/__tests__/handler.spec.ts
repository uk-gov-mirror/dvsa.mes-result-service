import { APIGatewayEvent, Context } from 'aws-lambda';
import { 
  handler,
  getStaffNumber,
  getEmployeeIdFromToken,
  getEmployeeIdFromArray,
  getEmployeeIdStringProperty
} from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, It, Times } from 'typemoq';
import * as decompressionService from '../../application/decompression-service';
import { TestResultDecompressionError } from '../../domain/errors/test-result-decompression-error';
import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import { HttpStatus } from '../../../../common/application/api/HttpStatus';
import * as saveResultSvc from '../../application/save-result-service';
import * as configSvc from '../../../../common/framework/config/config';
import * as joiValidationSvc from '../../domain/mes-joi-schema-service';
import { ValidationResult } from '@hapi/joi';

describe('postResult handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;
  const moqDecompressionSvc = Mock.ofInstance(decompressionService.decompressTestResult);
  const moqSaveResultSvc = Mock.ofInstance(saveResultSvc.saveTestResult);
  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);
  const moqJoiValidationSvc = Mock.ofInstance(joiValidationSvc.validateMESJoiSchema);
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1zeE1KTUxDSURXTVRQdlp5SjZ0eC1DRHh\
  3MCIsImtpZCI6Ii1zeE1KTUxDSURXTVRQdlp5SjZ0eC1DRHh3MCJ9.eyJhdWQiOiIwOWZkZDY4Yy00ZjJmLTQ1YzItYmU1N\
  S1kZDk4MTA0ZDRmNzQiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82YzQ0OGQ5MC00Y2ExLTRjYWYtYWI1OS0w\
  YTJhYTY3ZDc4MDEvIiwiaWF0IjoxNTUxODAxMjIwLCJuYmYiOjE1NTE4MDEyMjAsImV4cCI6MTU1MTgwMjcyMCwiYWNyIjo\
  iMSIsImFpbyI6IjQySmdZTENVTXI4cTFocVNmMTdpVVcwSGErWVIzcHkwYjU0SjJwK3YySzRwRFBaOEd3NEEiLCJhbXIiOl\
  sicHdkIl0sImFwcGlkIjoiMDlmZGQ2OGMtNGYyZi00NWMyLWJlNTUtZGQ5ODEwNGQ0Zjc0IiwiYXBwaWRhY3IiOiIwIiwiZ\
  Xh0bi5lbXBsb3llZUlkIjpbIjEyMzQ1Njc4Il0sImlwYWRkciI6IjE0OC4yNTMuMTM0LjIxMyIsIm5hbWUiOiJNRVNCZXRh\
  IHVzZXIiLCJvaWQiOiI4ZDU3OWFiZS0zODc4LTQ1ZDctOTVlYi1jMjA5OTk1NTYwZTUiLCJwd2RfZXhwIjoiNTkxNDUxIiw\
  icHdkX3VybCI6Imh0dHBzOi8vcG9ydGFsLm1pY3Jvc29mdG9ubGluZS5jb20vQ2hhbmdlUGFzc3dvcmQuYXNweCIsInNjcC\
  I6IkRpcmVjdG9yeS5SZWFkLkFsbCBVc2VyLlJlYWQiLCJzdWIiOiI2am9DUkpQQTFQaTdBWXVtZ1ZNMURSZG96ZFpyN0lRZ\
  XJkaURoUG9GWXNJIiwidGlkIjoiNmM0NDhkOTAtNGNhMS00Y2FmLWFiNTktMGEyYWE2N2Q3ODAxIiwidW5pcXVlX25hbWUi\
  OiJtb2JleGFtaW5lckBkdnNhZ292Lm9ubWljcm9zb2Z0LmNvbSIsInVwbiI6Im1vYmV4YW1pbmVyQGR2c2Fnb3Yub25taWN\
  yb3NvZnQuY29tIiwidXRpIjoieFYyZWFOZUU2MG1HTkpRWUZWSXNBQSIsInZlciI6IjEuMCJ9.dfuRICPaGJJh4WcWdjYP8\
  waHrRVFWBuik6dZLTlXrXPnsUWDf7Piq9CrZjR6qEEJoBlKTcw6vgF1WTaUvikLwtl6VTaIMfqbp1niajJOhjxZjWd2p2cm\
  Mr7SfbJkD33tHIuG0w71qZBTCacS9PjxrmTv9Qe6QRRsI-kSOwsF-u2L1-kL6iO67LdZa04jxTJVZ3P0IEh1MQBV7FOzCDD\
  KiSIwqfAWbFxxh5eUkQfpwARch7wLMnthebO9t-bIS5W2YrL_aJILUhQpz0LO32IDlKMcz63hmCTYvSybCTqTXGd_2unhvE\
  fwRdeWktLRZvkP2lIwiv6dKn43gijVg5bQxA';

  beforeEach(() => {
    moqDecompressionSvc.reset();
    moqSaveResultSvc.reset();
    moqBootstrapConfig.reset();
    moqJoiValidationSvc.reset();

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({
      pathParameters: {
        staffNumber: '12345678',
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });

    dummyContext = lambdaTestUtils.mockContextCreator(() => null);
    process.env.EMPLOYEE_ID_VERIFICATION_DISABLED = undefined;
    process.env.EMPLOYEE_ID_EXT_KEY = 'extn.employeeId';

    spyOn(decompressionService, 'decompressTestResult').and.callFake(moqDecompressionSvc.object);
    spyOn(saveResultSvc, 'saveTestResult').and.callFake(moqSaveResultSvc.object);
    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
    spyOn(joiValidationSvc, 'validateMESJoiSchema').and.callFake(moqJoiValidationSvc.object);
  });

  describe('invalid response body handling', () => {
    it('should return a 400 response if there is no body on the request', async () => {
      dummyApigwEvent.body = null;

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(400);
    });
    it('should return a 400 response if the request body is blank', async () => {
      dummyApigwEvent.body = '       ';

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(400);
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

  describe('calling saveTestResult', () => {
    it('should pass decompressed test result to saveTestResult', async () => {
      dummyApigwEvent.body = 'avalidcompressedresult';
      const fakeTestResult = Mock.ofType<StandardCarTestCATBSchema>();
      const validationResult = Mock.ofType<ValidationResult<any>>();

      moqDecompressionSvc.setup(x => x(It.isAny())).returns(() => fakeTestResult.object);
      moqJoiValidationSvc.setup(x => x(It.isAny())).returns(() => validationResult.object.value);

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

      const resp = await handler(dummyApigwEvent, dummyContext);

      expect(resp.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('configuration initialisation', () => {
    it('should always bootstrap the config', async () => {
      await handler(dummyApigwEvent, dummyContext);

      moqBootstrapConfig.verify(x => x(), Times.once());
    });
  });

  describe('getStaffNumber', () => {
    it('should return the staff number when passed a valid path params', () => {
      const rtn = getStaffNumber(dummyApigwEvent.pathParameters);
      expect(rtn).toEqual('12345678');
    });
    it('should return null if path params are null', () => {
      const rtn = getStaffNumber(null);
      expect(rtn).toBeNull;
    });
  });

  describe('getEmployeeIdFromToken', () => {
    it('should return the correct employeeid from a valid token', () => {
      const rtn = getEmployeeIdFromToken(token);
      expect(rtn).toEqual('12345678');
    });
    it('should return null when token is null', () => {
      const rtn = getEmployeeIdFromToken(null);
      expect(rtn).toBeNull();
    });
    it('should return null when employeeId is empty', () => {
      process.env.EMPLOYEE_ID_EXT_KEY = '';
      const rtn = getEmployeeIdFromToken(null);
      expect(rtn).toBeNull();
    });
  });
  describe('getEmployeeIdFromArray', () => {
    it('should return the first value of the array', () => {
      const exampleArr = ['first', 'second', 'third'];
      const rtn = getEmployeeIdFromArray(exampleArr);
      expect(rtn).toEqual('first');
    });
    it('should return null if empty array', () => {
      const exampleArr = [];
      const rtn = getEmployeeIdFromArray(exampleArr);
      expect(rtn).toBeNull();
    });
  });
  describe('getEmployeeIdStringProperty', () => {
    it('should return employeeId if valid', () => {
      const id = '1234';
      const rtn = getEmployeeIdStringProperty(id);
      expect(rtn).toEqual(id);
    });
    it('should return null if employeeId is not a string', () => {
      const id = 1234;
      const rtn = getEmployeeIdStringProperty(id);
      expect(rtn).toBeNull();
    });
  });
});
