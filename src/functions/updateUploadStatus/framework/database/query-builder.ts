import { IntegrationType } from '../../../postResult/domain/result-integration';
import * as mysql from 'mysql2';
import { ProcessingStatus  } from '../../../../common/domain/processing-status';

export const updateUploadStatus = (appReference: number, body: any): string => {
  const uploadStatus: ProcessingStatus = body.state;
  const retryCount: number = body.retry_count;
  const errorMessage: string | null = body.error_message;
  const applicationReference: number = appReference;
  const staffNumber: string = body.staff_number;
  const uploadInterface: IntegrationType = body.interface;

  const template = `
  UPDATE UPLOAD_QUEUE
  SET upload_status = (SELECT id FROM PROCESSING_STATUS WHERE processing_status_name = ?),
      retry_count = retry_count + ?,
      error_message = ?
  WHERE application_reference = ?
  AND staff_number = ?
  AND interface = (SELECT id FROM INTERFACE_TYPE WHERE interface_type_name = ?)`;

  const args = [
    uploadStatus,
    retryCount,
    errorMessage,
    applicationReference,
    staffNumber,
    uploadInterface,
  ];

  return mysql.format(template, args);
};
