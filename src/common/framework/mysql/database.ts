import * as mysql from 'mysql2';
import { config } from '../config/config';
import { certs } from '../../certs/ssl_profiles';

export const getConnection = (): mysql.Connection => {
  const configuration = config();
  const connection: mysql.Connection = mysql.createConnection({
    host: configuration.mesDatabaseHostname,
    database: configuration.mesDatabaseName,
    user: configuration.mesDatabaseUsername,
    password: configuration.mesDatabasePassword,
    charset: 'UTF8_GENERAL_CI',
    ssl: process.env.TESTING_MODE ? null : certs,
    authSwitchHandler(data: any, cb: any) {
      if (data.pluginName === 'mysql_clear_password') {
        cb(null, Buffer.from(`${configuration.mesDatabasePassword}\0`));
      }
    },
  });
  return connection;
};
