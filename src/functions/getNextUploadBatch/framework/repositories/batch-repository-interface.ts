import { TestResultRecord } from '../../../../common/domain/test-results';

export interface IBatchRepository {
  getUploadQueueData(batchSize: number, interfaceType: string): Promise<TestResultRecord[]>;
}
