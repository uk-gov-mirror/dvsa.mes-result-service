-- AUTOSAVE - ERRORS TO RETRY
CALL sp_create_retry_process_autosave(65, 'PROCESSING',NOW(),'FAILED', 0,'FAILED', 0);
CALL sp_create_retry_process_autosave(66, 'PROCESSING',NOW(),'FAILED', 0,'PROCESSING', 0);
CALL sp_create_retry_process_autosave(67, 'PROCESSING',NOW(),'FAILED', 0,'ACCEPTED', 0);
CALL sp_create_retry_process_autosave(68, 'PROCESSING',NOW(),'PROCESSING', 0,'FAILED', 0);
CALL sp_create_retry_process_autosave(69, 'PROCESSING',NOW(),'ACCEPTED', 0,'FAILED', 0);

-- AUTOSAVE - ERRORS TO ABORT
CALL sp_create_retry_process_autosave(70,'PROCESSING',NOW(),'FAILED',5,'FAILED',5);
CALL sp_create_retry_process_autosave(71,'PROCESSING',NOW(),'FAILED',5,'PROCESSING',0);
CALL sp_create_retry_process_autosave(72,'PROCESSING',NOW(),'FAILED',5,'ACCEPTED',0);
CALL sp_create_retry_process_autosave(73,'PROCESSING',NOW(),'PROCESSING',0,'FAILED',5);
CALL sp_create_retry_process_autosave(74,'PROCESSING',NOW(),'ACCEPTED',0,'FAILED',5);
CALL sp_create_retry_process_autosave(75,'PROCESSING',NOW(),'ACCEPTED',0,'ACCEPTED',0);
CALL sp_create_retry_process_autosave(76,'PROCESSING',NOW(),'PROCESSING',0,'PROCESSING',0);