export interface IRetryProcessingFacade {
  processRetries(): Promise<void>;
}
