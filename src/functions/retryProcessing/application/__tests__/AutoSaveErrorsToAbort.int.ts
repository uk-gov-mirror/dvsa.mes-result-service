import * as mysql from 'mysql2';
import { IRetryProcessor } from '../IRetryProcessor';
import { RetryProcessor } from '../RetryProcessor';
import {
  getTestResultAutosaveFlag,
  getQueueCount,
  getAutosaveQueueRecord,
  getErroredTestAppRef} from './common/HelperSQLQueries';
import { ErrorsToAbortTestCases, InterfaceIds } from './common/TestEnums';
import { ProcessingStatus } from '../../../../common/domain/processing-status';
import { AutosaveTestData } from '../helpers/mock-test-data';
import { AutosaveQueueData } from '../mock-queue-data';
import {
  insertAutosaveTestResultData,
  insertAutosaveQueueResultData,
  deleteAutosaveTestResultData,
} from '../helpers/autosave-helpers';

describe('AutoSaveErrorsToAbort', () => {
  const testCases: ErrorsToAbortTestCases[] =
    [
      ErrorsToAbortTestCases.TarsFailedNotifyFailed,
      ErrorsToAbortTestCases.TarsFailedNotifyProcessing,
      ErrorsToAbortTestCases.TarsFailedNotifyAccepted,
      ErrorsToAbortTestCases.TarsProcessingNotifyFailed,
      ErrorsToAbortTestCases.TarsAcceptedNotifyFailed,
      ErrorsToAbortTestCases.TarsAcceptedNotifyAccepted,
      ErrorsToAbortTestCases.TarsProcessingNotifyProcessing,
    ];
  let db: mysql.Connection;
  let retryProcessor: IRetryProcessor;

  beforeAll(() => {
    db = mysql.createConnection({
      host: 'localhost',
      user: 'results_user',
      database: 'results',
      password: 'Pa55word1',
      port: 3306,
    });
    retryProcessor = new RetryProcessor(db);
  });

  beforeEach(async () => {
    const testResultData = getTestResultData();
    const queueResultData = getQueueResultData();

    await insertAutosaveTestResultData(db, testResultData);
    await insertAutosaveQueueResultData(db, queueResultData);
  });

  afterEach(async () => {
    await deleteAutosaveTestResultData(db, 'TEST_RESULT', testCases);
    await deleteAutosaveTestResultData(db, 'UPLOAD_QUEUE', testCases);
  });

  it('should set test_status of record to ERROR if TARS/NOTIFY entry is FAILED', async () => {

    await retryProcessor.processErrorsToAbort(5, 5, 5);

    // Tests that correct result records are set to ERROR state if ERROR TARS/Notify Record
    expect(await getErroredTestAppRef(db, ErrorsToAbortTestCases.TarsFailedNotifyFailed))
    .toContain(ErrorsToAbortTestCases.TarsFailedNotifyFailed);
    expect(await getErroredTestAppRef(db, ErrorsToAbortTestCases.TarsFailedNotifyProcessing))
    .toContain(ErrorsToAbortTestCases.TarsFailedNotifyProcessing);
    expect(await getErroredTestAppRef(db, ErrorsToAbortTestCases.TarsFailedNotifyAccepted))
    .toContain(ErrorsToAbortTestCases.TarsFailedNotifyAccepted);
    expect(await getErroredTestAppRef(db, ErrorsToAbortTestCases.TarsProcessingNotifyFailed))
    .toContain(ErrorsToAbortTestCases.TarsProcessingNotifyFailed);
    expect(await getErroredTestAppRef(db, ErrorsToAbortTestCases.TarsAcceptedNotifyFailed))
    .toContain(ErrorsToAbortTestCases.TarsAcceptedNotifyFailed);
    expect(await getErroredTestAppRef(db, ErrorsToAbortTestCases.TarsAcceptedNotifyAccepted))
    .not.toContain(ErrorsToAbortTestCases.TarsAcceptedNotifyAccepted);
    expect(await getErroredTestAppRef(db, ErrorsToAbortTestCases.TarsProcessingNotifyProcessing))
    .not.toContain(ErrorsToAbortTestCases.TarsProcessingNotifyProcessing);

    // Tests that upload records remain unchanged after processing
    expect(await getAutosaveQueueRecord(db, InterfaceIds.TARS, ErrorsToAbortTestCases.TarsFailedNotifyFailed))
    .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsFailedNotifyFailed,
        interface: InterfaceIds.TARS,
        upload_status: ProcessingStatus.FAILED,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.NOTIFY, ErrorsToAbortTestCases.TarsFailedNotifyFailed))
    .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsFailedNotifyFailed,
        interface: InterfaceIds.NOTIFY,
        upload_status: ProcessingStatus.FAILED,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.TARS, ErrorsToAbortTestCases.TarsFailedNotifyProcessing))
    .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsFailedNotifyProcessing,
        interface: InterfaceIds.TARS,
        upload_status: ProcessingStatus.FAILED,
      });
    expect(await getAutosaveQueueRecord(db, InterfaceIds.NOTIFY, ErrorsToAbortTestCases.TarsFailedNotifyProcessing))
      .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsFailedNotifyProcessing,
        interface: InterfaceIds.NOTIFY,
        upload_status: ProcessingStatus.PROCESSING,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.TARS, ErrorsToAbortTestCases.TarsFailedNotifyAccepted))
      .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsFailedNotifyAccepted,
        interface: InterfaceIds.TARS,
        upload_status: ProcessingStatus.FAILED,
      });
    expect(await getAutosaveQueueRecord(db, InterfaceIds.NOTIFY, ErrorsToAbortTestCases.TarsFailedNotifyAccepted))
      .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsFailedNotifyAccepted,
        interface: InterfaceIds.NOTIFY,
        upload_status: ProcessingStatus.ACCEPTED,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.TARS, ErrorsToAbortTestCases.TarsProcessingNotifyFailed))
      .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsProcessingNotifyFailed,
        interface: InterfaceIds.TARS,
        upload_status: ProcessingStatus.PROCESSING });
    expect(await getAutosaveQueueRecord(db, InterfaceIds.NOTIFY, ErrorsToAbortTestCases.TarsProcessingNotifyFailed))
        .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsProcessingNotifyFailed,
        interface: InterfaceIds.NOTIFY,
        upload_status: ProcessingStatus.FAILED,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.TARS, ErrorsToAbortTestCases.TarsAcceptedNotifyFailed))
      .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsAcceptedNotifyFailed,
        interface: InterfaceIds.TARS,
        upload_status: ProcessingStatus.ACCEPTED,
      });
    expect(await getAutosaveQueueRecord(db, InterfaceIds.NOTIFY, ErrorsToAbortTestCases.TarsAcceptedNotifyFailed))
      .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsAcceptedNotifyFailed,
        interface: InterfaceIds.NOTIFY,
        upload_status: ProcessingStatus.FAILED,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.TARS, ErrorsToAbortTestCases.TarsAcceptedNotifyAccepted))
      .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsAcceptedNotifyAccepted,
        interface: InterfaceIds.TARS,
        upload_status: ProcessingStatus.ACCEPTED,
      });
    expect(await getAutosaveQueueRecord(db, InterfaceIds.NOTIFY, ErrorsToAbortTestCases.TarsAcceptedNotifyAccepted))
      .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsAcceptedNotifyAccepted,
        interface: InterfaceIds.NOTIFY,
        upload_status: ProcessingStatus.ACCEPTED,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.TARS, ErrorsToAbortTestCases.TarsProcessingNotifyProcessing))
      .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsProcessingNotifyProcessing,
        interface: InterfaceIds.TARS,
        upload_status: ProcessingStatus.PROCESSING,
      });
    expect(
        await getAutosaveQueueRecord(db, InterfaceIds.NOTIFY, ErrorsToAbortTestCases.TarsProcessingNotifyProcessing))
      .toContain(
      { application_reference: ErrorsToAbortTestCases.TarsProcessingNotifyProcessing,
        interface: InterfaceIds.NOTIFY,
        upload_status: ProcessingStatus.PROCESSING,
      });

    // ensure autosave flag is still set
    expect(await getTestResultAutosaveFlag(db, ErrorsToAbortTestCases.TarsFailedNotifyFailed)).toBe(1);
    expect(await getTestResultAutosaveFlag(db, ErrorsToAbortTestCases.TarsFailedNotifyProcessing)).toBe(1);
    expect(await getTestResultAutosaveFlag(db, ErrorsToAbortTestCases.TarsFailedNotifyAccepted)).toBe(1);
    expect(await getTestResultAutosaveFlag(db, ErrorsToAbortTestCases.TarsProcessingNotifyFailed)).toBe(1);
    expect(await getTestResultAutosaveFlag(db, ErrorsToAbortTestCases.TarsAcceptedNotifyFailed)).toBe(1);
    expect(await getTestResultAutosaveFlag(db, ErrorsToAbortTestCases.TarsAcceptedNotifyAccepted)).toBe(1);
    expect(await getTestResultAutosaveFlag(db, ErrorsToAbortTestCases.TarsProcessingNotifyProcessing)).toBe(1);

      // ensure no RSIS entries created
    expect(await getQueueCount(db,
                               ErrorsToAbortTestCases.TarsFailedNotifyFailed,
                               InterfaceIds.RSIS)).toBe(0);
    expect(await getQueueCount(db,
                               ErrorsToAbortTestCases.TarsFailedNotifyProcessing,
                               InterfaceIds.RSIS)).toBe(0);
    expect(await getQueueCount(db,
                               ErrorsToAbortTestCases.TarsFailedNotifyAccepted,
                               InterfaceIds.RSIS)).toBe(0);
    expect(await getQueueCount(db,
                               ErrorsToAbortTestCases.TarsProcessingNotifyFailed,
                               InterfaceIds.RSIS)).toBe(0);
    expect(await getQueueCount(db,
                               ErrorsToAbortTestCases.TarsAcceptedNotifyFailed,
                               InterfaceIds.RSIS)).toBe(0);

    expect(await getQueueCount(db,
                               ErrorsToAbortTestCases.TarsAcceptedNotifyAccepted,
                               InterfaceIds.RSIS)).toBe(0);
    expect(await getQueueCount(db,
                               ErrorsToAbortTestCases.TarsProcessingNotifyProcessing,
                               InterfaceIds.RSIS)).toBe(0);

  });
});

const getTestResultData = (): AutosaveTestData[] => {
  return [
    {
      applicationReference: ErrorsToAbortTestCases.TarsFailedNotifyFailed,
      staffNumber: '1',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: true,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsFailedNotifyProcessing,
      staffNumber: '1',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: true,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsFailedNotifyAccepted,
      staffNumber: '1',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: true,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsProcessingNotifyFailed,
      staffNumber: '1',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: true,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsAcceptedNotifyFailed,
      staffNumber: '1',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: true,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsAcceptedNotifyAccepted,
      staffNumber: '1',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: true,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsProcessingNotifyProcessing,
      staffNumber: '1',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: true,
    },
  ];
};

const getQueueResultData = (): AutosaveQueueData[] => {
  return [
    {
      applicationReference: ErrorsToAbortTestCases.TarsFailedNotifyFailed,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.FAILED,
      retryCount: 5,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsFailedNotifyFailed,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.FAILED,
      retryCount: 5,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsFailedNotifyProcessing,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.FAILED,
      retryCount: 5,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsFailedNotifyProcessing,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsFailedNotifyAccepted,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.FAILED,
      retryCount: 5,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsFailedNotifyAccepted,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.ACCEPTED,
      retryCount: 0,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsProcessingNotifyFailed,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsProcessingNotifyFailed,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.FAILED,
      retryCount: 5,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsAcceptedNotifyFailed,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.ACCEPTED,
      retryCount: 0,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsAcceptedNotifyFailed,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.FAILED,
      retryCount: 5,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsAcceptedNotifyAccepted,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.ACCEPTED,
      retryCount: 0,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsAcceptedNotifyAccepted,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.ACCEPTED,
      retryCount: 0,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsProcessingNotifyProcessing,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
    },
    {
      applicationReference: ErrorsToAbortTestCases.TarsProcessingNotifyProcessing,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
    },
  ];
};
