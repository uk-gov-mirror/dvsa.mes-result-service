import { APIGatewayEvent } from 'aws-lambda';

import { bootstrapConfig } from '../../../common/framework/config/config';
import { createResponse } from '@dvsa/mes-microservice-common/application/api/create-response';
import { getRegeneratedEmails } from './repositories/get-regenerated-emails-repository';
import { HttpStatus } from '@dvsa/mes-microservice-common/application/api/http-status';
import * as joi from 'joi';
import { gzipSync } from 'zlib';
import { RegeneratedEmailsRecord } from '../../../common/domain/regenerated-emails';
import { bootstrapLogging, info, error } from '@dvsa/mes-microservice-common/application/utils/logger';
import { getAppRefFromPathParameters } from '../../../common/application/utils/getPathParms';

export async function handler(event: APIGatewayEvent) {
  try {
    bootstrapLogging('regenerated-emails-service', event);

    await bootstrapConfig();

    const appRefPathParam = getAppRefFromPathParameters(event);

    const parametersSchema = joi.string().max(12);
    const validationResult = parametersSchema.validate(appRefPathParam);

    if (validationResult.error) {
      error(`Invalid application reference provided ${appRefPathParam}`);
      return createResponse(validationResult.error, HttpStatus.BAD_REQUEST);
    }

    info(`Searching for regenerated emails for application reference: ${appRefPathParam}`);
    const [result]: RegeneratedEmailsRecord[] = await getRegeneratedEmails(appRefPathParam);

    if (result.appRef === null) {
      info(`No regenerated emails found for app ref: ${appRefPathParam}`);
      return createResponse('No records found matching criteria', HttpStatus.NOT_FOUND);
    }

    const compressedPayload = gzipSync(JSON.stringify(result)).toString('base64');
    info(`Found ${result?.emailRegenerationDetails?.length} record(s) for app ref: ${appRefPathParam}`);
    return createResponse(compressedPayload, HttpStatus.OK);
  } catch (err) {
    error('Something went wrong', err);
    return createResponse(err, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
