import { buildGetRegeneratedEmailQuery } from '../query-builder';
import { applicationReference } from './query-builder.spec.data';

describe('QueryBuilder', () => {
  describe('buildGetRegeneratedEmailQuery', () => {
    it('should build a valid SELECT statement', () => {
      const result = buildGetRegeneratedEmailQuery(applicationReference.toString());
      expect(result).toContain('SELECT application_reference as appRef,');
      expect(result).toContain('JSON_ARRAYAGG(');
      expect(result).toContain('JSON_OBJECT(');
      expect(result).toContain('\'newEmail\', new_email,');
      expect(result).toContain('\'regeneratedDate\', regenerated_date,');
      expect(result).toContain('\'newLanguage\', new_language');
      expect(result).toContain(') as emailRegenerationDetails');
      expect(result).toContain('FROM AUDIT_EMAIL_REGEN where application_reference');
    });
    it('should have the correct applicationReference in the SELECT', () => {
      const result = buildGetRegeneratedEmailQuery(applicationReference.toString());
      expect(result).toMatch(new RegExp(applicationReference.toString(), 'g'));
    });
  });
});
