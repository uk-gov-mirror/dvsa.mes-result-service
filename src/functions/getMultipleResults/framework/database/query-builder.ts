import * as mysql from 'mysql2';

export const multipleTestResultsQuery = (staffNumber: string, appRefs:string[]): string => {
  const template = `
  SELECT TR.test_result
       , CAST(TR.autosave AS UNSIGNED) as autosave
  FROM TEST_RESULT TR 
  WHERE staff_number = ?
  AND application_reference in (?)
 `;

  return mysql.format(template, [staffNumber, appRefs]);
};
