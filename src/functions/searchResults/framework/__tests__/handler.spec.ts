import { APIGatewayEvent } from 'aws-lambda';
import { handler } from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, It, Times } from 'typemoq';
import * as configSvc from '../../../../common/framework/config/config';
import {
  queryParameter,
  queryParameterWith8DigitAppRef,
  sampleToken_12345678, testResult,
  testResultResponse,
} from './handler.spec.data';
import * as searchResultsSvc from '../repositories/search-repository';
import { ExaminerRole } from '@dvsa/mes-microservice-common/domain/examiner-role';

describe('searchResults handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  const moqSearchResults = Mock.ofInstance(searchResultsSvc.getConciseSearchResults);
  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);

  beforeEach(() => {
    moqBootstrapConfig.reset();
    moqSearchResults.reset();

    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({
      headers: {
        Authorization: sampleToken_12345678,
      },
    });

    process.env.EMPLOYEE_ID_EXT_KEY = 'extn.employeeId';

    spyOn(searchResultsSvc, 'getConciseSearchResults').and.callFake(moqSearchResults.object);
    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
  });

  describe('configuration initialisation', () => {
    it('should always bootstrap the config', async () => {
      await handler(dummyApigwEvent);
      moqBootstrapConfig.verify(x => x(), Times.once());
    });
  });

  describe('handling of no parameters', () => {
    it('should fail with bad request and give an error message', async () => {
      dummyApigwEvent.queryStringParameters = null;
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(400);
      expect(JSON.parse(resp.body)).toBe('Query parameters have to be supplied');
    });
  });

  describe('handling of only isLDTM parameter', () => {
    it('should fail with bad request and give an error message', async () => {
      dummyApigwEvent.requestContext.authorizer = {
        examinerRole: ExaminerRole.LDTM,
      };
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(400);
      expect(JSON.parse(resp.body)).toBe('Query parameters have to be supplied');
    });
  });

  describe('using invalid query parameters', () => {
    it('should fail with bad request and give an error message', async () => {
      dummyApigwEvent.queryStringParameters['whatever'] = 'randomvalue';
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(400);
      expect(JSON.parse(resp.body)).toBe('Query parameters have to be supplied');
    });
  });

  describe('using valid query parameters as LDTM', () => {
    it('gets the relevant results', async () => {
      dummyApigwEvent.requestContext.authorizer = {
        examinerRole: ExaminerRole.LDTM,
      };
      dummyApigwEvent.queryStringParameters['startDate'] = queryParameter.startDate;
      dummyApigwEvent.queryStringParameters['endDate'] = queryParameter.endDate;
      dummyApigwEvent.queryStringParameters['driverNumber'] = queryParameter.driverNumber;
      dummyApigwEvent.queryStringParameters['dtcCode'] = queryParameter.dtcCode;
      dummyApigwEvent.queryStringParameters['staffNumber'] = queryParameter.staffNumber;
      dummyApigwEvent.queryStringParameters['rekey'] = String(queryParameterWith8DigitAppRef.rekey);
      dummyApigwEvent.queryStringParameters['applicationReference'] = queryParameter.applicationReference;
      dummyApigwEvent.queryStringParameters['excludeAutoSavedTests'] = queryParameter.excludeAutoSavedTests;
      dummyApigwEvent.queryStringParameters['activityCode'] = queryParameter.activityCode;
      dummyApigwEvent.queryStringParameters['category'] = queryParameter.category;
      dummyApigwEvent.queryStringParameters['passCertificateNumber'] = queryParameter.passCertificateNumber;
      moqSearchResults.setup(x => x(It.isAny())).returns(() => Promise.resolve(testResult));
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(200);
      expect(JSON.parse(resp.body)).toEqual(testResultResponse);
      moqSearchResults.verify(x => x(It.isObjectWith(queryParameter)), Times.once());
    });
  });

  describe('using valid query parameters as LDTM, 8 digit application reference', () => {
    it('gets the relevant results', async () => {
      dummyApigwEvent.requestContext.authorizer = {
        examinerRole: ExaminerRole.LDTM,
      };
      dummyApigwEvent.queryStringParameters['startDate'] = queryParameterWith8DigitAppRef.startDate;
      dummyApigwEvent.queryStringParameters['endDate'] = queryParameterWith8DigitAppRef.endDate;
      dummyApigwEvent.queryStringParameters['driverNumber'] = queryParameterWith8DigitAppRef.driverNumber;
      dummyApigwEvent.queryStringParameters['dtcCode'] = queryParameterWith8DigitAppRef.dtcCode;
      dummyApigwEvent.queryStringParameters['staffNumber'] = queryParameterWith8DigitAppRef.staffNumber;
      dummyApigwEvent.queryStringParameters['rekey'] = String(queryParameterWith8DigitAppRef.rekey);
      dummyApigwEvent.queryStringParameters['excludeAutoSavedTests'] =
        queryParameterWith8DigitAppRef.excludeAutoSavedTests;
      dummyApigwEvent.queryStringParameters['applicationReference'] = queryParameterWith8DigitAppRef
        .applicationReference;
      dummyApigwEvent.queryStringParameters['activityCode'] = queryParameterWith8DigitAppRef.activityCode;
      dummyApigwEvent.queryStringParameters['category'] = queryParameterWith8DigitAppRef.category;
      dummyApigwEvent.queryStringParameters['passCertificateNumber'] = queryParameter.passCertificateNumber;
      moqSearchResults.setup(x => x(It.isAny())).returns(() => Promise.resolve(testResult));
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(200);
      expect(JSON.parse(resp.body)).toEqual(testResultResponse);
      moqSearchResults.verify(x => x(It.isObjectWith(queryParameterWith8DigitAppRef)), Times.once());
    });
  });

  describe('request made by DLG', () => {
    beforeEach(() => {
      dummyApigwEvent.requestContext.authorizer = {
        examinerRole: ExaminerRole.DLG,
      };
      moqSearchResults.setup(x => x(It.isAny())).returns(() => Promise.resolve(testResult));
    });

    it('should get relevant results when searching by correct staff number reference', async () => {
      dummyApigwEvent.queryStringParameters['staffNumber'] = queryParameter.staffNumber;
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(200);
      expect(JSON.parse(resp.body)).toEqual(testResultResponse);
    });

    it('should get relevant results when searching by correct application reference', async () => {
      dummyApigwEvent.queryStringParameters['applicationReference'] = queryParameter.applicationReference;
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(200);
      expect(JSON.parse(resp.body)).toEqual(testResultResponse);
    });

    it('should get relevant results when searching by correct driver number', async () => {
      dummyApigwEvent.queryStringParameters['driverNumber'] = queryParameter.driverNumber;
      const resp = await handler(dummyApigwEvent);
      expect(resp.statusCode).toBe(200);
      expect(JSON.parse(resp.body)).toEqual(testResultResponse);
    });
  });
});
