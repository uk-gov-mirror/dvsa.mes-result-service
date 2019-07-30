import * as mysql from 'mysql2';
import { getConnection } from '../../../common/framework/mysql/database';
import { updateUploadStatus } from '../framework/database/query-builder';
import { InconsistentUpdateError } from '../domain/InconsistentUpdateError';
import { error } from '@dvsa/mes-microservice-common/application/utils/logger';

export const updateUpload = async (id: number, body: any): Promise<void> => {

  const connection: mysql.Connection = getConnection();

  try {
    const [update] = await connection.promise().query(updateUploadStatus(id, body));
    // PK should prevent more than 1 record being updated, assume it's 0
    if (update.changedRows !== 1) {
      throw new InconsistentUpdateError();
    }
  } catch (err) {
    connection.rollback();
    if (err instanceof InconsistentUpdateError) {
      throw err;
    }
    error(err);
  } finally {
    connection.end();
  }
};
