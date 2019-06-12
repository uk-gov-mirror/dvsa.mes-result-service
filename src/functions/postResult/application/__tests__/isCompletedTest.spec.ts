import { isCompletedTest } from '../isCompletedTest';

describe('isCompletedTest', () => {

  it('should identify a completed test correctly for a pass', () => {
    const result = isCompletedTest('1');
    expect(result).toBe(true);
  });

  it('should identify a completed test correctly for a fail', () => {
    const result = isCompletedTest('2');
    expect(result).toBe(true);
  });

  it('should identify a completed test correctly for an eyesight fail', () => {
    const result = isCompletedTest('3');
    expect(result).toBe(true);
  });

  it('should identify a completed test correctly for a fail in interest of public safety', () => {
    const result = isCompletedTest('4');
    expect(result).toBe(true);
  });

  it('should identify a completed test correctly for a fail due to candidate choosing to stop test', () => {
    const result = isCompletedTest('5');
    expect(result).toBe(true);
  });

  it('should identify a completed test correctly for a terminated test', () => {
    const result = isCompletedTest('11');
    expect(result).toBe(false);
  });

});
