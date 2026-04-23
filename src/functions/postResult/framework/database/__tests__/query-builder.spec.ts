import {buildTestResultInsert, buildUploadQueueInsert} from '../query-builder';
import {dummyTestResult, dummyTestResultDSP} from './query-builder.spec.data';
import {IntegrationType} from '../../../domain/result-integration';

describe('QueryBuilder', () => {
  describe('buildTestResultInsert', () => {
    it('should build a valid INSERT query', () => {
      const result = buildTestResultInsert(dummyTestResult, false, false);
      expect(result).toMatch(/INSERT INTO TEST_RESULT/);
    });
    it('should have the correct date as UTC in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false, false);
      expect(result).toMatch(/2019-06-05 11:38:00.000/);
    });
    it('should have the staff number in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false, false);
      expect(result).toMatch(/'999'/);
    });
    it('should have the test centre ID in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false, false);
      expect(result).toMatch(/\b54321\b/);
    });
    it('should have the driver number in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false, false);
      expect(result).toMatch(/CAMPB805220A89HC/);
    });
    it('should have the driver surname in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false, false);
      expect(result).toMatch(/Campbell/);
    });
    it('should have processing status in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false, false);
      expect(result).toMatch(/0/);
    });
    it('should have version  in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false, false);
      expect(result).toMatch(/0.0.1/);
    });
    it('should have app_version  in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false, false);
      expect(result).toMatch(/0.0.0.1/);
    });
    it('should have Category in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false, false);
      expect(result).toMatch(/B/);
    });
    it('should have Activity Code in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false, false);
      expect(result).toMatch(/51/);
    });
    it('should have pass certificate number in the INSERT', () => {
      const result = buildTestResultInsert(dummyTestResult, false, false);
      expect(result).toMatch(/abc123/);
    });
    it('should use slot id as the app ref if the test is sourced from dsp', () => {
      const result = buildTestResultInsert(dummyTestResultDSP, false, false);
      expect(result).toMatch(/999999999/);
    });
    it('should use a default testCentreId of 99999 if the test is sourced from dsp', () => {
      const result = buildTestResultInsert(dummyTestResultDSP, false, false);
      expect(result).toMatch(/0/);
    });
  });

  describe('buildUploadQueueInsert', () => {
    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2023, 11, 10));
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should return the upload queue insert', () => {
      const result = buildUploadQueueInsert(dummyTestResult, IntegrationType.TARS);
      expect(result).toMatch(/INSERT INTO UPLOAD_QUEUE/);
      expect(result).toMatch(/(1234571026, '999', '2023-12-10 00:00:00.000', 0, 0, 0)/);
      expect(result).toMatch(/ON DUPLICATE KEY UPDATE/);
      expect(result).toMatch(/application_reference = 1234571026/);
    });
    it('should use slot id as the app ref if the test is sourced from dsp', () => {
      const result = buildUploadQueueInsert(dummyTestResultDSP, IntegrationType.NOTIFY);
      expect(result).toMatch(/999999999/);
    });
  });
});
