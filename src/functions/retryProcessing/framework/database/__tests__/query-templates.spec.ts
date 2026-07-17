import { manualInterventionUploadQueueReplacementQuery } from '../query-templates';

describe('QueryTemplates', () => {
  describe('manualInterventionUploadQueueReplacementQuery', () => {
    it('should select legacy interfaces for non-DSP tests', () => {
      expect(manualInterventionUploadQueueReplacementQuery).toContain('tr.booking_reference IS NULL');
      expect(manualInterventionUploadQueueReplacementQuery)
        .toContain('it.interface_type_name IN (\'TARS\', \'NOTIFY\')');
      expect(manualInterventionUploadQueueReplacementQuery)
        .toContain('tr.autosave = false AND it.interface_type_name = \'RSIS\'');
    });

    it('should select DSP interfaces for tests with a booking reference', () => {
      expect(manualInterventionUploadQueueReplacementQuery).toContain('tr.booking_reference IS NOT NULL');
      expect(manualInterventionUploadQueueReplacementQuery)
        .toContain('it.interface_type_name IN (\'DSP\', \'NOTIFY\')');
      expect(manualInterventionUploadQueueReplacementQuery)
        .toContain('tr.autosave = false AND it.interface_type_name = \'MI\'');
    });

    it('should not create replacement records by cross-joining all interface types', () => {
      expect(manualInterventionUploadQueueReplacementQuery).not.toContain('FROM TEST_RESULT tr, INTERFACE_TYPE it');
    });
  });
});
