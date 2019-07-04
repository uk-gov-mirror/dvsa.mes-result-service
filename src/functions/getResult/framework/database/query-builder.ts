import * as mysql from 'mysql2';

export const buildGetResultQuery = (appRef: string): string => {
  const template = `
  SELECT TEST_RESULT.test_result
  FROM TEST_RESULT
  WHERE application_reference = ?;
 `;

  return mysql.format(template, [appRef]);
};
