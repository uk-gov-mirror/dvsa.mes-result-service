import { applicationReferences, staffNumber } from './query-builder.spec.data';
import { multipleTestResultsQuery } from '../query-builder';

describe('QueryBuilder', () => {
  describe('multipleTestResultsQuery', () => {

    it('should build a valid SELECT statement', () => {
      const result = multipleTestResultsQuery(staffNumber, applicationReferences);
      expect(result).toMatch(/SELECT TR.test_result/);
      expect(result).toMatch(/FROM TEST_RESULT TR/);
    });

    it('should have the correct staffNumber in the SELECT', () => {
      const result = multipleTestResultsQuery(staffNumber, applicationReferences);
      expect(result).toMatch(new RegExp(staffNumber.toString(), 'g'));
    });

    it('should have the correct applicationReferences in the SELECT', () => {
      const result = multipleTestResultsQuery(staffNumber, applicationReferences);
      const expectedReferences = `('${applicationReferences.join('\', \'')}')`;
      expect(result).toContain(expectedReferences);
    });

    it('should return a query with no applicationReferences when provided an empty array', () => {
      const result = multipleTestResultsQuery(staffNumber, []);
      expect(result).toMatch(/AND application_reference in \(\)/);
    });
  });
});
