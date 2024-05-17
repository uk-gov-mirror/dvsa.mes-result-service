import * as mysql from 'mysql2';

export const buildGetResultQuery = (appRef: number): string => {
  const template = `
  SELECT TR.test_result
  FROM TEST_RESULT TR 
  WHERE application_reference = ?;
 `;

  return mysql.format(template, [appRef]);
};
