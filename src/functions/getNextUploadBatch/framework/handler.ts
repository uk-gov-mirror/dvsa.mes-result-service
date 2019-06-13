import { APIGatewayEvent, Context } from 'aws-lambda';
import { getNextUploadBatch } from '../application/next-update-batch-service';
import createResponse from '../../../common/application/utils/createResponse';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import Response from '../../../common/application/api/Response';
import { InterfaceTypes } from '../domain/interface-types';
import { gzipSync } from 'zlib';
import joi from '@hapi/joi';
import { bootstrapConfig } from '../../../common/framework/config/config';

export async function handler(event: APIGatewayEvent, fnCtx: Context): Promise<Response> {
  let nextBatchData;
  const interfaceType = convertToInterfaceType(event.queryStringParameters.interface);
  const batchSize = Number(event.queryStringParameters.batch_size);

  // Joi schema to handle validation of queryStringParameters
  const batchSizeSchema = joi.object().keys({
    interfaceTypeParam: joi.string().valid('TARS', 'RSIS', 'NOTIFY').required(),
    batchSizeParam: joi.number().positive().required(),
  });

  const validationResult =
  joi.validate({ interfaceTypeParam: interfaceType.toString(), batchSizeParam: batchSize }, batchSizeSchema);

  if (validationResult.error) {
    return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
  }

  await bootstrapConfig();
  const batchPromise = getNextUploadBatch(batchSize, interfaceType);
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
