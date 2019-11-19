import * as catBSchema from '@dvsa/mes-test-schema/categories/B/index.json';
import * as catBESchema from '@dvsa/mes-test-schema/categories/BE/index.json';
import * as catCSchema from '@dvsa/mes-test-schema/categories/C/index.json';

import joi, { ValidationResult } from '@hapi/joi';
import enjoi from 'enjoi';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';

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
    case 'B':
      return catBSchema;
    case 'BE':
      return catBESchema;
    case 'C':
      return catCSchema;
    default:
      return catBSchema;
  }
};
