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
fdescribe('AutoSaveErrorsToAbort', () => {
  let db: mysql.Connection;
  let retryProcessor: IRetryProcessor;

  beforeAll(() => {
    db = mysql.createConnection({
      host: 'localhost',
      user: 'results_user',
      database: 'results',
      password: 'Pa55word1',
      port: 1234,
    });
    retryProcessor = new RetryProcessor(db);
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
    expect(await getAutosaveQueueRecord(db, InterfaceIds.NOTIFY, ErrorsToAbortTestCases.TarsProcessingNotifyProcessing))
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
