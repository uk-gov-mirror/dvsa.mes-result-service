import * as mysql from 'mysql2';

export const buildGetRegeneratedEmailQuery = (appRef: string): string => {
  // Trim spaces and convert to uppercase for consistent comparison
  const sanitizedAppRef = appRef?.replace(/\s/g, '').toUpperCase() || '';

  const template = `
    SELECT COALESCE(application_reference, booking_reference) as appRef,
           JSON_ARRAYAGG(
                JSON_OBJECT(
                    'newEmail', new_email,
                    'regeneratedDate', regenerated_date,
                    'newLanguage', new_language
                )
           ) as emailRegenerationDetails
    FROM AUDIT_EMAIL_REGEN
    WHERE application_reference = ? OR UPPER(REPLACE(booking_reference, ' ', '')) = ?
 `;

  return mysql.format(template, [appRef, sanitizedAppRef]);
};
