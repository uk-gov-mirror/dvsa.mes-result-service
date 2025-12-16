import * as mysql from 'mysql2';

import { getConnection } from '../../../../common/framework/mysql/database';
import { buildGetRegeneratedEmailQuery } from '../database/query-builder';
import { RegeneratedEmailsRecord } from '../../../../common/domain/regenerated-emails';

export const getRegeneratedEmails = async (appRef: string): Promise<RegeneratedEmailsRecord[]> => {
  const connection: mysql.Connection = getConnection();
  let batch: mysql.RowDataPacket[];
  try {
    const [rows] = await connection.promise().query<mysql.RowDataPacket[]>(
      buildGetRegeneratedEmailQuery(appRef),
    );
    batch = rows;
  } catch (err) {
    throw err;
  } finally {
    connection.end();
  }
  return batch as RegeneratedEmailsRecord[];
};
