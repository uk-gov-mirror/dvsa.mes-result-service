import { CatBUniqueTypes } from '@dvsa/mes-test-schema/categories/B';
import { gunzipSync } from 'zlib';
import { TestResultDecompressionError } from '../domain/errors/test-result-decompression-error';

export const decompressTestResult = (compressedTestResult: string): CatBUniqueTypes.TestResult => {
  try {
    const decodedBuffer = Buffer.from(compressedTestResult, 'base64');
    const unzippedJson = gunzipSync(decodedBuffer).toString();
    return JSON.parse(unzippedJson) as CatBUniqueTypes.TestResult;
  } catch (err) {
    throw new TestResultDecompressionError();
  }
};
