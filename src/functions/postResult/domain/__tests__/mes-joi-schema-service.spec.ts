import { validateMESJoiSchema, getTestCategory, getCategorySpecificSchema } from '../mes-joi-schema-service';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';

import * as catBSchema from '@dvsa/mes-test-schema/categories/B/index.json';
import * as catBESchema from '@dvsa/mes-test-schema/categories/BE/index.json';
import * as catCSchema from '@dvsa/mes-test-schema/categories/C/index.json';
import * as catCESchema from '@dvsa/mes-test-schema/categories/CE/index.json';
import * as catC1Schema from '@dvsa/mes-test-schema/categories/C1/index.json';
import * as catC1ESchema from '@dvsa/mes-test-schema/categories/C1E/index.json';
import * as catDSchema from '@dvsa/mes-test-schema/categories/D/index.json';
import * as catDESchema from '@dvsa/mes-test-schema/categories/DE/index.json';
import * as catD1Schema from '@dvsa/mes-test-schema/categories/D1/index.json';
import * as catD1ESchema from '@dvsa/mes-test-schema/categories/D1E/index.json';
import * as catFSchema from '@dvsa/mes-test-schema/categories/F/index.json';
import * as catGSchema from '@dvsa/mes-test-schema/categories/G/index.json';
import * as catHSchema from '@dvsa/mes-test-schema/categories/H/index.json';
import * as catKSchema from '@dvsa/mes-test-schema/categories/K/index.json';
import * as catAM1Schema from '@dvsa/mes-test-schema/categories/AM1/index.json';
import * as catAM2Schema from '@dvsa/mes-test-schema/categories/AM2/index.json';
import { TestCategory } from '@dvsa/mes-test-schema/category-definitions/common/test-category';

const expectedSchema = [
    { category: TestCategory.B, schema: catBSchema },
    { category: TestCategory.BE, schema: catBESchema },
    { category: TestCategory.C, schema: catCSchema },
    { category: TestCategory.CE, schema: catCESchema },
    { category: TestCategory.C1E, schema: catC1ESchema },
    { category: TestCategory.C1, schema: catC1Schema },
    { category: TestCategory.EUA1M1, schema: catAM1Schema },
    { category: TestCategory.EUAMM1, schema: catAM1Schema },
    { category: TestCategory.EUAM1, schema: catAM1Schema },
    { category: TestCategory.EUA2M1, schema: catAM1Schema },
    { category: TestCategory.EUA1M2, schema: catAM2Schema },
    { category: TestCategory.EUAMM2, schema: catAM2Schema },
    { category: TestCategory.EUAM2, schema: catAM2Schema },
    { category: TestCategory.EUA2M2, schema: catAM2Schema },
    { category: TestCategory.D, schema: catDSchema },
    { category: TestCategory.DE, schema: catDESchema },
    { category: TestCategory.D1, schema: catD1Schema },
    { category: TestCategory.D1E, schema: catD1ESchema },
    { category: TestCategory.F, schema: catFSchema },
    { category: TestCategory.G, schema: catGSchema },
    { category: TestCategory.H, schema: catHSchema },
    { category: TestCategory.K, schema: catKSchema },
];

describe('Joi schema validation service', () => {
  const validationErrorName = 'ValidationError';
  const startValidationErrorMessage = 'child "journalData" fails because' +
    ' [child "testSlotAttributes" fails because [child "start" fails because ["start" length' +
    ' must be less than or equal to 19 characters long]]]';
  const requiredFieldMissingErrorMessage = 'child "journalData" fails because ' +
    '[child "applicationReference" fails because ["applicationReference" is required]]';

  it('should return a validation error if \'testSlotAttributes.start\' schema validation fails', () => {
    const invalidSchema = {
      version: '0.0.1',
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
    expect(validationResult.error.message).toEqual(startValidationErrorMessage);
    expect(validationResult.error.name).toEqual(validationErrorName);
  });

  it('should not return a validation error if \'testSlotAttributes.start\' is valid', () => {
    const invalidSchema = {
      version: '0.0.1',
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
      version: '0.0.1',
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

describe('getTestCategory', () => {
  it('should return the category of schema', () => {
    const schema = {
      version: '0.0.1',
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
      },
      rekey: false,
      changeMarker: false,
      examinerBooked: 12345678,
      examinerConducted: 12345678,
      examinerKeyed: 12345678,
    };
    const category = getTestCategory(schema as TestResultSchemasUnion);
    expect(category).toEqual(TestCategory.B);
  });
});

describe('getCategorySpecificSchema', () => {
  expectedSchema.forEach((cat) => {
    it(`should return Category ${cat.category} schema`, () => {
      const schema = getCategorySpecificSchema(cat.category);
      expect(schema).toEqual(cat.schema);
    });
  });
  it(`should return Category B schema if null category passed in`, () => {
    const schema = getCategorySpecificSchema(null);
    expect(schema).toEqual(catBSchema);
  });
});
