import * as mysql from 'mysql2';

export const buildGetRegeneratedEmailQuery = (appRef: string): string => {
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
    WHERE application_reference = ? OR booking_reference = ?
 `;

  return mysql.format(template, [appRef, appRef]);
};
