import { getConciseSearchResultsFromSearchQuery } from '../query-builder';
import { queryParameter } from './query-builder.spec.data';

describe('QueryBuilder', () => {
  describe('getConciseSearchResultsFromSearchQuery', () => {
    it('should build a valid SELECT statement', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toMatch(/SELECT test_result FROM TEST_RESULT/);
    });
    it('should order the results by Desc', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toMatch(/ORDER BY test_date DESC/);
    });
    it('should limit the results by 200', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toMatch(/LIMIT 200/);
    });
    it('should have the correct staffNumber in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toMatch(new RegExp(queryParameter.staffNumber, 'g'));
    });
    it('should have the correct driverNumber in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toMatch(new RegExp(queryParameter.driverNumber, 'g'));
    });
    it('should have the correct startDate in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toMatch(new RegExp(queryParameter.startDate, 'g'));
    });
    it('should have the correct endDate in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toMatch(new RegExp(queryParameter.endDate, 'g'));
    });
    it('should have the correct applicationReference in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toMatch(new RegExp(queryParameter.applicationReference.toString(), 'g'));
    });
    it('should have the correct DTCCode in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toMatch(new RegExp(queryParameter.dtcCode, 'g'));
    });
  });
});
