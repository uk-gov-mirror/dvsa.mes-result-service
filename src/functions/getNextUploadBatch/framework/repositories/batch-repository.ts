import { IBatchRepository } from './batch-repository-interface';
import { getConnection } from '../../../../common/framework/mysql/database';
import * as mysql from 'mysql2';
import { buildTarsNextBatchQuery } from '../database/query-builder';
import { TestResultRecord } from '../../domain/test-results';

export class BatchRepository implements IBatchRepository {

  getUploadQueueData(batchSize: number, interfaceType: string): Promise<TestResultRecord[]> {
    const connection: mysql.Connection = getConnection();
    let batch;
    try {
      batch = connection.promise().query(buildTarsNextBatchQuery(batchSize, interfaceType));
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      connection.end();
    }
    return batch;
  }
}
