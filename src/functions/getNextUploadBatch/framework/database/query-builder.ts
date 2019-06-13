import * as mysql from 'mysql2';

/**
 * Builds a query to select 'batchSize' amount tests results in the upload_queue
 * with a 'Tars' interface type and upload_status as 'Processing'.
 *
 * @param batchSize: number
 */
export const buildTarsNextBatchQuery = (batchSize: number, interfaceType: string): string => {
  const template = `
  SELECT TEST_RESULT.test_result
  FROM TEST_RESULT JOIN UPLOAD_QUEUE
  WHERE TEST_RESULT.application_reference = UPLOAD_QUEUE.application_reference
  AND UPLOAD_QUEUE.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = ?)
  AND UPLOAD_QUEUE.upload_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
  ORDER BY UPLOAD_QUEUE.timestamp ASC
  LIMIT ?;
 `;

  return mysql.format(template, [interfaceType, batchSize]);
};
