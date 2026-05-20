import * as mysql from 'mysql2';
import { isBookingReference, formatBookingReference } from '../../../../common/application/utils/reference-utils';

export const buildGetResultQuery = (appRef: string): string => {
  if (isBookingReference(appRef)) {
    return buildGetResultByBookingRefQuery(formatBookingReference(appRef));
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
