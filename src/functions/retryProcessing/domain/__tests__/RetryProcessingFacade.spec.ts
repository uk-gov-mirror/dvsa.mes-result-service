import {RetryProcessingFacade} from '../RetryProcessingFacade';
import {IRetryProcessor} from '../../application/IRetryProcessor';

describe('RetryProcessingFacade', () => {
  let retryProcessingRepositoryMock: jasmine.SpyObj<IRetryProcessor>;
  let retryProcessingFacade: RetryProcessingFacade;

  beforeEach(() => {
    retryProcessingRepositoryMock = jasmine.createSpyObj('IRetryProcessor', [
      'processSuccessful',
      'processErrorsToRetry',
      'processErrorsToLog',
      'processErrorsToAbort',
      'processSupportInterventions',
      'processOldEntryCleanup',
      'processStalledTestResults',
    ]);

    retryProcessingFacade = new RetryProcessingFacade(retryProcessingRepositoryMock);
  });

  it('should process retries correctly', async () => {
    // Act
    await retryProcessingFacade.processRetries();

    // Assert
    expect(retryProcessingRepositoryMock.processSuccessful).toHaveBeenCalled();
    expect(retryProcessingRepositoryMock.processErrorsToRetry).toHaveBeenCalledWith(12, 12, 36, 36, 12);
    expect(retryProcessingRepositoryMock.processErrorsToLog).toHaveBeenCalledWith(12, 12, 36, 36, 12);
    expect(retryProcessingRepositoryMock.processErrorsToAbort).toHaveBeenCalledWith(12, 12, 36, 36, 12);
    expect(retryProcessingRepositoryMock.processSupportInterventions).toHaveBeenCalled();
    expect(retryProcessingRepositoryMock.processOldEntryCleanup).toHaveBeenCalledWith(30);
    expect(retryProcessingRepositoryMock.processStalledTestResults).toHaveBeenCalledWith(15);
  });
});
