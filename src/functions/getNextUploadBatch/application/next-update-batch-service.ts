import { BatchRepository } from '../framework/repositories/batch-repository';
import { TestResultRecord } from '../../../common/domain/test-results';

export const getNextUploadBatch = async (batchSize: number, interfaceType: string):
Promise<TestResultRecord[]> => {
  let batch;
  try {
    batch = await new BatchRepository().getUploadQueueData(batchSize, interfaceType);
  } catch (err) {
    console.error(`An error occured when attempting to retrieve a batch: ${err}`);
  }
  return batch;
};
