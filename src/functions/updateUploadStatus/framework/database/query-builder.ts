import { IntegrationType } from '../../../postResult/domain/result-integration';
import * as mysql from 'mysql2';
import { ProcessingStatus } from '../../../../functions/postResult/domain/processing-status';

export const updateUploadStatus = (appReference: string, body: any): string => {

  let uploadStatus: ProcessingStatus;
  let retryCount: number;
  let errorMessage: string | null;
  let applicationReference: string;
  let staffNumber: string;
  let uploadInterface: IntegrationType;

  const template = `
    UPDATE UPLOAD_QUEUE (
        SET upload_status = ?,
            retry_count = retry_count + ?,
            error_message = ?
        WHERE
            application_reference = ?
            AND staff_number = ?
            AND interface = ?
    )`;

  uploadStatus = body.upload_status;
  retryCount = body.retry_count;
  errorMessage = body.error_message;
  applicationReference = appReference;
  staffNumber = body.staff_number;
  uploadInterface = body.interface;

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
