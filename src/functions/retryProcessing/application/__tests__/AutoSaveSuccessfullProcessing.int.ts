import * as mysql from 'mysql2';
import { IRetryProcessor } from '../IRetryProcessor';
import { RetryProcessor } from '../RetryProcessor';
import {
  getAutosaveQueueRecords,
  getAutosaveTestResultRecords,
  updateTestResultAutosaveFlag,
  getTestResultAppRefsForResultStatus,
  insertAutosaveTestResultData,
  deleteAutosaveTestResultData,
  insertAutosaveQueueResultData,
} from '../helpers/autosave-helpers';
import { AutosaveTestData } from '../helpers/mock-test-data';
import { AutosaveQueueData } from '../mock-queue-data';
import { SuccessfulTestCases, InterfaceIds } from './common/TestEnums';
import { ProcessingStatus } from '../../../../common/domain/processing-status';

describe('Autosave processing operations', () => {
  let db: mysql.Connection;
  let retryProcessor: IRetryProcessor;
  const testCases: SuccessfulTestCases[] = [
    SuccessfulTestCases.TarsProcessingNotifyProcessing,
    SuccessfulTestCases.TarsAcceptedNotifyProcessing,
    SuccessfulTestCases.TarsProcessingNotifyAccepted,
    SuccessfulTestCases.TarsAcceptedNotifyAccepted,
  ];

  beforeAll(async () => {
    db = mysql.createConnection({
      host: 'localhost',
      user: 'results_user',
      database: 'results',
      password: 'Pa55word1',
      port: 3306,
    });
    retryProcessor = new RetryProcessor(db);
  });

  describe('Partial submission', () => {
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

    it('should not update autosaved TEST_RESULTS in the PROCESSING state as PROCESSED', async () => {
      await retryProcessor.processSuccessful();
      const autosaveQueueRecords = await getAutosaveQueueRecords(db);
      const autosaveTestRecords = await getAutosaveTestResultRecords(db);

      // assert UPLOAD_QUEUE records have not changed
      expect(autosaveQueueRecords).toContain(
        {
          application_reference: SuccessfulTestCases.TarsProcessingNotifyProcessing,
          interface: InterfaceIds.TARS,
          upload_status:0,
        });
      expect(autosaveQueueRecords).toContain(
        {
          application_reference: SuccessfulTestCases.TarsProcessingNotifyProcessing,
          interface: InterfaceIds.NOTIFY,
          upload_status: 0,
        });
      expect(autosaveQueueRecords).toContain(
        {
          application_reference: SuccessfulTestCases.TarsAcceptedNotifyProcessing,
          interface: InterfaceIds.TARS,
          upload_status: 1,
        });
      expect(autosaveQueueRecords).toContain(
        {
          application_reference: SuccessfulTestCases.TarsAcceptedNotifyProcessing,
          interface: InterfaceIds.NOTIFY,
          upload_status: 0,
        });
      expect(autosaveQueueRecords).toContain(
        {
          application_reference: SuccessfulTestCases.TarsProcessingNotifyAccepted,
          interface: InterfaceIds.TARS,
          upload_status: 0,
        });
      expect(autosaveQueueRecords).toContain(
        {
          application_reference: SuccessfulTestCases.TarsProcessingNotifyAccepted,
          interface: InterfaceIds.NOTIFY,
          upload_status: 1,
        });
      expect(autosaveQueueRecords).toContain(
        {
          application_reference: SuccessfulTestCases.TarsAcceptedNotifyAccepted,
          interface: InterfaceIds.TARS,
          upload_status: 1,
        });
      expect(autosaveQueueRecords).toContain(
        {
          application_reference: SuccessfulTestCases.TarsAcceptedNotifyAccepted,
          interface: InterfaceIds.NOTIFY,
          upload_status: 1,
        });

      // assert TEST_RESULT records have not changed
      expect(autosaveTestRecords).toContain(
        {
          application_reference: SuccessfulTestCases.TarsProcessingNotifyProcessing,
          result_status: 0,
        });

      expect(autosaveTestRecords).toContain(
        {
          application_reference: SuccessfulTestCases.TarsAcceptedNotifyProcessing,
          result_status: 0,
        });
      expect(autosaveTestRecords).toContain(
        {
          application_reference: SuccessfulTestCases.TarsProcessingNotifyAccepted,
          result_status: 0,
        });
      expect(autosaveTestRecords).toContain(
        {
          application_reference: SuccessfulTestCases.TarsAcceptedNotifyAccepted,
          result_status: 0,
        });
    });

  });

  describe('Partial submission', () => {
    beforeEach(async () => {
      // necessary to cleanse data that skews results depending on Jasmine spec execution order
      // due to some test data being created by docker scripts for other integration tests
      await retryProcessor.processSuccessful();

      const testResultData = getTestResultData();
      const queueResultData = getQueueResultData();
      await insertAutosaveTestResultData(db, testResultData);
      await insertAutosaveQueueResultData(db, queueResultData);
    });

    afterEach(async () => {
      await deleteAutosaveTestResultData(db, 'TEST_RESULT', testCases);
      await deleteAutosaveTestResultData(db, 'UPLOAD_QUEUE', testCases);
    });

    it('should submit autosaved TEST_RESULTS when there is a full submission', async () => {
      await insertAutosaveQueueResultData(db, getRSISData());
      await updateTestResultAutosaveFlag(
        db,
        SuccessfulTestCases.TarsProcessingNotifyProcessing,
        SuccessfulTestCases.TarsAcceptedNotifyAccepted,
        );

      const changedRowCount = await retryProcessor.processSuccessful();
      const acceptedTestAppRefs = await getTestResultAppRefsForResultStatus('PROCESSED', db);

      expect(changedRowCount).toBe(1);

      expect(acceptedTestAppRefs).not.toContain(SuccessfulTestCases.TarsProcessingNotifyProcessing);
      expect(acceptedTestAppRefs).not.toContain(SuccessfulTestCases.TarsAcceptedNotifyProcessing);
      expect(acceptedTestAppRefs).not.toContain(SuccessfulTestCases.TarsProcessingNotifyAccepted);
      expect(acceptedTestAppRefs).toContain(SuccessfulTestCases.TarsAcceptedNotifyAccepted);
    });
  });

  const getTestResultData = (): AutosaveTestData[] => {
    return [
      {
        applicationReference: SuccessfulTestCases.TarsProcessingNotifyProcessing,
        staffNumber: '1',
        driverSurname: 'Bloggs',
        resultStatus: 0,
        autosave: true,
      },
      {
        applicationReference: SuccessfulTestCases.TarsAcceptedNotifyProcessing,
        staffNumber: '1',
        driverSurname: 'Bloggs',
        resultStatus: 0,
        autosave: true,
      },
      {
        applicationReference: SuccessfulTestCases.TarsProcessingNotifyAccepted,
        staffNumber: '1',
        driverSurname: 'Bloggs',
        resultStatus: 0,
        autosave: true,
      },
      {
        applicationReference: SuccessfulTestCases.TarsAcceptedNotifyAccepted,
        staffNumber: '1',
        driverSurname: 'Bloggs',
        resultStatus: 0,
        autosave: true,
      },
    ];
  };

  const getQueueResultData = (): AutosaveQueueData[] => {
    return [
      {
        applicationReference: SuccessfulTestCases.TarsProcessingNotifyProcessing,
        staffNumber: '1',
        interface: InterfaceIds.TARS,
        uploadStatus: ProcessingStatus.PROCESSING,
        retryCount: 0,
        timestamp: null,
      },
      {
        applicationReference: SuccessfulTestCases.TarsProcessingNotifyProcessing,
        staffNumber: '1',
        interface: InterfaceIds.NOTIFY,
        uploadStatus: ProcessingStatus.PROCESSING,
        retryCount: 0,
        timestamp: null,
      },
      {
        applicationReference: SuccessfulTestCases.TarsAcceptedNotifyProcessing,
        staffNumber: '1',
        interface: InterfaceIds.TARS,
        uploadStatus: ProcessingStatus.ACCEPTED,
        retryCount: 0,
        timestamp: null,
      },
      {
        applicationReference: SuccessfulTestCases.TarsAcceptedNotifyProcessing,
        staffNumber: '1',
        interface: InterfaceIds.NOTIFY,
        uploadStatus: ProcessingStatus.PROCESSING,
        retryCount: 0,
        timestamp: null,
      },
      {
        applicationReference: SuccessfulTestCases.TarsProcessingNotifyAccepted,
        staffNumber: '1',
        interface: InterfaceIds.TARS,
        uploadStatus: ProcessingStatus.PROCESSING,
        retryCount: 0,
        timestamp: null,
      },
      {
        applicationReference: SuccessfulTestCases.TarsProcessingNotifyAccepted,
        staffNumber: '1',
        interface: InterfaceIds.NOTIFY,
        uploadStatus: ProcessingStatus.ACCEPTED,
        retryCount: 0,
        timestamp: null,
      },
      {
        applicationReference: SuccessfulTestCases.TarsAcceptedNotifyAccepted,
        staffNumber: '1',
        interface: InterfaceIds.TARS,
        uploadStatus: ProcessingStatus.ACCEPTED,
        retryCount: 0,
        timestamp: null,
      },
      {
        applicationReference: SuccessfulTestCases.TarsAcceptedNotifyAccepted,
        staffNumber: '1',
        interface: InterfaceIds.NOTIFY,
        uploadStatus: ProcessingStatus.ACCEPTED,
        retryCount: 0,
        timestamp: null,
      },
    ];
  };

  const getRSISData = (): AutosaveQueueData[] => {
    return [
      {
        applicationReference: SuccessfulTestCases.TarsProcessingNotifyProcessing,
        staffNumber: '1',
        interface: InterfaceIds.RSIS,
        uploadStatus: ProcessingStatus.PROCESSING,
        retryCount: 0,
        timestamp: null,
      },
      {
        applicationReference: SuccessfulTestCases.TarsAcceptedNotifyProcessing,
        staffNumber: '1',
        interface: InterfaceIds.RSIS,
        uploadStatus: ProcessingStatus.PROCESSING,
        retryCount: 0,
        timestamp: null,
      },
      {
        applicationReference: SuccessfulTestCases.TarsProcessingNotifyAccepted,
        staffNumber: '1',
        interface: InterfaceIds.RSIS,
        uploadStatus: ProcessingStatus.PROCESSING,
        retryCount: 0,
        timestamp: null,
      },
      {
        applicationReference: SuccessfulTestCases.TarsAcceptedNotifyAccepted,
        staffNumber: '1',
        interface: InterfaceIds.RSIS,
        uploadStatus: ProcessingStatus.ACCEPTED,
        retryCount: 0,
        timestamp: null,
      },
    ];
  };

});
