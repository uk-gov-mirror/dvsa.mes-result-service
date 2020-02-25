import * as database from '../../../../common/framework/mysql/database';
import { Mock } from 'typemoq';
import { updateUpload } from '../update-upload-service';
import { SubmissionOutcome } from '../../domain/SubmissionOutcome';
import { IntegrationType } from '../../../postResult/domain/result-integration';
import { ProcessingStatus } from '../../../../common/domain/processing-status';

const mockSubmissionOutcome: SubmissionOutcome = {
  error_message: null,
  interface: IntegrationType.TARS,
  retry_count: 0,
  staff_number: '123456',
  state: ProcessingStatus.ACCEPTED,
};

describe('UpdateUploadService', () => {
  const moqGetConnection = Mock.ofInstance(database.getConnection);
  const connectionPromiseStub = jasmine.createSpyObj('promise', ['query']);
  const connectionStub = {
    promise: () => connectionPromiseStub,
    end: jasmine.createSpy('end'),
    rollback: jasmine.createSpy('rollback'),
  };

  beforeEach(() => {
    moqGetConnection.reset();

    moqGetConnection.setup(x => x()).returns(() => connectionStub);

    spyOn(database, 'getConnection').and.callFake(moqGetConnection.object);
  });

  it('should return successfully when a single record is updated', async () => {
    connectionPromiseStub.query.and.returnValue(Promise.resolve([{ changedRows: 1 }]));
    await updateUpload(123, mockSubmissionOutcome);
  });

  it('should throw an error when no records are updated', async () => {
    connectionPromiseStub.query.and.returnValue(Promise.resolve([{ changedRows: 0 }]));

    try {
      await updateUpload(123, mockSubmissionOutcome);
    } catch (err) {
      expect(connectionStub.rollback).toHaveBeenCalled();
      return;
    }
    fail('should have thrown due to not exactly one record update');
  });

});
