import { APIGatewayEvent } from 'aws-lambda';
import { convertToInterfaceType, handler } from '../handler';
import { InterfaceTypes } from '../../domain/interface-types';
const lambdaTestUtils = require('aws-lambda-test-utils');

describe('getNextUploadBatch handler', () => {
  const dummyApigwEvent: APIGatewayEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({
    pathParameters: {
      interface: 'TARS',
    },
  });
  describe('convertToInterfaceType function', () => {
    it('should return TARS', () => {
      const response = convertToInterfaceType('TARS');
      expect(response).toBe(InterfaceTypes.TARS);
    });
    it('should return RSIS', () => {
      const response = convertToInterfaceType('RSIS');
      expect(response).toBe(InterfaceTypes.RSIS);
    });
    it('should return NOTIFY', () => {
      const response = convertToInterfaceType('NOTIFY');
      expect(response).toBe(InterfaceTypes.NOTIFY);
    });
    it('should return DSP', () => {
      const response = convertToInterfaceType('DSP');
      expect(response).toBe(InterfaceTypes.DSP);
    });
    it('should return MI', () => {
      const response = convertToInterfaceType('MI');
      expect(response).toBe(InterfaceTypes.MI);
    });
    it('should return NO MATCH', () => {
      const response = convertToInterfaceType('NO MATCH');
      expect(response).toBe(InterfaceTypes.NO_MATCH_FOUND);
    });
  });
  describe('query paramater validation', () => {
    it('should return a 400 if joi validation fails on batch size', async () => {
      dummyApigwEvent.queryStringParameters.interface = 'TARS';
      dummyApigwEvent.queryStringParameters.batch_size = '-1';
      const response = await handler(dummyApigwEvent);
      expect(response.statusCode).toBe(400);
    });
    it('should return a 400 if joi validation fails on interface type', async () => {
      dummyApigwEvent.queryStringParameters.interface = 'TARS1';
      dummyApigwEvent.queryStringParameters.batch_size = '4';
      const response = await handler(dummyApigwEvent);
      expect(response.statusCode).toBe(400);
    });
  });

});
