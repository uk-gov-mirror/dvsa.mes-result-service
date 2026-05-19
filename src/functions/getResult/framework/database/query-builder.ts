import * as mysql from 'mysql2';

const bookingRefRegex = /^D\s?\d{3}\s?\d{3}\s?\d{2}[ABCDEFGHJKLMNPQRTUVWXYZ\d]$/;

export const buildGetResultQuery = (appRef: string): string => {
  if (bookingRefRegex.test(appRef)) {
    const formattedRef = appRef.replace(
      /^D\s?(\d{3})\s?(\d{3})\s?(\d{2}[ABCDEFGHJKLMNPQRTUVWXYZ\d])$/,
      'D $1 $2 $3',
    );
    return buildGetResultByBookingRefQuery(formattedRef);
  }
  return buildGetResultByApplicationRefQuery(appRef);
};

const buildGetResultByApplicationRefQuery = (appRef: string): string => {
  const template = `
      SELECT TR.test_result
      FROM TEST_RESULT TR
      WHERE TR.application_reference = ?;
  `;
  return mysql.format(template, [appRef]);
};

const buildGetResultByBookingRefQuery = (bookingRef: string): string => {
  const template = `
      SELECT TR.test_result
      FROM TEST_RESULT TR
      WHERE TR.booking_reference = ?;
  `;
  return mysql.format(template, [bookingRef]);
};
