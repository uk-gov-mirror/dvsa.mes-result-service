-- #############################################################
-- # Scenarios
-- # https://wiki.dvsacloud.uk/display/MES/Retry+Lambda+Scenarios
-- #############################################################
CALL sp_create_retry_process_scenario(1,'PROCESSING',NOW(),'PROCESSING',0,'PROCESSING',0,'PROCESSING',0);
CALL sp_create_retry_process_scenario(2,'ERROR',NOW(),'PROCESSING',0,'PROCESSING',0,'PROCESSING',0);
CALL sp_create_retry_process_scenario(3,'PROCESSING',NOW(),'PROCESSING',0,'ACCEPTED',2,'ACCEPTED',0);
CALL sp_create_retry_process_scenario(4,'PROCESSING',NOW(),'ACCEPTED',2,'PROCESSING',0,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(5,'PROCESSING',NOW(),'ACCEPTED',2,'ACCEPTED',2,'PROCESSING',0);
CALL sp_create_retry_process_scenario(6,'PROCESSING',NOW(),'PROCESSING',0,'PROCESSING',0,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(7,'PROCESSING',NOW(),'PROCESSING',0,'ACCEPTED',2,'PROCESSING',0);
CALL sp_create_retry_process_scenario(8,'PROCESSING',NOW(),'ACCEPTED',2,'PROCESSING',0,'PROCESSING',0);
CALL sp_create_retry_process_scenario(9,'PROCESSING',NOW(),'ACCEPTED',2,'ACCEPTED',2,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(10,'PROCESSING',NOW(),'ACCEPTED',2,'ACCEPTED',2,NULL,NULL);
CALL sp_create_retry_process_scenario(11,'PROCESSING',NOW(),'FAILED',2,'ACCEPTED',2,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(12,'PROCESSING',NOW(),'ACCEPTED',2,'FAILED',2,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(13,'PROCESSING',NOW(),'ACCEPTED',2,'ACCEPTED',2,'FAILED',2);
CALL sp_create_retry_process_scenario(14,'PROCESSING',NOW(),'FAILED',2,'FAILED',2,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(15,'PROCESSING',NOW(),'FAILED',2,'ACCEPTED',2,'FAILED',2);
CALL sp_create_retry_process_scenario(16,'PROCESSING',NOW(),'ACCEPTED',2,'FAILED',2,'FAILED',2);
CALL sp_create_retry_process_scenario(17,'PROCESSING',NOW(),'FAILED',2,'FAILED',2,'FAILED',2);
CALL sp_create_retry_process_scenario(18,'PROCESSING',NOW(),'PROCESSING',2,'ACCEPTED',2,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(19,'PROCESSING',NOW(),'ACCEPTED',2,'PROCESSING',2,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(20,'PROCESSING',NOW(),'ACCEPTED',2,'ACCEPTED',2,'PROCESSING',2);
CALL sp_create_retry_process_scenario(21,'PROCESSING',NOW(),'PROCESSING',2,'PROCESSING',2,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(22,'PROCESSING',NOW(),'PROCESSING',2,'ACCEPTED',2,'PROCESSING',2);
CALL sp_create_retry_process_scenario(23,'PROCESSING',NOW(),'ACCEPTED',2,'PROCESSING',2,'PROCESSING',2);
CALL sp_create_retry_process_scenario(24,'PROCESSING',NOW(),'PROCESSING',2,'PROCESSING',2,'PROCESSING',2);
CALL sp_create_retry_process_scenario(25,'PROCESSING',NOW(),'FAILED',9,'ACCEPTED',2,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(26,'PROCESSING',NOW(),'ACCEPTED',2,'FAILED',9,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(27,'PROCESSING',NOW(),'ACCEPTED',2,'ACCEPTED',2,'FAILED',9);
CALL sp_create_retry_process_scenario(28,'PROCESSING',NOW(),'FAILED',9,'FAILED',9,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(29,'PROCESSING',NOW(),'FAILED',9,'ACCEPTED',2,'FAILED',9);
CALL sp_create_retry_process_scenario(30,'PROCESSING',NOW(),'ACCEPTED',2,'FAILED',9,'FAILED',9);
CALL sp_create_retry_process_scenario(31,'PROCESSING',NOW(),'FAILED',9,'FAILED',9,'FAILED',9);
CALL sp_create_retry_process_scenario(32,'ERROR',NOW(),'FAILED',9,'ACCEPTED',2,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(33,'ERROR',NOW(),'ACCEPTED',2,'FAILED',9,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(34,'ERROR',NOW(),'ACCEPTED',2,'ACCEPTED',2,'FAILED',9);
CALL sp_create_retry_process_scenario(35,'ERROR',NOW(),'FAILED',9,'FAILED',9,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(36,'ERROR',NOW(),'FAILED',9,'ACCEPTED',2,'FAILED',9);
CALL sp_create_retry_process_scenario(37,'ERROR',NOW(),'ACCEPTED',2,'FAILED',9,'FAILED',9);
CALL sp_create_retry_process_scenario(38,'ERROR',NOW(),'FAILED',9,'FAILED',9,'FAILED',9);
CALL sp_create_retry_process_scenario(39,'PENDING',NOW(),'FAILED',9,'ACCEPTED',2,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(40,'PENDING',NOW(),'ACCEPTED',2,'FAILED',9,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(41,'PENDING',NOW(),'ACCEPTED',2,'ACCEPTED',2,'FAILED',9);
CALL sp_create_retry_process_scenario(42,'PENDING',NOW(),'FAILED',9,'FAILED',9,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(43,'PENDING',NOW(),'FAILED',9,'ACCEPTED',2,'FAILED',9);
CALL sp_create_retry_process_scenario(44,'PENDING',NOW(),'ACCEPTED',2,'FAILED',9,'FAILED',9);
CALL sp_create_retry_process_scenario(45,'PENDING',NOW(),'FAILED',9,'FAILED',9,'FAILED',9);
CALL sp_create_retry_process_scenario(46,'PROCESSING',NOW(),'PROCESSING',0,'ACCEPTED',2,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(47,'PROCESSING',NOW(),'ACCEPTED',2,'PROCESSING',0,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(48,'PROCESSING',NOW(),'ACCEPTED',2,'ACCEPTED',2,'PROCESSING',0);
CALL sp_create_retry_process_scenario(49,'PROCESSING',NOW(),'PROCESSING',0,'PROCESSING',0,'ACCEPTED',2);
CALL sp_create_retry_process_scenario(50,'PROCESSING',NOW(),'PROCESSING',0,'ACCEPTED',2,'PROCESSING',0);
CALL sp_create_retry_process_scenario(51,'PROCESSING',NOW(),'ACCEPTED',2,'PROCESSING',0,'PROCESSING',0);
CALL sp_create_retry_process_scenario(52,'PROCESSING',NOW(),'PROCESSING',0,'PROCESSING',0,'PROCESSING',0);
CALL sp_create_retry_process_scenario(53,'PROCESSED',NOW() - INTERVAL 30 DAY,'ACCEPTED',2,'ACCEPTED',2,'ACCEPTED',2); -- Delete all UPLOAD_QUEUE records
CALL sp_create_retry_process_scenario(54,'PROCESSING',NOW() - INTERVAL 30 DAY,'ACCEPTED',0,'PROCESSING',0,'PROCESSING',0); -- Don't delete UPLOAD_QUEUE, result still PROCESSING
CALL sp_create_retry_process_scenario(55,'PENDING',NOW(),'ACCEPTED',0,'FAILED',9,NULL,NULL);


-- Errors to retry scenarios
CALL sp_create_retry_process_scenario_without_rsis(65, 'PROCESSING',NOW(),'FAILED', 0,'FAILED', 0);
CALL sp_create_retry_process_scenario_without_rsis(66, 'PROCESSING',NOW(),'FAILED', 0,'PROCESSING', 0);
CALL sp_create_retry_process_scenario_without_rsis(67, 'PROCESSING',NOW(),'FAILED', 0,'ACCEPTED', 0);
CALL sp_create_retry_process_scenario_without_rsis(68, 'PROCESSING',NOW(),'PROCESSING', 0,'FAILED', 0);
CALL sp_create_retry_process_scenario_without_rsis(69, 'PROCESSING',NOW(),'ACCEPTED', 0,'FAILED', 0);
