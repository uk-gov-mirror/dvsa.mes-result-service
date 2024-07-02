import { APIGatewayEvent } from 'aws-lambda';
import { handler } from '../handler';

const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, It, Times } from 'typemoq';
import * as configService from '../../../../common/framework/config/config';
import {
  sampleToken_12345678,
} from './handler.spec.data';
import * as multipleResultService from '../repositories/get-result-repository';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';

fdescribe('getMultipleResults', () => {
  let dummyApigwEvent: APIGatewayEvent;
  const moqMultipleResults = Mock.ofInstance(multipleResultService.getMultipleResult);
  const moqBootstrapConfig = Mock.ofInstance(configService.bootstrapConfig);

  beforeEach(() => {
    moqBootstrapConfig.reset();
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
      dummyApigwEvent.queryStringParameters = null;
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(JSON.parse(resp.body)).toEqual('Query parameters have to be supplied');
    });

    it('should fail with bad request and give an error message - no staffNumber', async () => {
      dummyApigwEvent.queryStringParameters['whatever'] = 'randomvalue';
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(JSON.parse(resp.body)).toEqual('staffNumber has to be supplied');
    });

    it('should fail with bad request and give an error message - staffNumber, no applicationReferences', async () => {
      dummyApigwEvent.queryStringParameters['staffNumber'] = '123456';
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(JSON.parse(resp.body)).toEqual('applicationReferences have to be supplied');
    });

    it('should fail with bad request and give an error message - applicationReferences wrong format', async () => {
      dummyApigwEvent.queryStringParameters['staffNumber'] = '123456';
      dummyApigwEvent.queryStringParameters['applicationReferences'] = '';
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(JSON.parse(resp.body)).toEqual('applicationReferences have to be supplied');
    });

    it('should fail with bad request and give an error message - no staffNumber', async () => {
      dummyApigwEvent.queryStringParameters['staffNumber'] = '123456';
      dummyApigwEvent.queryStringParameters['applicationReferences'] = '123,234';
      spyOn(multipleResultService, 'getMultipleResult').and.resolveTo([]);
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toEqual(HttpStatus.OK);
      expect(JSON.parse(resp.body)).toEqual('H4sIAAAAAAAAE4uOBQApu0wNAgAAAA==');
    });

    it('returns internal server error when getMultipleResult throws error', async () => {
      dummyApigwEvent.queryStringParameters['staffNumber'] = '123456';
      dummyApigwEvent.queryStringParameters['applicationReferences'] = '123,234';
      spyOn(multipleResultService, 'getMultipleResult').and.throwError('Test error');
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    });

  });
});
