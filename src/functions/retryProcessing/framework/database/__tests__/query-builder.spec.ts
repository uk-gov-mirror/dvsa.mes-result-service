import {
  buildUpdateErrorsToRetryQuery,
  buildAbortTestsExceeingRetryQuery,
  buildDeleteAcceptedQueueRowsQuery,
  buildSelectTestsExceedingRetryQuery,
} from '../query-builder';

describe('QueryBuilder', () => {

  describe('buildErrorsToRetryQuery', () => {
    it('should have the retry count in the SELECT', () => {
      const result = buildUpdateErrorsToRetryQuery(9, 9, 9);
      expect(result).toMatch(/AND uq.retry_count < 9/);
    });
    it('should have the interface types in the SELECT', () => {
      const result = buildUpdateErrorsToRetryQuery(9, 9, 9);
      expect(result).toMatch(/WHERE interface_type_name = 'RSIS'/);
      expect(result).toMatch(/WHERE interface_type_name = 'NOTIFY'/);
      expect(result).toMatch(/WHERE interface_type_name = 'TARS'/);
    });
  });

  describe('buildErrorsToAbortQuery', () => {
    it('should have the retry count in the SELECT', () => {
      const result = buildAbortTestsExceeingRetryQuery(9, 9, 9);
      expect(result).toMatch(/AND uq.retry_count >= 9/);
    });
    it('should have the interface type in the SELECT', () => {
      const result = buildAbortTestsExceeingRetryQuery(9, 9, 9);
      expect(result).toMatch(/WHERE interface_type_name = 'RSIS'/);
      expect(result).toMatch(/WHERE interface_type_name = 'NOTIFY'/);
      expect(result).toMatch(/WHERE interface_type_name = 'TARS'/);
    });
  });

  describe('buildQueueRowsToDeleteQuery', () => {
    it('should build a valid SELECT query', () => {
      const result = buildDeleteAcceptedQueueRowsQuery(30);
      expect(result).toMatch(/SELECT application_reference, staff_number, interface/);
    });
    it('should have the cutoffpoint in the SELECT', () => {
      const result = buildDeleteAcceptedQueueRowsQuery(30);
      // /AND u.timestamp < \'(9999-99-99 99:99:99`')/
      expect(result).toMatch(/AND timestamp < \'\d\d\d\d\-\d\d\-\d\d/);
    });
  });

  describe('buildSelectTestsExceedingRetryQuery', () => {
    it('should have the retry count in the SELECT', () => {
      const result = buildSelectTestsExceedingRetryQuery(9, 9, 9);
      expect(result).toMatch(/AND uq.retry_count >= 9/);
    });
    it('should have the interface type in the SELECT', () => {
      const result = buildSelectTestsExceedingRetryQuery(9, 9, 9);
      expect(result).toMatch(/WHERE interface_type_name = 'RSIS'/);
      expect(result).toMatch(/WHERE interface_type_name = 'NOTIFY'/);
      expect(result).toMatch(/WHERE interface_type_name = 'TARS'/);
    });
  });

});
