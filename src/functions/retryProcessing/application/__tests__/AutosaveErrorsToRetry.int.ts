import * as mysql from 'mysql2';
import { IRetryProcessor } from '../IretryProcessor';
import { RetryProcessor } from '../RetryProcessor';
import { getErroredTestAppRefs, getAutosaveQueueRecords } from './common/HelperSQLQueries';

fdescribe('AutoSaveErrorsToRetry', () => {
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

  it('should set test_status of record to PROCESSING if  FAILED, should leave ACCEPTED untouched', async () => {

    await retryProcessor.processErrorsToRetry(5, 5, 5);
    const erroredTestsToAbort = await getErroredTestAppRefs(db);
    const autosaveRecords = await getAutosaveQueueRecords(db);

    // expect(erroredTestsToAbort).toContain(70); // TARS = FAILED & NOTIFY = FAILED
    // expect(erroredTestsToAbort).toContain(71); // TARS = FAILED & NOTIFY = PROCESSING
    // expect(erroredTestsToAbort).toContain(72); // TARS = FAILED & NOTIFY = ACCEPTED
    // expect(erroredTestsToAbort).toContain(73); // TARS = PROCESSING & NOTIFY = FAILED
    // expect(erroredTestsToAbort).toContain(74); // TARS = ACCEPTED & NOTIFY = FAILED
    // expect(erroredTestsToAbort).not.toContain(75); // TARS = ACCEPTED & NOTIFY = ACCEPTED
    // expect(erroredTestsToAbort).not.toContain(76); // TARS = PROCESSING & NOTIFY = PROCESSING

    console.log(`${JSON.stringify(autosaveRecords)}`);
    expect(autosaveRecords).toContain({ application_reference: 65, interface: 0, upload_status: 2 });
    expect(autosaveRecords).toContain({ application_reference: 65, interface: 1, upload_status: 2 });

    expect(autosaveRecords).toContain({ application_reference: 66, interface: 0, upload_status: 2 });
    expect(autosaveRecords).toContain({ application_reference: 66, interface: 1, upload_status: 0 });

    expect(autosaveRecords).toContain({ application_reference: 67, interface: 0, upload_status: 2 });
    expect(autosaveRecords).toContain({ application_reference: 67, interface: 1, upload_status: 1 });

    expect(autosaveRecords).toContain({ application_reference: 68, interface: 0, upload_status: 0 });
    expect(autosaveRecords).toContain({ application_reference: 68, interface: 1, upload_status: 2 });

    expect(autosaveRecords).toContain({ application_reference: 69, interface: 0, upload_status: 1 });
    expect(autosaveRecords).toContain({ application_reference: 69, interface: 1, upload_status: 2 });
  });
});
