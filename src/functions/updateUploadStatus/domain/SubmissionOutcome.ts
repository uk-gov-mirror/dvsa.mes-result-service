import { ProcessingStatus } from '../../../common/domain/processing-status';
import { IntegrationType } from '../../postResult/domain/result-integration';

export interface SubmissionOutcome {
  staff_number: string;
  interface: IntegrationType;
  state: ProcessingStatus;
  retry_count: number;
  error_message: string | null;
}
