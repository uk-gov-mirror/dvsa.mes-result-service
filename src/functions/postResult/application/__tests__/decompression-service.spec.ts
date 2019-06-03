import { decompressTestResult } from '../decompression-service';
import { decompressionServiceTestData } from './data/decompression-service.spec.data';
import { TestResultDecompressionError } from '../../domain/errors/test-result-decompression-error';

describe('DecompressionService', () => {
  describe('decompressTestResult', () => {
    it('should successfully decompress base64 encoded GZIP compressed tests', () => {
      const { test1 } = decompressionServiceTestData;
      const result = decompressTestResult(test1.compressed);
      expect(result.journalData.candidate.candidateId).toBe(test1.uncompressed.journalData.candidate.candidateId);
      expect(result.testSummary.candidateDescription).toBe(test1.uncompressed.testSummary.candidateDescription);
    });
    it('should throw a TestResultDecompressionError for a non-gzip string', () => {
      const { nonGzip } = decompressionServiceTestData;
      try {
        decompressTestResult(nonGzip.compressed);
      } catch (err) {
        expect(err instanceof TestResultDecompressionError).toBeTruthy();
        return;
      }
      fail();
    });
    it('should throw a TestResultDecompressionError for a gzip string that doesnt encode a JSON object', () => {
      const { gzipNotJson } = decompressionServiceTestData;
      try {
        decompressTestResult(gzipNotJson.compressed);
      } catch (err) {
        expect(err instanceof TestResultDecompressionError).toBeTruthy();
        return;
      }
      fail();
    });
  });
});
