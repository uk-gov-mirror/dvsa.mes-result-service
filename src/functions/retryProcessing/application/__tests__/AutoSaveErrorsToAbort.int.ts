import * as mysql from 'mysql2';
import { IRetryProcessor } from '../IRetryProcessor';
import { RetryProcessor } from '../RetryProcessor';
import { getErroredTestAppRefs, getAutosaveQueueRecords } from './common/HelperSQLQueries';

describe('AutoSaveErrorsToAbort', () => {
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

  it('should set test_status of record to ERROR if TARS/NOTIFY entry is FAILED', async () => {

    await retryProcessor.processErrorsToAbort(5, 5, 5);
    const erroredTestsToAbort = await getErroredTestAppRefs(db);
    const autosaveRecords = await getAutosaveQueueRecords(db);

    // Tests that correct result records are set to ERROR state if ERROR TARS/Notify Record
    expect(erroredTestsToAbort).toContain(70); // TARS = FAILED & NOTIFY = FAILED
    expect(erroredTestsToAbort).toContain(71); // TARS = FAILED & NOTIFY = PROCESSING
    expect(erroredTestsToAbort).toContain(72); // TARS = FAILED & NOTIFY = ACCEPTED
    expect(erroredTestsToAbort).toContain(73); // TARS = PROCESSING & NOTIFY = FAILED
    expect(erroredTestsToAbort).toContain(74); // TARS = ACCEPTED & NOTIFY = FAILED
    expect(erroredTestsToAbort).not.toContain(75); // TARS = ACCEPTED & NOTIFY = ACCEPTED
    expect(erroredTestsToAbort).not.toContain(76); // TARS = PROCESSING & NOTIFY = PROCESSING

    // Tests that upload records remain unchanged after processing
    expect(autosaveRecords).toContain({ application_reference: 70, interface: 0, upload_status: 2 });
    expect(autosaveRecords).toContain({ application_reference: 70, interface: 1, upload_status: 2 });

    expect(autosaveRecords).toContain({ application_reference: 71, interface: 0, upload_status: 2 });
    expect(autosaveRecords).toContain({ application_reference: 71, interface: 1, upload_status: 0 });

    expect(autosaveRecords).toContain({ application_reference: 72, interface: 0, upload_status: 2 });
    expect(autosaveRecords).toContain({ application_reference: 72, interface: 1, upload_status: 1 });

    expect(autosaveRecords).toContain({ application_reference: 73, interface: 0, upload_status: 0 });
    expect(autosaveRecords).toContain({ application_reference: 73, interface: 1, upload_status: 2 });

    expect(autosaveRecords).toContain({ application_reference: 74, interface: 0, upload_status: 1 });
    expect(autosaveRecords).toContain({ application_reference: 74, interface: 1, upload_status: 2 });

    expect(autosaveRecords).toContain({ application_reference: 75, interface: 0, upload_status: 1 });
    expect(autosaveRecords).toContain({ application_reference: 75, interface: 1, upload_status: 1 });

    expect(autosaveRecords).toContain({ application_reference: 76, interface: 0, upload_status: 0 });
    expect(autosaveRecords).toContain({ application_reference: 76, interface: 1, upload_status: 0 });

  });
});
