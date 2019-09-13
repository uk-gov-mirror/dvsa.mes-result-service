import * as mysql from 'mysql2';
import { IRetryProcessor } from '../IRetryProcessor';
import { RetryProcessor } from '../RetryProcessor';
import { getAutosaveQueueRecord, getTestResultAutosaveFlag , getQueueCount } from './common/HelperSQLQueries';
import { ErrorsToRetryTestCases, InterfaceIds } from './common/TestEnums';
import { ProcessingStatus } from '../../../../common/domain/processing-status';
import { AutosaveTestData } from '../helpers/mock-test-data';
import { AutosaveQueueData } from '../mock-queue-data';
import {
  insertAutosaveTestResultData,
  insertAutosaveQueueResultData,
  deleteAutosaveTestResultData,
} from '../helpers/autosave-helpers';

describe('AutoSaveErrorsToRetry', () => {
  const testCases: ErrorsToRetryTestCases[] =
    [
      ErrorsToRetryTestCases.TarsFailedRsisFailed,
      ErrorsToRetryTestCases.TarsFailedRsisProcessing,
      ErrorsToRetryTestCases.TarsFailedRsisAccepted,
      ErrorsToRetryTestCases.TarsProcessingRsisFailed,
      ErrorsToRetryTestCases.TarsAcceptedRsisFailed,
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

  it('should set test_status of record to PROCESSING if  FAILED, should leave ACCEPTED untouched', async () => {
    await retryProcessor.processErrorsToRetry(5, 5, 5);

    expect(await getAutosaveQueueRecord(db, InterfaceIds.TARS , ErrorsToRetryTestCases.TarsFailedRsisFailed))
    .toContain(
      { application_reference: ErrorsToRetryTestCases.TarsFailedRsisFailed,
        interface: InterfaceIds.TARS,
        upload_status: ProcessingStatus.PROCESSING,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.NOTIFY,  ErrorsToRetryTestCases.TarsFailedRsisFailed))
    .toContain(
      { application_reference: ErrorsToRetryTestCases.TarsFailedRsisFailed,
        interface: InterfaceIds.NOTIFY,
        upload_status: ProcessingStatus.PROCESSING,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.TARS, ErrorsToRetryTestCases.TarsFailedRsisProcessing))
    .toContain(
      { application_reference: ErrorsToRetryTestCases.TarsFailedRsisProcessing,
        interface: InterfaceIds.TARS,
        upload_status: ProcessingStatus.PROCESSING,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.NOTIFY,  ErrorsToRetryTestCases.TarsFailedRsisProcessing))
    .toContain(
      { application_reference: ErrorsToRetryTestCases.TarsFailedRsisProcessing,
        interface: InterfaceIds.NOTIFY,
        upload_status: ProcessingStatus.PROCESSING });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.TARS,  ErrorsToRetryTestCases.TarsFailedRsisAccepted))
    .toContain(
      { application_reference: ErrorsToRetryTestCases.TarsFailedRsisAccepted,
        interface: InterfaceIds.TARS,
        upload_status: ProcessingStatus.PROCESSING,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.NOTIFY,  ErrorsToRetryTestCases.TarsFailedRsisAccepted))
    .toContain(
      { application_reference: ErrorsToRetryTestCases.TarsFailedRsisAccepted,
        interface: InterfaceIds.NOTIFY,
        upload_status: ProcessingStatus.ACCEPTED,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.TARS,  ErrorsToRetryTestCases.TarsProcessingRsisFailed))
    .toContain(
      { application_reference: ErrorsToRetryTestCases.TarsProcessingRsisFailed,
        interface: InterfaceIds.TARS,
        upload_status: ProcessingStatus.PROCESSING,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.NOTIFY,  ErrorsToRetryTestCases.TarsProcessingRsisFailed))
    .toContain(
      { application_reference: ErrorsToRetryTestCases.TarsProcessingRsisFailed,
        interface: InterfaceIds.NOTIFY,
        upload_status: ProcessingStatus.PROCESSING,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.TARS,  ErrorsToRetryTestCases.TarsAcceptedRsisFailed))
    .toContain(
      { application_reference: ErrorsToRetryTestCases.TarsAcceptedRsisFailed,
        interface: InterfaceIds.TARS,
        upload_status: ProcessingStatus.ACCEPTED,
      });

    expect(await getAutosaveQueueRecord(db, InterfaceIds.NOTIFY,  ErrorsToRetryTestCases.TarsAcceptedRsisFailed))
    .toContain(
      { application_reference: ErrorsToRetryTestCases.TarsAcceptedRsisFailed,
        interface: InterfaceIds.NOTIFY,
        upload_status: ProcessingStatus.PROCESSING });

    // ensure autosave flag is still set
    expect(await getTestResultAutosaveFlag(db, ErrorsToRetryTestCases.TarsFailedRsisFailed)).toBe(1);
    expect(await getTestResultAutosaveFlag(db, ErrorsToRetryTestCases.TarsFailedRsisProcessing)).toBe(1);
    expect(await getTestResultAutosaveFlag(db, ErrorsToRetryTestCases.TarsFailedRsisAccepted)).toBe(1);
    expect(await getTestResultAutosaveFlag(db, ErrorsToRetryTestCases.TarsProcessingRsisFailed)).toBe(1);
    expect(await getTestResultAutosaveFlag(db, ErrorsToRetryTestCases.TarsAcceptedRsisFailed)).toBe(1);

      // ensure no RSIS entries created
    expect(await getQueueCount(db,
                               ErrorsToRetryTestCases.TarsFailedRsisFailed,
                               InterfaceIds.RSIS)).toBe(0);
    expect(await getQueueCount(db,
                               ErrorsToRetryTestCases.TarsFailedRsisProcessing,
                               InterfaceIds.RSIS)).toBe(0);
    expect(await getQueueCount(db,
                               ErrorsToRetryTestCases.TarsFailedRsisAccepted,
                               InterfaceIds.RSIS)).toBe(0);
    expect(await getQueueCount(db,
                               ErrorsToRetryTestCases.TarsProcessingRsisFailed,
                               InterfaceIds.RSIS)).toBe(0);
    expect(await getQueueCount(db,
                               ErrorsToRetryTestCases.TarsAcceptedRsisFailed,
                               InterfaceIds.RSIS)).toBe(0);

  });
});

const getTestResultData = (): AutosaveTestData[] => {
  return [
    {
      applicationReference: ErrorsToRetryTestCases.TarsFailedRsisFailed,
      staffNumber: '1',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: true,
    },
    {
      applicationReference: ErrorsToRetryTestCases.TarsFailedRsisProcessing,
      staffNumber: '1',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: true,
    },
    {
      applicationReference: ErrorsToRetryTestCases.TarsFailedRsisAccepted,
      staffNumber: '1',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: true,
    },
    {
      applicationReference: ErrorsToRetryTestCases.TarsProcessingRsisFailed,
      staffNumber: '1',
      driverSurname: 'Bloggs',
      resultStatus: ProcessingStatus.PROCESSING,
      autosave: true,
    },
    {
      applicationReference: ErrorsToRetryTestCases.TarsAcceptedRsisFailed,
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
      applicationReference: ErrorsToRetryTestCases.TarsFailedRsisFailed,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.FAILED,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: ErrorsToRetryTestCases.TarsFailedRsisFailed,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.FAILED,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: ErrorsToRetryTestCases.TarsFailedRsisProcessing,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.FAILED,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference:ErrorsToRetryTestCases.TarsFailedRsisProcessing,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: ErrorsToRetryTestCases.TarsFailedRsisAccepted,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.FAILED,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: ErrorsToRetryTestCases.TarsFailedRsisAccepted,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.ACCEPTED,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: ErrorsToRetryTestCases.TarsProcessingRsisFailed,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.PROCESSING,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: ErrorsToRetryTestCases.TarsProcessingRsisFailed,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.FAILED,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference:ErrorsToRetryTestCases.TarsAcceptedRsisFailed,
      staffNumber: '1',
      interface: InterfaceIds.TARS,
      uploadStatus: ProcessingStatus.ACCEPTED,
      retryCount: 0,
      timestamp: null,
    },
    {
      applicationReference: ErrorsToRetryTestCases.TarsAcceptedRsisFailed,
      staffNumber: '1',
      interface: InterfaceIds.NOTIFY,
      uploadStatus: ProcessingStatus.FAILED,
      retryCount: 0,
      timestamp: null,
    },
  ];
};
