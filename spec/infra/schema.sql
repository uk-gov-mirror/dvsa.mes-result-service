CREATE TABLE RESULT_STATUS (
  id TINYINT PRIMARY KEY,
  result_status_name VARCHAR(10) NOT NULL
);
INSERT INTO RESULT_STATUS (id, result_status_name) VALUES
  (0,'ACCEPTED'),
  (1,'PROCESSING'),
  (2,'PROCESSED'),
  (3,'PENDING'),
  (4,'ERROR');
CREATE TABLE PROCESSING_STATUS (
  id TINYINT PRIMARY KEY,
  processing_status_name VARCHAR(10) NOT NULL
);
INSERT INTO PROCESSING_STATUS (id,processing_status_name) VALUES
  (0,'PROCESSING'),
  (1,'ACCEPTED'),
  (2,'FAILED');

CREATE TABLE INTERFACE_TYPE (
  id TINYINT PRIMARY KEY,
  interface_type_name VARCHAR(6)
);
INSERT INTO INTERFACE_TYPE(id, interface_type_name) VALUES
  (0, 'TARS'),
  (1, 'NOTIFY'),
  (2, 'RSIS');

CREATE TABLE TEST_RESULT (
  application_reference BIGINT NOT NULL,
  staff_number VARCHAR(10) NOT NULL,
  test_result JSON NOT NULL,
  test_date DATE NOT NULL,
  tc_id BIGINT NOT NULL,
  tc_cc VARCHAR(6) NOT NULL,
  driver_number VARCHAR(24) NOT NULL,
  driver_surname VARCHAR(50) NOT NULL,
  result_status TINYINT NOT NULL,
  PRIMARY KEY (application_reference,staff_number),
  FOREIGN KEY (result_status) REFERENCES RESULT_STATUS(id)
);
INSERT INTO TEST_RESULT VALUES
  (1,'1234','{}',CURRENT_DATE,1,2,'11111','Pearson',1),
  (2,'1234','{}',CURRENT_DATE,1,2,'11111','Pearson',1),
  (3,'1234','{}',CURRENT_DATE,1,2,'11111','Pearson',1),
  (4,'1234','{}',CURRENT_DATE,1,2,'11111','Pearson',3),
  (5,'1234','{}',CURRENT_DATE - INTERVAL 35 DAY,1,2,'11111','Pearson',0),
  (6,'1234','{}',CURRENT_DATE,1,2,'11111','Pearson',1);
CREATE INDEX staff_number ON TEST_RESULT(staff_number);
CREATE INDEX tc_cc ON TEST_RESULT(tc_cc);
CREATE INDEX driver_number ON TEST_RESULT(driver_number);
CREATE INDEX test_date ON TEST_RESULT(test_date);

CREATE TABLE UPLOAD_QUEUE (
  application_reference BIGINT NOT NULL,
  staff_number VARCHAR(10) NOT NULL,
  timestamp DATETIME NOT NULL,
  interface TINYINT NOT NULL,
  upload_status TINYINT NOT NULL,
  retry_count INT NOT NULL,
  error_message VARCHAR(1000),
  PRIMARY KEY (application_reference,staff_number,interface),
  FOREIGN KEY (interface) REFERENCES INTERFACE_TYPE(id),
  FOREIGN KEY (upload_status) REFERENCES PROCESSING_STATUS(id)
);
INSERT INTO UPLOAD_QUEUE VALUES
  (1,'1234',NOW(),0,1,0,''),
  (1,'1234',NOW(),1,1,0,''),
  (1,'1234',NOW(),2,1,0,'');
INSERT INTO UPLOAD_QUEUE VALUES
  (6,'1234',NOW(),0,1,0,''),
  (6,'1234',NOW(),1,1,0,'');
INSERT INTO UPLOAD_QUEUE VALUES
  (2,'1234',NOW(),0,2,1,''),
  (2,'1234',NOW(),1,2,0,''),
  (2,'1234',NOW(),2,2,0,'');
INSERT INTO UPLOAD_QUEUE VALUES
  (3,'1234',NOW(),0,2,10,''),
  (3,'1234',NOW(),1,2,10,''),
  (3,'1234',NOW(),2,2,10,'');
INSERT INTO UPLOAD_QUEUE VALUES
  (4,'1234',NOW(),0,2,1,''),
  (4,'1234',NOW(),1,2,10,''),
  (4,'1234',NOW(),2,2,10,'');
INSERT INTO UPLOAD_QUEUE VALUES
  (5,'1234',NOW() - INTERVAL 35 DAY,0,1,1,''),
  (5,'1234',NOW() - INTERVAL 35 DAY,1,1,10,''),
  (5,'1234',NOW() - INTERVAL 35 DAY,2,1,10,'');