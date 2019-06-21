import * as mysql from 'mysql2';

export enum DriverDetail {
  ApplicationReference = 'application_reference',
  DriverNumber = 'driver_number',
}

export const buildDriverDetailsSearchQuery = (
  driverDetailKey: DriverDetail,
  driverDetailValue: string,
): string => {
  const template = `
  SELECT *
  FROM TEST_RESULT
  WHERE ? = ?;
  `;
  return mysql.format(template, [driverDetailKey, driverDetailValue]);
};
