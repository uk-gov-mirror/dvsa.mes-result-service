
export interface IRetryProcessor {
  processSuccessful(): Promise<number>;

  processErrorsToRetry(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
    dspRetryCount: number,
    miRetryCount: number,
  ): Promise<number>;

  processErrorsToLog(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
    dspRetryCount: number,
    miRetryCount: number,
  ): Promise<void>;

  processErrorsToAbort(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
    dspRetryCount: number,
    miRetryCount: number,
  ): Promise<number>;

  processSupportInterventions(): Promise<number>;

  processOldEntryCleanup(cutOffPointInDays: number): Promise<number>;

  processStalledTestResults(autosaveCutOffPointInDays: number): Promise<number>;
}
