DELIMITER //

CREATE PROCEDURE sp_create_retry_process_scenario(
  AppRef INT,
  ResultStatus NVARCHAR(10),
  ResultDate DATETIME,
  TarsStatus NVARCHAR(10),
  TarsRetryCount INT,
  RsisStatus NVARCHAR(10),
  RsisRetryCount INT,
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
    result_status
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
      (SELECT id FROM RESULT_STATUS WHERE result_status_name = ResultStatus)
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
      0, -- TARS
      (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = TarsStatus),
      TarsRetryCount,
      NULL
    ),
    (
      AppRef,
      '1',
      ResultDate,
      2, -- RSIS
      (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = RsisStatus),
      RsisRetryCount,
      NULL
    );
  -- Notify may not have an UPLOAD_QUEUE record if it's a terminated test
  IF NotifyStatus IS NOT NULL THEN
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
        1, -- Notify
        (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = NotifyStatus),
        NotifyRetryCount,
        NULL
      );
  END IF;
END//

DELIMITER ;