export interface BatchRepository {
  getUploadQueueData(batchSize: number, interfaceType: string): Promise<[]>;
}
