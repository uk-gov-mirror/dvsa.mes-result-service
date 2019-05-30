import { StandardCarTestCATBSchema } from '@dvsa/mes-test-schema/categories/B';

export const decompressTestResult = (compressedTestResult: string): StandardCarTestCATBSchema => {
  // Just return anything that the compiler will allow for now, we're not persisting it yet...
  return {
    id: 'dummy',
    activityCode: '1',
    category: 'dummy',
    journalData: {
      applicationReference: {
        applicationId: 123,
        bookingSequence: 1,
        checkDigit: 1,
      },
      candidate: {},
      examiner: {
        staffNumber: '123',
      },
      testCentre: {
        costCode: '123',
      },
      testSlotAttributes: {
        slotId: 123,
        start: 'abc',
        vehicleSlotType: 'dummy',
        welshTest: false,
        extendedTest: false,
        specialNeeds: false,
      },
    },

  };
};
