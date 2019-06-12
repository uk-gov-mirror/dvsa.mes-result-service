import { ActivityCode } from '@dvsa/mes-test-schema/categories/B';

export const isCompletedTest = (activityCode: ActivityCode): boolean => {
  const completedTestCodes = ['1', '2', '3', '4', '5'];
  return completedTestCodes.includes(activityCode);
};
