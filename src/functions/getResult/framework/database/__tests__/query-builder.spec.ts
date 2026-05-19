import { buildGetResultQuery } from '../query-builder';
import {
  applicationReference,
  bookingReferenceUnformatted,
  bookingReferenceFormatted,
  bookingReferenceAlreadyFormatted,
} from './query-builder.spec.data';

describe('QueryBuilder', () => {
  describe('buildGetResultQuery', () => {

    describe('given an application reference', () => {
      it('should build a valid SELECT statement', () => {
        const result = buildGetResultQuery(applicationReference);
        expect(result).toContain('SELECT TR.test_result');
        expect(result).toContain('FROM TEST_RESULT TR');
      });

      it('should query by application_reference', () => {
        const result = buildGetResultQuery(applicationReference);
        expect(result).toContain('WHERE TR.application_reference =');
      });

      it('should not query by booking_reference', () => {
        const result = buildGetResultQuery(applicationReference);
        expect(result).not.toContain('booking_reference');
      });

      it('should include the application reference value in the query', () => {
        const result = buildGetResultQuery(applicationReference);
        expect(result).toContain(applicationReference);
      });
    });

    describe('given an unformatted booking reference', () => {
      it('should build a valid SELECT statement', () => {
        const result = buildGetResultQuery(bookingReferenceUnformatted);
        expect(result).toContain('SELECT TR.test_result');
        expect(result).toContain('FROM TEST_RESULT TR');
      });

      it('should query by booking_reference', () => {
        const result = buildGetResultQuery(bookingReferenceUnformatted);
        expect(result).toContain('WHERE TR.booking_reference =');
      });

      it('should not query by application_reference', () => {
        const result = buildGetResultQuery(bookingReferenceUnformatted);
        expect(result).not.toContain('application_reference');
      });

      it('should format the booking reference with spaces', () => {
        const result = buildGetResultQuery(bookingReferenceUnformatted);
        expect(result).toContain(bookingReferenceFormatted);
      });
    });

    describe('given an already formatted booking reference', () => {
      it('should query by booking_reference', () => {
        const result = buildGetResultQuery(bookingReferenceAlreadyFormatted);
        expect(result).toContain('WHERE TR.booking_reference =');
      });

      it('should preserve the existing spacing', () => {
        const result = buildGetResultQuery(bookingReferenceAlreadyFormatted);
        expect(result).toContain(bookingReferenceAlreadyFormatted);
      });
    });

  });
});
