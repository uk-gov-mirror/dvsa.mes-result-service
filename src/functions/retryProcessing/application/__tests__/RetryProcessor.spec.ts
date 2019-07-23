
import { IRetryProcessor } from '../IRetryProcessor';
import { RetryProcessor } from '../RetryProcessor';

describe('retryProcessor', () => {

  describe('Error handling', () => {
    let connectionSpy;
    let realRetryProcessor: IRetryProcessor;
    beforeEach(() => {
      connectionSpy = {
        promise: () => jasmine.createSpyObj('promise', ['query', 'commit']),
        rollback: jasmine.createSpy('rollback'),
      };
      realRetryProcessor = new RetryProcessor(connectionSpy);
    });
    describe('processSuccessful', () => {
      it('should rollback the connection and resolve when any error occurs', async () => {
        connectionSpy.promise().query.and.throwError('query failed');
        await realRetryProcessor.processSuccessful();
        expect(connectionSpy.rollback).toHaveBeenCalled();
      });
    });
    describe('processErrorsToRetry', () => {
      it('should rollback the connection and resolve when any error occurs', async () => {
        connectionSpy.promise().query.and.throwError('query failed');
        await realRetryProcessor.processErrorsToRetry(5, 5, 5);
        expect(connectionSpy.rollback).toHaveBeenCalled();
      });
    });
    describe('processErrorsToAbort', () => {
      it('should rollback the connection and resolve when any error occurs', async () => {
        connectionSpy.promise().query.and.throwError('query failed');
        await realRetryProcessor.processErrorsToAbort(5, 5, 5);
        expect(connectionSpy.rollback).toHaveBeenCalled();
      });
    });
    describe('processSupportInterventions', () => {
      it('should rollback the connection and resolve when any error occurs', async () => {
        connectionSpy.promise().query.and.throwError('query failed');
        await realRetryProcessor.processSupportInterventions();
        expect(connectionSpy.rollback).toHaveBeenCalled();
      });
    });
    describe('processOldEntryCleanup', () => {
      it('should rollback the connection and resolve when any error occurs', async () => {
        connectionSpy.promise().query.and.throwError('query failed');
        await realRetryProcessor.processOldEntryCleanup(7);
        expect(connectionSpy.rollback).toHaveBeenCalled();
      });
    });
  });

});
