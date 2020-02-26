import * as catBSchema from '@dvsa/mes-test-schema/categories/B/index.json';
import * as catBESchema from '@dvsa/mes-test-schema/categories/BE/index.json';
import * as catCSchema from '@dvsa/mes-test-schema/categories/C/index.json';
import * as catC1Schema from '@dvsa/mes-test-schema/categories/C1/index.json';
import * as catCESchema from '@dvsa/mes-test-schema/categories/CE/index.json';
import * as catC1ESchema from '@dvsa/mes-test-schema/categories/C1E/index.json';

import * as catDSchema from '@dvsa/mes-test-schema/categories/D/index.json';
import * as catD1Schema from '@dvsa/mes-test-schema/categories/D1/index.json';
import * as catDESchema from '@dvsa/mes-test-schema/categories/DE/index.json';
import * as catD1ESchema from '@dvsa/mes-test-schema/categories/D1E/index.json';

import * as catAM1Schema from '@dvsa/mes-test-schema/categories/AM1/index.json';

import joi, { ValidationResult } from '@hapi/joi';
import enjoi from 'enjoi';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';
import { TestCategory } from '@dvsa/mes-test-schema/category-definitions/common/test-category';

/**
 * Converts the MES schema into a Joi schema which will then be validated
 * using joi.validate() to determine the data received by /test-result endpoint
 * is valid.
 *
 * @param testResult: any
 */
export function validateMESJoiSchema(testResult: any): ValidationResult<any> {
  const testResultCategory: string = getTestCategory(testResult);
  const categorySpecificSchema = getCategorySpecificSchema(testResultCategory);
  const joiSchema = enjoi.schema(categorySpecificSchema);

  return joi.validate(testResult, joiSchema);
}

/**
 * Function to get the category code from the test result
 * @param {TestResultSchemasUnion} testResult
 * @return {string}
 */
export const getTestCategory = (testResult: TestResultSchemasUnion): string => testResult.category;

/**
 * Function to return the desired schema to validate against
 * @param {string} category
 * @return {Object}
 */
export const getCategorySpecificSchema = (category: string): Object => {
  switch (category) {
    case TestCategory.B:
      return catBSchema;
    case TestCategory.BE:
      return catBESchema;
    case TestCategory.C:
      return catCSchema;
    case TestCategory.C1:
      return catC1Schema;
    case TestCategory.CE:
      return catCESchema;
    case TestCategory.C1E:
      return catC1ESchema;
    case TestCategory.D:
      return catDSchema;
    case TestCategory.D1:
      return catD1Schema;
    case TestCategory.DE:
      return catDESchema;
    case TestCategory.D1E:
      return catD1ESchema;
    case TestCategory.EUA1M1:
    case TestCategory.EUAMM1:
    case TestCategory.EUAM1:
    case TestCategory.EUA2M1:
      return catAM1Schema;
    default:
      return catBSchema;
  }
};
