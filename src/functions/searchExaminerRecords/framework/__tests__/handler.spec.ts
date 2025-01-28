import { APIGatewayEvent } from 'aws-lambda';
import { handler } from '../handler';

const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, It, Times } from 'typemoq';
import * as configSvc from '../../../../common/framework/config/config';
import * as searchResultsSvc from '../../framework/repositories/search-repository';
import { gzipSync } from 'zlib';
import { TestCategory } from '@dvsa/mes-test-schema/category-definitions/common/test-category';
import { sampleToken_12345678 } from '../../../getResult/framework/__tests__/handler.spec.data';
import { queryParameter } from '../database/__tests__/query-builder.spec.data';
import { examinerRecord } from './handler.spec.data';

describe('searchExaminerRecords handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);

  beforeEach(() => {
    moqBootstrapConfig.reset();

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({
      headers: {
        Authorization: sampleToken_12345678,
      },
    });

    process.env.EMPLOYEE_ID_EXT_KEY = 'extn.employeeId';

    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
  });

  describe('configuration initialisation', () => {
    it('should always bootstrap the config', async () => {
      await handler(dummyApigwEvent);
      moqBootstrapConfig.verify(x => x(), Times.once());
    });
  });

  describe('using invalid query parameters', () => {
    it('should fail with bad request and give an error message', async () => {
      dummyApigwEvent.queryStringParameters = {test: 'test'};
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(400);
      expect(JSON.parse(resp.body)).toBe('Not permitted to use the parameter test');
    });
  });

  describe('using valid query parameters', () => {
    it('gets the relevant results', async () => {

      dummyApigwEvent.queryStringParameters = {
        startDate: queryParameter.startDate,
        endDate: queryParameter.endDate,
        staffNumber: queryParameter.staffNumber,
      };

      spyOn(searchResultsSvc, 'getExaminerRecords').and.returnValue(Promise.resolve(examinerRecord));

      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(200);
      expect(JSON.parse(resp.body)).toEqual(gzipSync(
        JSON.stringify([{
          appRef: 1,
          testCentre: {centreId: 54321, costCode: 'EXTC1'},
          testCategory: TestCategory.B,
          startDate: '2019-06-26T09:07:00',
        }])
      ).toString('base64'));
    });
  });

});
