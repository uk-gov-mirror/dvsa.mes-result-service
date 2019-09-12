import { AutosaveTestData } from '../../helpers/mock-test-data';
import { AutosaveQueueData } from '../../mock-queue-data';
import { SupportInterventionTestCases, InterfaceIds } from '../common/TestEnums';
import { ResultStatus } from '../../../../../common/domain/result-status';
import { UploadStatus } from '../../../../../common/domain/upload-status';

// TODO: Possibly move to commmon
const createTestResultRecord = (appRef: SupportInterventionTestCases, status: ResultStatus, autoSave: boolean) => {
  return {
    applicationReference: appRef,
    staffNumber: '1',
    driverSurname: 'Bloggs',
    resultStatus: status,
    autosave: autoSave,
  };
};

// TODO: Possibly move to commmon
const createUploadRecord = (appRef: SupportInterventionTestCases, interf: InterfaceIds, status: UploadStatus) => {
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
    createTestResultRecord(SupportInterventionTestCases.AutosaveNoUploadRecords, ResultStatus.PENDING, true),
    createTestResultRecord(SupportInterventionTestCases.FullSubNoUploadRecords, ResultStatus.PENDING, false),
    createTestResultRecord(SupportInterventionTestCases.FullSubTarsProcRsisFailNotifyProc, ResultStatus.PENDING, false),
    createTestResultRecord(
      SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyFail, ResultStatus.PENDING, false),
    createTestResultRecord(SupportInterventionTestCases.FullSubAllThreeFail, ResultStatus.PENDING, false),
    createTestResultRecord(
      SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyAccept, ResultStatus.PENDING, false),
    createTestResultRecord(SupportInterventionTestCases.AutosaveTarsFailNotifyProc, ResultStatus.PENDING, true),
    createTestResultRecord(SupportInterventionTestCases.AutosaveTarsFailNotifyFail, ResultStatus.PENDING, true),
    createTestResultRecord(SupportInterventionTestCases.AutosaveTarsFailNotifyAccept, ResultStatus.PENDING, true),
  ];
};

export const getQueueResultData = (): AutosaveQueueData[] => {
  return [
    createUploadRecord(
      SupportInterventionTestCases.FullSubTarsProcRsisFailNotifyProc, InterfaceIds.TARS, UploadStatus.PROCESSING),
    createUploadRecord(
      SupportInterventionTestCases.FullSubTarsProcRsisFailNotifyProc, InterfaceIds.NOTIFY, UploadStatus.PROCESSING),
    createUploadRecord(
      SupportInterventionTestCases.FullSubTarsProcRsisFailNotifyProc, InterfaceIds.RSIS, UploadStatus.FAILED),

    createUploadRecord(
      SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyFail, InterfaceIds.TARS, UploadStatus.ACCEPTED),
    createUploadRecord(
      SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyFail, InterfaceIds.NOTIFY, UploadStatus.FAILED),
    createUploadRecord(
      SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyFail, InterfaceIds.RSIS, UploadStatus.FAILED),

    createUploadRecord(SupportInterventionTestCases.FullSubAllThreeFail, InterfaceIds.TARS, UploadStatus.FAILED),
    createUploadRecord(SupportInterventionTestCases.FullSubAllThreeFail, InterfaceIds.NOTIFY, UploadStatus.FAILED),
    createUploadRecord(SupportInterventionTestCases.FullSubAllThreeFail, InterfaceIds.RSIS, UploadStatus.FAILED),

    createUploadRecord(
      SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyAccept, InterfaceIds.TARS, UploadStatus.ACCEPTED),
    createUploadRecord(
      SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyAccept, InterfaceIds.NOTIFY, UploadStatus.ACCEPTED),
    createUploadRecord(
      SupportInterventionTestCases.FullSubTarsAcceptRsisFailNotifyAccept, InterfaceIds.RSIS, UploadStatus.FAILED),

    createUploadRecord(SupportInterventionTestCases.AutosaveTarsFailNotifyProc, InterfaceIds.TARS, UploadStatus.FAILED),
    createUploadRecord(
      SupportInterventionTestCases.AutosaveTarsFailNotifyProc, InterfaceIds.NOTIFY, UploadStatus.PROCESSING),

    createUploadRecord(SupportInterventionTestCases.AutosaveTarsFailNotifyFail, InterfaceIds.TARS, UploadStatus.FAILED),
    createUploadRecord(
      SupportInterventionTestCases.AutosaveTarsFailNotifyFail, InterfaceIds.NOTIFY, UploadStatus.FAILED),

    createUploadRecord(
      SupportInterventionTestCases.AutosaveTarsFailNotifyAccept, InterfaceIds.TARS, UploadStatus.FAILED),
    createUploadRecord(
      SupportInterventionTestCases.AutosaveTarsFailNotifyAccept, InterfaceIds.NOTIFY, UploadStatus.ACCEPTED),
  ];
};
