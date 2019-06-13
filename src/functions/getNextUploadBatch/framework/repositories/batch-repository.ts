import { IBatchRepository } from './batch-repository-interface';
import { getConnection } from '../../../../common/framework/mysql/database';
import * as mysql from 'mysql2';
import { buildTarsNextBatchQuery } from '../database/query-builder';
import { TestResultRecord } from '../../domain/test-results';

export class BatchRepository implements IBatchRepository {

  async getUploadQueueData(batchSize: number, interfaceType: string): Promise<TestResultRecord[]> {
    const connection: mysql.Connection = getConnection();
    let batch;
    try {
      const [rows, fields] = await connection.promise().query(buildTarsNextBatchQuery(batchSize, interfaceType));
      batch = rows;
    } catch (err) {
      connection.rollback();
      throw err;
    } finally {
      connection.end();
    }
    return batch;
  }
}
