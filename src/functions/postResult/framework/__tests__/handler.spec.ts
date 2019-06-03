import { APIGatewayEvent, Context } from 'aws-lambda';
import { handler } from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, It, Times } from 'typemoq';
import * as decompressionService from '../../application/decompression-service';
import { TestResultDecompressionError } from '../../domain/errors/test-result-decompression-error';
import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import { HttpStatus } from '../../../../common/application/api/HttpStatus';
import * as saveResultSvc from '../../application/save-result-service';
import * as configSvc from '../../../../common/framework/config/config';

describe('postResult handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;
  const moqDecompressionSvc = Mock.ofInstance(decompressionService.decompressTestResult);
  const moqSaveResultSvc = Mock.ofInstance(saveResultSvc.saveTestResult);
  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);

  beforeEach(() => {
    moqDecompressionSvc.reset();
    moqSaveResultSvc.reset();
    moqBootstrapConfig.reset();

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent();
    dummyContext = lambdaTestUtils.mockContextCreator(() => null);

    spyOn(decompressionService, 'decompressTestResult').and.callFake(moqDecompressionSvc.object);
    spyOn(saveResultSvc, 'saveTestResult').and.callFake(moqSaveResultSvc.object);
    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
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
      moqDecompressionSvc.setup(x => x(It.isAny())).returns(() => fakeTestResult.object);

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
});
