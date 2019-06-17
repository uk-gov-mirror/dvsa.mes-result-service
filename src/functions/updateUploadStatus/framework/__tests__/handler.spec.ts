import { APIGatewayEvent, Context } from 'aws-lambda';
import {
  handler,
} from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, It } from 'typemoq';
import * as configSvc from '../../../../common/framework/config/config';
import * as updateUploadSvc from '../../application/update-upload-service';

describe('updateUploadStatus handler', () => {
  let dummyApigwEvent: APIGatewayEvent;
  let dummyContext: Context;

  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);
  const moqUpdateUploadSvc = Mock.ofInstance(updateUploadSvc.updateUpload);

  beforeEach(() => {
    dummyApigwEvent = lambdaTestUtils.mockEventCreator.createAPIGatewayEvent({});
    dummyContext = lambdaTestUtils.mockContextCreator(() => null);

    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
  });

  it('should respond with a CREATED response if provided a valid body and app-ref', async () => {
    spyOn(updateUploadSvc, 'updateUpload').and.callFake(moqUpdateUploadSvc.object);
    moqUpdateUploadSvc.setup(x => x(It.isAny(), It.isAny())).returns(() => Promise.resolve());

    dummyApigwEvent.pathParameters['app-ref'] = '1234';
    dummyApigwEvent.body = JSON.stringify({
      state: 'ACCEPTED',
      retry_count: 12,
      staff_number: '1234567890',
      error_message: null,
      interface: 'TARS',
    });

    const res = await handler(dummyApigwEvent, dummyContext);
    expect(res.statusCode).toEqual(201);
  });

  it('should send a BAD_REQUEST response if the request body is blank', async () => {
    dummyApigwEvent.pathParameters['app-ref'] = '1234';
    dummyApigwEvent.body = '';

    const res = await handler(dummyApigwEvent, dummyContext);
    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res.body).message).toBe('Empty path app-ref or request body');
  });

  it('should send a BAD_REQUEST response when the {app-ref} path param is blank', async () => {
    dummyApigwEvent.pathParameters['app-ref'] = '';
    dummyApigwEvent.body = JSON.stringify({
      upload_status: 'ACCEPTED',
    });
    const res = await handler(dummyApigwEvent, dummyContext);
    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res.body).message).toBe('Empty path app-ref or request body');
  });

  it('should send a BAD_REQUEST response when the body isnt in JSON', async () => {
    dummyApigwEvent.pathParameters['app-ref'] = '1234';
    dummyApigwEvent.body = 'this is not json 1234';
    const res = await handler(dummyApigwEvent, dummyContext);
    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res.body).message).toBe('Error parsing request body into JSON');
  });

  it('should send a BAD_REQUEST response when the application reference isnt a parsable string', async () => {
    dummyApigwEvent.pathParameters['app-ref'] = 'an invalid number';
    dummyApigwEvent.body = dummyApigwEvent.body = JSON.stringify({
      retry_count: 1,
    });
    const res = await handler(dummyApigwEvent, dummyContext);
    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res.body).message)
      .toBe(`Error application reference is NaN: ${dummyApigwEvent.pathParameters['app-ref']}`);
  });

  it('should send a INTERNAL_SERVER_ERROR response if missing a field', async () => {
    dummyApigwEvent.pathParameters['app-ref'] = '1234';
    dummyApigwEvent.body = JSON.stringify({
      retry_count: 15,
    });
    const res = await handler(dummyApigwEvent, dummyContext);
    expect(res.statusCode).toEqual(500);
    expect(JSON.parse(res.body).message)
      .toBe(`Error updating the status in UUS of Reference Number: ${dummyApigwEvent.pathParameters['app-ref']}`);
  });
});
