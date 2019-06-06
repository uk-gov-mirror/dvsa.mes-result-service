import * as mysql from 'mysql2';
import { getConnection } from '../../../common/framework/mysql/database';
import { updateUploadStatus } from '../framework/database/query-builder';

export const updateUpload = async (id: string, body: any): Promise<void> => {

  const connection: mysql.Connection = getConnection();

  try {
    await connection.promise().query(updateUploadStatus(id, body));
  } catch (err) {
    connection.rollback();
    console.log(err);
  } finally {
    connection.end();
  }
};
