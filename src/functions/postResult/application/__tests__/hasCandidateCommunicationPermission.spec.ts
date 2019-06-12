import { hasCandidateCommunicationPermission } from '../hasCandidateCommunicationPermission';

describe('hasCandidateCommunicationPermission', () => {

  it('should return true for Email', () => {
    const result = hasCandidateCommunicationPermission('Email');
    expect(result).toBe(true);
  });

  it('should return true for Post', () => {
    const result = hasCandidateCommunicationPermission('Post');
    expect(result).toBe(true);
  });

  it('should return false for Support Centre', () => {
    const result = hasCandidateCommunicationPermission('Support Centre');
    expect(result).toBe(false);
  });

});
