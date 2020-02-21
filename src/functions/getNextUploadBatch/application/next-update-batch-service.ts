import { BatchRepository } from '../framework/repositories/batch-repository';
import { TestResultRecord } from '../../../common/domain/test-results';

export const getNextUploadBatch = async (batchSize: number, interfaceType: string):
Promise<TestResultRecord[]> => {
  return await new BatchRepository().getUploadQueueData(batchSize, interfaceType);
};
