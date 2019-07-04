import { buildGetResultQuery } from '../query-builder';
import { applicationReference } from './query-builder.spec.data';

describe('QueryBuilder', () => {
  describe('buildGetResultQuery', () => {
    it('should build a valid SELECT statement', () => {
      const result = buildGetResultQuery(applicationReference);
      expect(result).toMatch(/SELECT TEST_RESULT.test_result/);
      expect(result).toMatch(/FROM TEST_RESULT/);
    });
    it('should have the correct applicationReference in the SELECT', () => {
      const result = buildGetResultQuery(applicationReference);
      expect(result).toMatch(new RegExp(applicationReference, 'g'));
    });
  });
});
