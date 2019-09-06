DELIMITER //

CREATE PROCEDURE sp_create_retry_process_autosave(
  AppRef INT,
  ResultStatus NVARCHAR(10),
  ResultDate DATETIME,
  TarsStatus NVARCHAR(10),
  TarsRetryCount INT,
  NotifyStatus NVARCHAR(10),
  NotifyRetryCount INT
)
BEGIN
  INSERT INTO TEST_RESULT(
    application_reference,
    staff_number,
    test_result,
    test_date,
    tc_id,
    tc_cc,
    driver_number,
    driver_surname,
    result_status,
    autosave
  ) VALUES
    (
      AppRef,
      '1',
      '{}',
      ResultDate,
      1,
      1,
      CONCAT('dnum', AppRef),
      'Pearson',
      (SELECT id FROM RESULT_STATUS WHERE result_status_name = ResultStatus),
      1  
    );

  INSERT INTO UPLOAD_QUEUE(
    application_reference,
    staff_number,
    timestamp,
    interface,
    upload_status,
    retry_count,
    error_message
  ) VALUES
    (
      AppRef,
      '1',
      ResultDate,
      0,-- TARS
      (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = TarsStatus),
      TarsRetryCount,
      NULL
    ),
    (
      AppRef,
      '1',
      ResultDate,
      1,-- NOTIFY
      (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = NotifyStatus),
      NotifyRetryCount,
      NULL
    );
  END//
  
DELIMITER ;