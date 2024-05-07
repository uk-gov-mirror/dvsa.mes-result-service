import { getConciseSearchResultsFromSearchQuery } from '../query-builder';
import { queryParameter, queryParameterRekey } from './query-builder.spec.data';
import { QueryParameters } from '../../../domain/query_parameters';

describe('QueryBuilder', () => {
  describe('getConciseSearchResultsFromSearchQuery', () => {
    it('should build a valid SELECT statement', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter as QueryParameters);
      expect(result).toMatch(/SELECT test_result, autosave FROM TEST_RESULT/);
    });
    it('should order the results by Desc', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter as QueryParameters);
      expect(result).toMatch(/ORDER BY test_date DESC/);
    });
    it('should limit the results by 200', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter as QueryParameters);
      expect(result).toMatch(/LIMIT 200/);
    });
    it('should have the correct staffNumber in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameter.staffNumber, 'g'));
    });
    it('should have the correct driverNumber in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameter.driverNumber, 'g'));
    });
    it('should have the correct startDate in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameter.startDate, 'g'));
    });
    it('should have the correct endDate in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameter.endDate, 'g'));
    });
    it('should have the correct applicationReference in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameter.applicationReference.toString(), 'g'));
    });
    it('should have the correct DTCCode in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter as QueryParameters);
      expect(result).toMatch(new RegExp(queryParameter.dtcCode, 'g'));
    });
    it('should have the correct activityCode in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toMatch(new RegExp(queryParameter.activityCode, 'g'));
    });
    it('should have the correct category in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toMatch(new RegExp(queryParameter.category, 'g'));
    });

    it('should have the correct passCertificateNumber in the SELECT', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameter);
      expect(result).toMatch(new RegExp(queryParameter.passCertificateNumber, 'g'));
    });

    it('should change query to a sub query when rekey is provided', () => {
      const result = getConciseSearchResultsFromSearchQuery(queryParameterRekey);
      expect(result).toContain('SELECT TR.test_result, TR.autosave from (SELECT * FROM TEST_RESULT WHERE');
      expect(result).toContain('WHERE JSON_EXTRACT(TR.test_result, "$.rekey") = true');
    });
  });
});
