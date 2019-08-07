import { buildTestResultInsert } from '../query-builder';
import { dummyTestResult } from './query-builder.spec.data';

describe('QueryBuilder', () => {
  describe('buildTestResultInsert', () => {
    it('should build a valid INSERT query', () => {
      const result = buildTestResultInsert(dummyTestResult, false);
      expect(result).toMatch(/INSERT INTO TEST_RESULT/);
    });
    it('should have the correct date as UTC in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false);
      expect(result).toMatch(/2019-06-05 11:38:00.000/);
    });
    it('should have the staff number in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false);
      expect(result).toMatch(/'999'/);
    });
    it('should have the test centre ID in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false);
      expect(result).toMatch(/\b54321\b/);
    });
    it('should have the driver number in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false);
      expect(result).toMatch(/CAMPB805220A89HC/);
    });
    it('should have the driver surname in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false);
      expect(result).toMatch(/Campbell/);
    });
    it('should have processing status as the last argument in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false);
      console.log(result);
      expect(result).toMatch(/0\)/);
    });
  });
});
