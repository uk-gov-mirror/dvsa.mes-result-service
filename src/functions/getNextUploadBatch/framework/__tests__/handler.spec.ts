import { APIGatewayEvent, Context } from 'aws-lambda';
import { validateQueryParameters, convertToInterfaceType } from '../handler';
import { BatchRequestParamaterErrors } from '../../domain/batch-request-param-errors';
import { InterfaceTypes } from '../../domain/interface-types';
const lambdaTestUtils = require('aws-lambda-test-utils');

describe('getNextUploadBatch handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;

  dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({
    pathParameters: {
      interface: 'TARS',
    },
  });
  dummyContext = lambdaTestUtils.mockContextCreator(() => null);
  describe('convertToInterfaceType function', () => {
    it('should return code 0 for TARS', () => {
      const response = convertToInterfaceType('TARS');
      expect(response).toBe(InterfaceTypes.TARS);
    });
    it('should return code 1 for RSIS', () => {
      const response = convertToInterfaceType('RSIS');
      expect(response).toBe(InterfaceTypes.RSIS);
    });
    it('should return code 2 for NOTIFY', () => {
      const response = convertToInterfaceType('NOTIFY');
      expect(response).toBe(InterfaceTypes.NOTIFY);
    });
    it('should return code 3 for NO MATCH', () => {
      const response = convertToInterfaceType('NO MATCH');
      expect(response).toBe(InterfaceTypes.NO_MATCH_FOUND);
    });
  });
  describe('query paramater validation', () => {
    it('should return a PARAM_NOT_PROVIDED warning if batch_size is undefined', () => {
      const interfaceType = dummyApigwEvent.queryStringParameters.interface = 'TARS';
      const batchSize = dummyApigwEvent.queryStringParameters.batch_size = null;
      const interfaceCode = convertToInterfaceType(interfaceType);
      const response = validateQueryParameters(interfaceCode, batchSize);
      expect(response).toBe(BatchRequestParamaterErrors.PARAM_NOT_PROVIDED);
    });
    it('should return a NAN warning if batch_size is not a number', () => {
      const interfaceType = dummyApigwEvent.queryStringParameters.interface = 'TARS';
      const batchSize = dummyApigwEvent.queryStringParameters.batch_size = 'TWO';
      const interfaceCode = convertToInterfaceType(interfaceType);
      const response = validateQueryParameters(interfaceCode, +batchSize);
      expect(response).toBe(BatchRequestParamaterErrors.BATCH_SIZE_NOT_NUMERIC);
    });
    it('should return an INTERFACE_NOT_FOUND warning if interface type cannot be resolved', () => {
      const interfaceType = dummyApigwEvent.queryStringParameters.interface = 'TARZ';
      const batchSize = dummyApigwEvent.queryStringParameters.batch_size = '4';
      const interfaceCode = convertToInterfaceType(interfaceType);
      const response = validateQueryParameters(interfaceCode, +batchSize);
      expect(response).toBe(BatchRequestParamaterErrors.INTERFACE_NOT_FOUND);
    });
    it('should return a BATCH_SIZE_NOT_VALID warning if batch_size <= 0 >', () => {
      const interfaceType = dummyApigwEvent.queryStringParameters.interface = 'TARS';
      const batchSize = dummyApigwEvent.queryStringParameters.batch_size = '-4';
      const interfaceCode = convertToInterfaceType(interfaceType);
      const response = validateQueryParameters(interfaceCode, +batchSize);
      expect(response).toBe(BatchRequestParamaterErrors.BATCH_SIZE_NOT_VALID);
    });
  });

});
