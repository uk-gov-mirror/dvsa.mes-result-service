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

describe('Autosave processing operations', () => {
  let db: mysql.Connection;
  let retryProcessor: IRetryProcessor;

  beforeAll(async () => {
    db = mysql.createConnection({
      host: 'localhost',
      user: 'results_user',
      database: 'results',
      password: 'Pa55word1',
      port: 1234,
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
      await deleteAutosaveTestResultData(db, 'TEST_RESULT', [56, 57, 58, 59]);
      await deleteAutosaveTestResultData(db, 'UPLOAD_QUEUE', [56, 57, 58, 59]);
    });

    it('should not update autosaved TEST_RESULTS in the PROCESSING state as PROCESSED', async () => {
      await retryProcessor.processSuccessful();
      const autosaveQueueRecords = await getAutosaveQueueRecords(db);
      const autosaveTestRecords = await getAutosaveTestResultRecords(db);

      // assert UPLOAD_QUEUE records have not changed
      expect(autosaveQueueRecords).toContain({ application_reference: 56, interface: 0, upload_status: 0 });
      expect(autosaveQueueRecords).toContain({ application_reference: 56, interface: 1, upload_status: 0 });
      expect(autosaveQueueRecords).toContain({ application_reference: 57, interface: 0, upload_status: 1 });
      expect(autosaveQueueRecords).toContain({ application_reference: 57, interface: 1, upload_status: 0 });
      expect(autosaveQueueRecords).toContain({ application_reference: 58, interface: 0, upload_status: 0 });
      expect(autosaveQueueRecords).toContain({ application_reference: 58, interface: 1, upload_status: 1 });
      expect(autosaveQueueRecords).toContain({ application_reference: 59, interface: 0, upload_status: 1 });
      expect(autosaveQueueRecords).toContain({ application_reference: 59, interface: 1, upload_status: 1 });

      // assert TEST_RESULT records have not changed
      expect(autosaveTestRecords).toContain({ application_reference: 56, result_status: 0 });
      expect(autosaveTestRecords).toContain({ application_reference: 57, result_status: 0 });
      expect(autosaveTestRecords).toContain({ application_reference: 58, result_status: 0 });
      expect(autosaveTestRecords).toContain({ application_reference: 59, result_status: 0 });
    });

  });

  describe('Full submission', () => {
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
      await deleteAutosaveTestResultData(db, 'TEST_RESULT', [56, 57, 58, 59]);
      await deleteAutosaveTestResultData(db, 'UPLOAD_QUEUE', [56, 57, 58, 59]);
    });

    it('should submit autosaved TEST_RESULTS when there is a full submission', async () => {
      await insertAutosaveQueueResultData(db, getRSISData());
      await updateTestResultAutosaveFlag(db, 56, 59);

      const changedRowCount = await retryProcessor.processSuccessful();
      const acceptedTestAppRefs = await getTestResultAppRefsForResultStatus('PROCESSED', db);

      expect(changedRowCount).toBe(1);

      expect(acceptedTestAppRefs).not.toContain(56);
      expect(acceptedTestAppRefs).not.toContain(57);
      expect(acceptedTestAppRefs).not.toContain(58);
      expect(acceptedTestAppRefs).toContain(59);
    });
  });

  const getTestResultData = (): AutosaveTestData[] => {
    return [
      {
        applicationReference: 56,
        staffNumber: '1',
        driverSurname: 'Bloggs',
        resultStatus: 0,
        autosave: true,
      },
      {
        applicationReference: 57,
        staffNumber: '1',
        driverSurname: 'Bloggs',
        resultStatus: 0,
        autosave: true,
      },
      {
        applicationReference: 58,
        staffNumber: '1',
        driverSurname: 'Bloggs',
        resultStatus: 0,
        autosave: true,
      },
      {
        applicationReference: 59,
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
        applicationReference: 56,
        staffNumber: '1',
        timestamp: null,
        interface: 0, // TARS
        uploadStatus: 0, // PROCESSING
        retryCount: 0,
      },
      {
        applicationReference: 56,
        staffNumber: '1',
        timestamp: null,
        interface: 1, // NOTIFY
        uploadStatus: 0, // PROCESSING
        retryCount: 0,
      },
      {
        applicationReference: 57,
        staffNumber: '1',
        timestamp: null,
        interface: 0, // TARS
        uploadStatus: 1, // ACCEPTED
        retryCount: 0,
      },
      {
        applicationReference: 57,
        staffNumber: '1',
        timestamp: null,
        interface: 1, // NOTIFY
        uploadStatus: 0, // PROCESSING
        retryCount: 0,
      },
      {
        applicationReference: 58,
        staffNumber: '1',
        timestamp: null,
        interface: 0, // TARS
        uploadStatus: 0, // PROCESSING
        retryCount: 0,
      },
      {
        applicationReference: 58,
        staffNumber: '1',
        timestamp: null,
        interface: 1, // NOTIFY
        uploadStatus: 1, // ACCEPTED
        retryCount: 0,
      },
      {
        applicationReference: 59,
        staffNumber: '1',
        timestamp: null,
        interface: 0, // TARS
        uploadStatus: 1, // ACCEPTED
        retryCount: 0,
      },
      {
        applicationReference: 59,
        staffNumber: '1',
        timestamp: null,
        interface: 1, // NOTIFY
        uploadStatus: 1, // ACCEPTED
        retryCount: 0,
      },
    ];
  };

  const getRSISData = (): AutosaveQueueData[] => {
    return [
      {
        applicationReference: 56,
        staffNumber: '1',
        timestamp: null,
        interface: 2, // RSIS
        uploadStatus: 0, // PROCESSING
        retryCount: 0,
      },
      {
        applicationReference: 57,
        staffNumber: '1',
        timestamp: null,
        interface: 2, // RSIS
        uploadStatus: 0, // PROCESSING
        retryCount: 0,
      },
      {
        applicationReference: 58,
        staffNumber: '1',
        timestamp: null,
        interface: 2, // RSIS
        uploadStatus: 0, // PROCESSING
        retryCount: 0,
      },
      {
        applicationReference: 59,
        staffNumber: '1',
        timestamp: null,
        interface: 2, // RSIS
        uploadStatus: 1, // ACCEPTED
        retryCount: 0,
      },
    ];
  };

});
