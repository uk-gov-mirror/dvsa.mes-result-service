export enum InterfaceIds {
    TARS,
    NOTIFY,
    RSIS,
  }

export enum ErrorsToRetryTestCases {
     TarsFailedRsisFailed = 65,
     TarsFailedRsisProcessing = 66,
     TarsFailedRsisAccepted = 67,
     TarsProcessingRsisFailed = 68,
     TarsAcceptedRsisFailed = 69,
  }

export enum ErrorsToAbortTestCases {
TarsFailedNotifyFailed = 70,
TarsFailedNotifyProcessing = 71,
TarsFailedNotifyAccepted = 72,
TarsProcessingNotifyFailed = 73,
TarsAcceptedNotifyFailed = 74,
TarsAcceptedNotifyAccepted = 75,
TarsProcessingNotifyProcessing = 76,
}
