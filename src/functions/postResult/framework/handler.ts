import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import createResponse from '../../../common/application/utils/createResponse';
import Response from '../../../common/application/api/Response';
import { HttpStatus } from '../../../common/application/api/HttpStatus';
import { decompressTestResult } from '../application/decompression-service';
import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';
import { saveTestResult } from '../application/save-result-service';
import { TestResultDecompressionError } from '../domain/errors/test-result-decompression-error';
import { bootstrapConfig } from '../../../common/framework/config/config';
import { validateMESJoiSchema } from '../domain/mes-joi-schema-service';

export async function handler(event: APIGatewayProxyEvent, fnCtx: Context): Promise<Response> {
  await bootstrapConfig();
  console.log(`Invoked with body ${event.body}`);
  const { body } = event;
  const hasValidationError: boolean = true;

  if (isNullOrBlank(body)) {
    return createResponse({}, HttpStatus.BAD_REQUEST);
  }

  try {
    const testResult: StandardCarTestCATBSchema = decompressTestResult(body as string);
    const validationResult = validateMESJoiSchema(testResult);

    if (validationResult.error) {
      // Validation error thrown with no action possible by examiner - save results in error state - return HTTP 500
      console.error(`Could not validate the test result body ${validationResult.error}`);
      await saveTestResult(testResult, hasValidationError);
      return createResponse({ message: 'Test result body could not be validated' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await saveTestResult(testResult);
  } catch (err) {
    if (err instanceof TestResultDecompressionError) {
      console.error(`Could not decompress test result body ${body}`);
      return createResponse({ message: 'The test result body could not be decompressed' }, HttpStatus.BAD_REQUEST);
    }
    console.error(err);
    return createResponse({}, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  return createResponse({}, HttpStatus.CREATED);
}

const isNullOrBlank = (body: string | null): boolean => {
  return body === null || body.trim().length === 0;
};
