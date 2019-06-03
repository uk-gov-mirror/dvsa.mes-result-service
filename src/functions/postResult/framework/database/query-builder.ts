import { StandardCarTestCATBSchema, ApplicationReference } from '@dvsa/mes-test-schema/categories/B';
import { ResultStatus } from '../../domain/result-status';
import * as mysql from 'mysql2';
import { IntegrationType } from '../../domain/result-integration';
import { ProcessingStatus } from '../../domain/processing-status';

export const buildTestResultInsert = (test: StandardCarTestCATBSchema): string => {
  const template = `
  INSERT INTO TEST_RESULT (
    application_reference,
    staff_number,
    test_result,
    test_date,
    tc_id,
    driver_number,
    driver_surname,
    result_status
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const { journalData } = test;
  const applicationReference = formatApplicationReference(journalData.applicationReference);
  const { staffNumber } = journalData.examiner;
  const testResult = JSON.stringify(test);
  const testDate = Date.parse(journalData.testSlotAttributes.start);
  const testCentreId = journalData.testCentre.centreId;
  const { driverNumber } = journalData.candidate;
  const driverSurname = journalData.candidate.candidateName.lastName;

  const args = [
    applicationReference,
    staffNumber,
    testResult,
    testDate,
    testCentreId,
    driverNumber,
    driverSurname,
    ResultStatus.ACCEPTED,
  ];

  return mysql.format(template, args);
};

export const buildUploadQueueInsert = (test: StandardCarTestCATBSchema, integration: IntegrationType): string => {
  const template = `
    INSERT INTO UPLOAD_QUEUE (
      application_reference,
      staff_number,
      timestamp,
      interface,
      upload_status,
      retry_count
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
  const applicationReference = formatApplicationReference(test.journalData.applicationReference);
  const { staffNumber } = test.journalData.examiner;
  const timestamp = new Date();
  const retryCount = 0;

  const args = [
    applicationReference,
    staffNumber,
    timestamp,
    integration,
    ProcessingStatus.ACCEPTED,
    retryCount,
  ];
  return mysql.format(template, args);
};

const formatApplicationReference = (appRef: ApplicationReference) => {
  return `${appRef.applicationId}${appRef.bookingSequence}${appRef.checkDigit}`;
};
