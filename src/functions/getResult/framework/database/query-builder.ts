import * as mysql from 'mysql2';

export const buildGetResultQuery = (appRef: string): string => {
  const template = `
      SELECT TR.test_result
      FROM TEST_RESULT TR
      WHERE (booking_reference = ?)
         OR (booking_reference IS NULL and application_reference = ?)
  `;

  return mysql.format(template, [appRef, appRef]);
};
