import { Context, ScheduledEvent } from 'aws-lambda';
import { handler } from '../handler';
const lambdaTestUtils = require('aws-lambda-test-utils');
import { Mock, Times } from 'typemoq';
import * as configSvc from '../../../../common/framework/config/config';
import * as database from '../../../../common/framework/mysql/database';
import { HttpStatus } from '../../../../common/application/api/HttpStatus';

describe('retryProcessing handler', () => {
  let dummyScheduledEvent: ScheduledEvent;
  let dummyContext: Context;

  const moqBootstrapConfig = Mock.ofInstance(configSvc.bootstrapConfig);
  const moqGetConnection = Mock.ofInstance(database.getConnection);

  beforeEach(() => {
    moqBootstrapConfig.reset();

    dummyScheduledEvent = lambdaTestUtils.mockEventCreator;
    dummyContext = lambdaTestUtils.mockContextCreator(() => null);

    spyOn(configSvc, 'bootstrapConfig').and.callFake(moqBootstrapConfig.object);
    spyOn(database, 'getConnection').and.callFake(moqGetConnection.object);
  });

  it('should always bootstrap the config', async () => {
    await handler(dummyScheduledEvent, dummyContext);
    moqBootstrapConfig.verify(x => x(), Times.once());
  });

  it('should call the getConnection function', async () => {
    await handler(dummyScheduledEvent, dummyContext);
    expect(database.getConnection).toHaveBeenCalled();
  });

  it('should throw a 500 error if retry fails', async () => {
    const resp = await handler(dummyScheduledEvent, dummyContext);
    expect(resp.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
