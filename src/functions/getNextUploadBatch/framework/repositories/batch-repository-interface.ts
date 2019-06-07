import { TestResultRecord } from '../../domain/test-results';

export interface IBatchRepository {
  getUploadQueueData(batchSize: number, interfaceType: string): Promise<TestResultRecord[]>;
}
