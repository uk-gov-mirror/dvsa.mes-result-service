import * as mysql from 'mysql2';

export const buildGetRegeneratedEmailQuery = (appRef: string): string => {
  const template = `
    SELECT application_reference as appRef,
           JSON_ARRAYAGG(
                JSON_OBJECT(
                    'newEmail', new_email,
                    'regeneratedDate', regenerated_date,
                    'newLanguage', new_language
                )
           ) as emailRegenerationDetails
    FROM AUDIT_EMAIL_REGEN where application_reference = ?;
 `;

  return mysql.format(template, [appRef]);
};
