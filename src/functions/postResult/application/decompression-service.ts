import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';
import { gunzipSync } from 'zlib';
import { TestResultDecompressionError } from '../domain/errors/test-result-decompression-error';

export const decompressTestResult = (compressedTestResult: string): TestResultSchemasUnion => {
  try {
    const decodedBuffer = Buffer.from(compressedTestResult, 'base64');
    const unzippedJson = gunzipSync(decodedBuffer).toString();
    return JSON.parse(unzippedJson) as TestResultSchemasUnion;
  } catch (err) {
    throw new TestResultDecompressionError();
  }
};
