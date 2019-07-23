import {
  markTestProcessedQuery,
  updateErrorsToRetryQueryTemplate,
  updateErrorsToAbortQueryTemplate as abortTestsExceedingRetryQueryTemplate,
  updateManuallyIntervenedForReprocessQuery,
  deleteAccepetedUploadsQuery,
} from './query-templates';
import * as mysql from 'mysql2';
import moment = require('moment');

/**
 * Builds query to update TEST_RESULT records to ACCEPTED where all interface records in
 * UPLOAD_QUEUE have been accepted
 */
export const buildMarkTestProcessedQuery = () => mysql.format(markTestProcessedQuery);

/**
 * Builds query to update the UPLOAD_QUEUE, resetting retry counts/status on all errors to retry.
 * @param rsisRetryCount
 * @param notifyRetryCount
 * @param tarsRetryCount
 */
export const buildUpdateErrorsToRetryQuery = (
  rsisRetryCount: number,
  notifyRetryCount: number,
  tarsRetryCount: number,
) => mysql.format(
  updateErrorsToRetryQueryTemplate,
  [rsisRetryCount, notifyRetryCount, tarsRetryCount],
);

/**
 * Builds query to update TEST_RESULT record to ERROR where there are interfaces that exceeded
 * the retry limit on any interface.
 * @param rsisRetryCount
 * @param notifyRetryCount
 * @param tarsRetryCount
 */
export const buildAbortTestsExceeingRetryQuery = (
  rsisRetryCount: number,
  notifyRetryCount: number,
  tarsRetryCount: number,
) => mysql.format(
  abortTestsExceedingRetryQueryTemplate,
  [rsisRetryCount, notifyRetryCount, tarsRetryCount],
);

/**
 * Builds query to retrieve support intervention results
 */
export const buildManualInterventionUpdateQuery = () => mysql.format(updateManuallyIntervenedForReprocessQuery);

export const buildDeleteAcceptedQueueRowsQuery = (cutOffPointInDays: number) => {
  const startDate = moment().subtract(cutOffPointInDays, 'days').format('YYYY-MM-DD HH:mm:ss');
  return mysql.format(deleteAccepetedUploadsQuery, [startDate]);
};
