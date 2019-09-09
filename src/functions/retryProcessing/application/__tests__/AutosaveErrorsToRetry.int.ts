import * as mysql from 'mysql2';
import { IRetryProcessor } from '../IRetryProcessor';
import { RetryProcessor } from '../RetryProcessor';
import { getAutosaveQueueRecords } from './common/HelperSQLQueries';

describe('AutoSaveErrorsToRetry', () => {
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

  it('should set test_status of record to PROCESSING if  FAILED, should leave ACCEPTED untouched', async () => {
    await retryProcessor.processErrorsToRetry(5, 5, 5);
    const autosaveRecords = await getAutosaveQueueRecords(db);

    expect(autosaveRecords).toContain({ application_reference: 65, interface: 0, upload_status: 0 });
    expect(autosaveRecords).toContain({ application_reference: 65, interface: 1, upload_status: 0 });

    expect(autosaveRecords).toContain({ application_reference: 66, interface: 0, upload_status: 0 });
    expect(autosaveRecords).toContain({ application_reference: 66, interface: 1, upload_status: 0 });

    expect(autosaveRecords).toContain({ application_reference: 67, interface: 0, upload_status: 0 });
    expect(autosaveRecords).toContain({ application_reference: 67, interface: 1, upload_status: 1 });

    expect(autosaveRecords).toContain({ application_reference: 68, interface: 0, upload_status: 0 });
    expect(autosaveRecords).toContain({ application_reference: 68, interface: 1, upload_status: 0 });

    expect(autosaveRecords).toContain({ application_reference: 69, interface: 0, upload_status: 1 });
    expect(autosaveRecords).toContain({ application_reference: 69, interface: 1, upload_status: 0 });
  });
});
