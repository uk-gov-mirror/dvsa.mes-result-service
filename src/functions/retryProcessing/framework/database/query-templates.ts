
export const markTestProcessedQuery = `
  UPDATE TEST_RESULT tr
  JOIN (
    SELECT DISTINCT
      uq.application_reference,
      uq.staff_number
    FROM UPLOAD_QUEUE uq
    JOIN TEST_RESULT tr
      ON uq.application_reference = tr.application_reference
      AND uq.staff_number = tr.staff_number
      AND tr.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
    WHERE
      (uq.application_reference, uq.staff_number) NOT IN (
        SELECT application_reference, staff_number
        FROM UPLOAD_QUEUE
        WHERE upload_status != (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'ACCEPTED')
      )
  ) all_uploads_completed
    ON tr.application_reference = all_uploads_completed.application_reference
    AND tr.staff_number = all_uploads_completed.staff_number
  SET tr.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSED')
`;

export const updateErrorsToRetryQueryTemplate = `
  UPDATE UPLOAD_QUEUE uq1
  JOIN (
    SELECT uq.application_reference, uq.staff_number, uq.interface
      FROM UPLOAD_QUEUE uq
      JOIN TEST_RESULT tr
        ON uq.application_reference = tr.application_reference
        AND uq.staff_number = tr.staff_number
        AND tr.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
      WHERE
        uq.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
        AND (
          (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'RSIS') AND uq.retry_count < ?)
          OR
          (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'NOTIFY') AND uq.retry_count < ?)
          OR
          (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'TARS') AND uq.retry_count < ?)
        )
  ) uq2
    ON uq1.application_reference = uq2.application_reference
    AND uq1.staff_number = uq2.staff_number
    AND uq1.interface = uq2.interface
  SET
    uq1.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'PROCESSING'),
    uq1.retry_count = uq1.retry_count + 1
`;

export const selectErrorsWhichWillBeAbortedTemplate = `
  SELECT DISTINCT uq.application_reference, uq.staff_number, uq.interface, uq.error_message
  FROM UPLOAD_QUEUE uq
  JOIN TEST_RESULT tr
    ON uq.application_reference = tr.application_reference
    AND uq.staff_number = tr.staff_number
    AND tr.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
  WHERE
    uq.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
    AND (
      (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'RSIS') AND uq.retry_count >= ?)
      OR
      (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'NOTIFY') AND uq.retry_count >= ?)
      OR
      (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'TARS') AND uq.retry_count >= ?)
    )
`;

export const updateErrorsToAbortQueryTemplate = `
  UPDATE TEST_RESULT tr
  JOIN (
    SELECT DISTINCT uq.application_reference, uq.staff_number
    FROM UPLOAD_QUEUE uq
    JOIN TEST_RESULT tr
      ON uq.application_reference = tr.application_reference
      AND uq.staff_number = tr.staff_number
      AND tr.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
    WHERE
      uq.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
      AND (
        (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'RSIS') AND uq.retry_count >= ?)
        OR
        (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'NOTIFY') AND uq.retry_count >= ?)
        OR
        (uq.interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = 'TARS') AND uq.retry_count >= ?)
      )
  ) abort
    ON tr.application_reference = abort.application_reference
    AND tr.staff_number = abort.staff_number
  SET tr.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'ERROR')
`;

export const manualInterventionReprocessUploadQueueQuery = `
  UPDATE UPLOAD_QUEUE uq
  JOIN TEST_RESULT tr
    ON tr.application_reference = uq.application_reference
    AND tr.staff_number = uq.staff_number
    AND tr.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PENDING')
    AND uq.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'FAILED')
  SET
    uq.upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'PROCESSING'),
    uq.retry_count = 0,
    uq.error_message = NULL
`;

// NOTICE - Regarding changed row count: As the operation of this query has changed from
// INSERT IGNORE to ON DUPLICATE KEY UPDATE. This will now return a count of 2 for each row
// that is edited as a result of this query, unlike it's previous counterpart which returned 1.
// This has been accepted as a better alternative to INSERT IGNORE due to the risk of errors
// being disgarded.
export const manualInterventionUploadQueueReplacementQuery = `
  INSERT INTO UPLOAD_QUEUE (
    SELECT
      tr.application_reference,
      tr.staff_number,
      NOW() as timestamp,
      it.id as interface,
      (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'PROCESSING') as upload_status,
      0 as retry_count,
      NULL as error_message
  FROM TEST_RESULT tr, INTERFACE_TYPE it
  WHERE tr.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PENDING')
) ON DUPLICATE KEY UPDATE
	UPLOAD_QUEUE.application_reference = UPLOAD_QUEUE.application_reference
`;

export const manualInterventionReprocessTestResultQuery = `
  UPDATE TEST_RESULT
  SET result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSING')
  WHERE result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PENDING')
`;

export const deleteAccepetedUploadsQuery = `
  DELETE uq
  FROM UPLOAD_QUEUE uq
  JOIN TEST_RESULT tr
    ON uq.application_reference = tr.application_reference
    AND uq.staff_number = tr.staff_number
    AND tr.result_status = (SELECT id FROM RESULT_STATUS WHERE result_status_name = 'PROCESSED')
  JOIN (
    SELECT application_reference, staff_number, interface
    FROM UPLOAD_QUEUE
    WHERE upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = 'ACCEPTED')
    AND timestamp < ?
  ) to_delete
    ON uq.application_reference = to_delete.application_reference
    AND uq.staff_number = to_delete.staff_number
    AND uq.interface = to_delete.interface
`;
