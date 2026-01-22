import { APIGatewayEvent } from 'aws-lambda';
import { createResponse } from '@dvsa/mes-microservice-common/application/api/create-response';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';
import { InterfaceTypes } from '../domain/interface-types';
import { gzipSync } from 'zlib';
import * as joi from 'joi';
import { getNextUploadBatch } from '../application/next-update-batch-service';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { bootstrapLogging, customMetric, error } from '@dvsa/mes-microservice-common/application/utils/logger';

export async function handler(event: APIGatewayEvent) {

  bootstrapLogging('get-next-upload-batch', event);

  let nextBatchData: string[];
  const interfaceType = convertToInterfaceType(event.queryStringParameters.interface);
  const batchSize = Number(event.queryStringParameters.batch_size);

  customMetric('UploadBatchSize', 'Number of test records selected for uploading', batchSize);

  // Joi schema to handle validation of queryStringParameters
  const batchSizeSchema = joi.object().keys({
    interfaceTypeParam: joi.string().valid('TARS', 'RSIS', 'NOTIFY', 'DSP', 'MI').required(),
    batchSizeParam: joi.number().positive().required(),
  });

  const validationResult = batchSizeSchema.validate({
    interfaceTypeParam: interfaceType.toString(),
    batchSizeParam: batchSize,
  });

  if (validationResult.error) {
    error('Validation error', validationResult.error);
    return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
  }

  try {
    await bootstrapConfig();
    const response = await getNextUploadBatch(batchSize, interfaceType);
    nextBatchData = [
      ...response.map(((row) => {
        return gzipSync(JSON.stringify(row.test_result)).toString('base64');
      })),
    ];
    return createResponse(nextBatchData, HttpStatus.CREATED);
  } catch (err) {
    error(`ERROR - ${err.message} - `, enrichError(err, interfaceType, batchSize));
    return createResponse(
      { message: `Error trying retrieve a batch of ${batchSize} results for ${interfaceType}` },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export function convertToInterfaceType(interfaceType: string) {
  switch (interfaceType.toLowerCase()) {
  case 'tars': return InterfaceTypes.TARS;
  case 'rsis': return InterfaceTypes.RSIS;
  case 'notify': return InterfaceTypes.NOTIFY;
  case 'dsp': return InterfaceTypes.DSP;
  case 'mi': return InterfaceTypes.MI;
  default: return InterfaceTypes.NO_MATCH_FOUND;
  }
}

function enrichError(err: any, interfaceType: InterfaceTypes, batchSize: number) {
  return {
    ...err,
    interfaceType,
    batchSize,
  };
}
