import { CommunicationMethod } from '@dvsa/mes-test-schema/categories/B';

export const hasCandidateCommunicationPermission = (communicationMethod: CommunicationMethod): boolean => {
  return communicationMethod === 'Email' || communicationMethod === 'Post';
};
