import { APIGatewayEvent, Context } from 'aws-lambda';
import { getNextUploadBatch } from '../application/next-update-batch-service';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import Response from '../../../common/application/api/Response';
import { InterfaceTypes } from '../domain/interface-types';
import { BatchRequestParamaterErrors } from '../domain/batch-request-param-errors';
import { gzipSync } from 'zlib';

export async function handler(event: APIGatewayEvent, fnCtx: Context): Promise<Response> {
  let nextBatchData;
  const interfaceType = convertToInterfaceType(event.queryStringParameters.interface);
  const batchSize = event.queryStringParameters.batch_size;
  const validationResponse = validateQueryParameters(interfaceType, batchSize);

  if (validationResponse !== undefined) {
    return createResponse(validationResponse, HttpStatus.BAD_REQUEST);
  }

  const batchPromise = getNextUploadBatch(+batchSize, interfaceType);
  await batchPromise.then((response) => {
    // compress response
    nextBatchData = gzipSync(JSON.stringify(response)).toString('base64');
  }).catch((err) => {
    console.error(err);
  });

  return createResponse(nextBatchData, HttpStatus.CREATED);
}

export function convertToInterfaceType(interfaceType: string) {
  switch (interfaceType.toLowerCase()) {
    case 'tars': return InterfaceTypes.TARS;
    case 'rsis': return InterfaceTypes.RSIS;
    case 'notify': return InterfaceTypes.NOTIFY;
    default: return InterfaceTypes.NO_MATCH_FOUND;
  }
}

export function validateQueryParameters(interfaceType: any, batchSize: any): BatchRequestParamaterErrors | null {
  if ((interfaceType === null || undefined) || (batchSize === null || undefined)) {
    return BatchRequestParamaterErrors.PARAM_NOT_PROVIDED;
  }
  if (interfaceType === InterfaceTypes.NO_MATCH_FOUND) {
    return BatchRequestParamaterErrors.INTERFACE_NOT_FOUND;
  }
  if (isNaN(batchSize)) {
    return BatchRequestParamaterErrors.BATCH_SIZE_NOT_NUMERIC;
  }
  if (!isNaN(batchSize) && batchSize <= 0) {
    return BatchRequestParamaterErrors.BATCH_SIZE_NOT_VALID;
  }
}
