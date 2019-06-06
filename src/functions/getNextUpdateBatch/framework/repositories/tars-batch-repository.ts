import { BatchRepository } from './batch-repository';

export class TarsBatchRepository implements BatchRepository {
  getUploadQueueData = async (batchSize: number): Promise<[]> => {
    return [];
  }
}
