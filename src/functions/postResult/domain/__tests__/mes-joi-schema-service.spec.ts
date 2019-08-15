import { validateMESJoiSchema } from '../../domain/mes-joi-schema-service';

describe('Joi schema validation service', () => {
  const validationErrorName = 'ValidationError';
  const startValidationErrorMessage = 'child "journalData" fails because' +
    ' [child "testSlotAttributes" fails because [child "start" fails because ["start" length' +
    ' must be less than or equal to 19 characters long]]]';
  const requiredFieldMissingErrorMessage = 'child "journalData" fails because ' +
    '[child "applicationReference" fails because ["applicationReference" is required]]';

  it('should return a validation error if \'testSlotAttributes.start\' schema validation fails', () => {
    const invalidSchema = {
      activityCode: '1',
      category: 'B',
      journalData: {
        examiner: { staffNumber: '01234567' },
        testCentre: {
          centreId: 1234,
          costCode: '1234',
        },
        testSlotAttributes: {
          slotId: 1,
          start: '1'.repeat(20), // start exceeds max-length (19 characters)
          vehicleSlotType: 'mock',
          specialNeeds: false,
          welshTest: false,
          extendedTest: false,
        },
        candidate: {

        },
        applicationReference: {
          applicationId: 12,
          bookingSequence: 222,
          checkDigit: 1,
        },
      },
      rekey: false,
      changeMarker: false,
      examinerBooked: 12345678,
      examinerConducted: 12345678,
      examinerKeyed: 12345678,
    };
    const validationResult = validateMESJoiSchema(invalidSchema);
    expect(validationResult.error.message).toEqual(startValidationErrorMessage);
    expect(validationResult.error.name).toEqual(validationErrorName);
  });

  it('should not return a validation error if \'testSlotAttributes.start\' is valid', () => {
    const invalidSchema = {
      activityCode: '1',
      category: 'B',
      journalData: {
        examiner: { staffNumber: '01234567' },
        testCentre: {
          centreId: 1234,
          costCode: '1234',
        },
        testSlotAttributes: {
          slotId: 1,
          start: '1'.repeat(19), // start does not exceed max-length (19 characters)
          vehicleTypeCode: 'C',
          specialNeeds: false,
          welshTest: false,
          extendedTest: false,
        },
        candidate: {},
        applicationReference: {
          applicationId: 12,
          bookingSequence: 222,
          checkDigit: 1,
        },
      },
      rekey: false,
      changeMarker: false,
      examinerBooked: 12345678,
      examinerConducted: 12345678,
      examinerKeyed: 12345678,
    };
    const validationResult = validateMESJoiSchema(invalidSchema);
    expect(validationResult.error).toBeNull();
  });

  it('should return a validation error if required property is missing from schema', () => {
    const invalidSchema = {
      activityCode: '1',
      category: 'B',
      journalData: {
        examiner: { staffNumber: '01234567' },
        testCentre: {
          centreId: 1234,
          costCode: '1234',
        },
        testSlotAttributes: {
          slotId: 1,
          start: 'ABCDEFGHIJKLMNOPQRS',
          vehicleTypeCode: 'C',
          specialNeeds: false,
          welshTest: false,
          extendedTest: false,
        },
        candidate: {},
        // missing required property 'applicationReference'
      },
      rekey: false,
      changeMarker: false,
      examinerBooked: 12345678,
      examinerConducted: 12345678,
      examinerKeyed: 12345678,
    };

    const validationResult = validateMESJoiSchema(invalidSchema);
    expect(validationResult.error.message).toEqual(requiredFieldMissingErrorMessage);
    expect(validationResult.error.name).toEqual(validationErrorName);
  });
});
