import { AutosaveTestData } from '../../helpers/mock-test-data';
import { AutosaveQueueData } from '../../mock-queue-data';

export enum TestCases {
  AutosaveNoUploadRecords = 77,
  FullSubNoUploadRecords = 78,
  FullSubTarsProcRsisFailNotifyProc = 79,
  FullSubTarsAcceptRsisFailNotifyFail = 80,
  FullSubAllThreeFail = 81,
  FullSubTarsAcceptRsisFailNotifyAccept = 82,
  AutosaveTarsFailNotifyProc = 83,
  AutosaveTarsFailNotifyFail = 84,
  AutosaveTarsFailNotifyAccept = 85,
}

// TODO: Use the common enum
export enum UploadStatus {
  PROCESSING = 0,
  ACCEPTED = 1,
  FAILED = 2,
}

// TODO: Use the common enum
export enum ResultStatus {
  PROCESSING = 0,
  PROCESSED = 1,
  PENDING = 2,
  ERROR = 3,
}

// TODO: Use the common enum
export enum Interface {
  TARS = 0,
  NOTIFY = 1,
  RSIS = 2,
}

// TODO: Possibly move to commmon
const createTestResultRecord = (appRef: TestCases, status: ResultStatus, autoSave: boolean) => {
  return {
    applicationReference: appRef,
    staffNumber: '1',
    driverSurname: 'Bloggs',
    resultStatus: status,
    autosave: autoSave,
  };
};

// TODO: Possibly move to commmon
const createUploadRecord = (appRef: TestCases, interf: Interface, status: UploadStatus) => {
  return {
    applicationReference: appRef,
    staffNumber: '1',
    timestamp: '2019-09-01 13:59:59',
    interface: interf,
    uploadStatus: status,
    retryCount: 0,
  };
};

export const getTestResultData = (): AutosaveTestData[] => {
  return [
    createTestResultRecord(TestCases.AutosaveNoUploadRecords, ResultStatus.PENDING, true),
    createTestResultRecord(TestCases.FullSubNoUploadRecords, ResultStatus.PENDING, false),
    createTestResultRecord(TestCases.FullSubTarsProcRsisFailNotifyProc, ResultStatus.PENDING, false),
    createTestResultRecord(TestCases.FullSubTarsAcceptRsisFailNotifyFail, ResultStatus.PENDING, false),
    createTestResultRecord(TestCases.FullSubAllThreeFail, ResultStatus.PENDING, false),
    createTestResultRecord(TestCases.FullSubTarsAcceptRsisFailNotifyAccept, ResultStatus.PENDING, false),
    createTestResultRecord(TestCases.AutosaveTarsFailNotifyProc, ResultStatus.PENDING, true),
    createTestResultRecord(TestCases.AutosaveTarsFailNotifyFail, ResultStatus.PENDING, true),
    createTestResultRecord(TestCases.AutosaveTarsFailNotifyAccept, ResultStatus.PENDING, true),
  ];
};

export const getQueueResultData = (): AutosaveQueueData[] => {
  return [
    createUploadRecord(TestCases.FullSubTarsProcRsisFailNotifyProc, Interface.TARS, UploadStatus.PROCESSING),
    createUploadRecord(TestCases.FullSubTarsProcRsisFailNotifyProc, Interface.NOTIFY, UploadStatus.PROCESSING),
    createUploadRecord(TestCases.FullSubTarsProcRsisFailNotifyProc, Interface.RSIS, UploadStatus.FAILED),

    createUploadRecord(TestCases.FullSubTarsAcceptRsisFailNotifyFail, Interface.TARS, UploadStatus.ACCEPTED),
    createUploadRecord(TestCases.FullSubTarsAcceptRsisFailNotifyFail, Interface.NOTIFY, UploadStatus.FAILED),
    createUploadRecord(TestCases.FullSubTarsAcceptRsisFailNotifyFail, Interface.RSIS, UploadStatus.FAILED),

    createUploadRecord(TestCases.FullSubAllThreeFail, Interface.TARS, UploadStatus.FAILED),
    createUploadRecord(TestCases.FullSubAllThreeFail, Interface.NOTIFY, UploadStatus.FAILED),
    createUploadRecord(TestCases.FullSubAllThreeFail, Interface.RSIS, UploadStatus.FAILED),

    createUploadRecord(TestCases.FullSubTarsAcceptRsisFailNotifyAccept, Interface.TARS, UploadStatus.ACCEPTED),
    createUploadRecord(TestCases.FullSubTarsAcceptRsisFailNotifyAccept, Interface.NOTIFY, UploadStatus.ACCEPTED),
    createUploadRecord(TestCases.FullSubTarsAcceptRsisFailNotifyAccept, Interface.RSIS, UploadStatus.FAILED),

    createUploadRecord(TestCases.AutosaveTarsFailNotifyProc, Interface.TARS, UploadStatus.FAILED),
    createUploadRecord(TestCases.AutosaveTarsFailNotifyProc, Interface.NOTIFY, UploadStatus.PROCESSING),

    createUploadRecord(TestCases.AutosaveTarsFailNotifyFail, Interface.TARS, UploadStatus.FAILED),
    createUploadRecord(TestCases.AutosaveTarsFailNotifyFail, Interface.NOTIFY, UploadStatus.FAILED),

    createUploadRecord(TestCases.AutosaveTarsFailNotifyAccept, Interface.TARS, UploadStatus.FAILED),
    createUploadRecord(TestCases.AutosaveTarsFailNotifyAccept, Interface.NOTIFY, UploadStatus.ACCEPTED),
  ];
};
