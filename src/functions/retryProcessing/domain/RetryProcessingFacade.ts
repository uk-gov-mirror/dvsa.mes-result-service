import { IRetryProcessingFacade } from './IRetryProcessingFacade';
import { IRetryProcessor } from '../application/IRetryProcessor';
import { getRetryConfig, retryConfig } from '../framework/retryConfig';

export class RetryProcessingFacade implements IRetryProcessingFacade {
  private retryProcessingRepository: IRetryProcessor;

  constructor(retryProcessingRepository: IRetryProcessor) {
    this.retryProcessingRepository = retryProcessingRepository;
  }

  async processRetries(): Promise<void> {
    await getRetryConfig();

    await this.retryProcessingRepository.processSuccessful();
    await this.retryProcessingRepository.processErrorsToRetry(
      retryConfig().rsisRetryCount,
      retryConfig().notifyRetryCount,
      retryConfig().tarsRetryCount,
    );
    await this.retryProcessingRepository.processErrorsToLog(
      retryConfig().rsisRetryCount,
      retryConfig().notifyRetryCount,
      retryConfig().tarsRetryCount,
    );
    await this.retryProcessingRepository.processErrorsToAbort(
      retryConfig().rsisRetryCount,
      retryConfig().notifyRetryCount,
      retryConfig().tarsRetryCount,
    );

    await this.retryProcessingRepository.processSupportInterventions();
    await this.retryProcessingRepository.processOldEntryCleanup(retryConfig().retryCutOffPointDays);
    await this.retryProcessingRepository.processStalledTestResults(retryConfig().autosaveCutOffPointDays);
  }
}
