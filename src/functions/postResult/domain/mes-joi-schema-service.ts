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
import * as catAM2Schema from '@dvsa/mes-test-schema/categories/AM2/index.json';

import * as catFSchema from '@dvsa/mes-test-schema/categories/F/index.json';
import * as catGSchema from '@dvsa/mes-test-schema/categories/G/index.json';
import * as catHSchema from '@dvsa/mes-test-schema/categories/H/index.json';
import * as catKSchema from '@dvsa/mes-test-schema/categories/K/index.json';

import * as catADI2Schema from '@dvsa/mes-test-schema/categories/ADI2/index.json';
import * as catADI3Schema from '@dvsa/mes-test-schema/categories/ADI3/index.json';

import * as catCPCSchema from '@dvsa/mes-test-schema/categories/CPC/index.json';

import * as catCMSchema from '@dvsa/mes-test-schema/categories/CM/index.json';
import * as catC1MSchema from '@dvsa/mes-test-schema/categories/C1M/index.json';
import * as catCEMSchema from '@dvsa/mes-test-schema/categories/CEM/index.json';
import * as catC1EMSchema from '@dvsa/mes-test-schema/categories/C1EM/index.json';
import * as catDMSchema from '@dvsa/mes-test-schema/categories/DM/index.json';
import * as catD1MSchema from '@dvsa/mes-test-schema/categories/D1M/index.json';
import * as catDEMSchema from '@dvsa/mes-test-schema/categories/DEM/index.json';
import * as catD1EMSchema from '@dvsa/mes-test-schema/categories/D1EM/index.json';

import { ValidationResult } from 'joi';
import enjoi from 'enjoi';
import { TestResultSchemasUnion } from '@dvsa/mes-test-schema/categories';
import { TestCategory } from '@dvsa/mes-test-schema/category-definitions/common/test-category';

/**
 * Converts the MES schema into a Joi schema which will then be validated
 * using joi.validate() to determine the data received by /test-result endpoint
 * is valid.
 *
 * @param testResult
 */
export function validateMESJoiSchema(testResult: any): ValidationResult {
  const testResultCategory: string = getTestCategory(testResult);
  const categorySpecificSchema = getCategorySpecificSchema(testResultCategory);
  const joiSchema = enjoi.schema(categorySpecificSchema);

  return joiSchema.validate(testResult);
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
  case TestCategory.F:
    return catFSchema;
  case TestCategory.G:
    return catGSchema;
  case TestCategory.H:
    return catHSchema;
  case TestCategory.K:
    return catKSchema;
  case TestCategory.EUA1M1:
  case TestCategory.EUAMM1:
  case TestCategory.EUAM1:
  case TestCategory.EUA2M1:
    return catAM1Schema;
  case TestCategory.EUA1M2:
  case TestCategory.EUAMM2:
  case TestCategory.EUAM2:
  case TestCategory.EUA2M2:
    return catAM2Schema;
  case TestCategory.ADI2:
    return catADI2Schema;
  case TestCategory.ADI3:
  case TestCategory.SC:
    return catADI3Schema;
  case TestCategory.CCPC:
  case TestCategory.DCPC:
    return catCPCSchema;
  case TestCategory.CM:
    return catCMSchema;
  case TestCategory.C1M:
    return catC1MSchema;
  case TestCategory.CEM:
    return catCEMSchema;
  case TestCategory.C1EM:
    return catC1EMSchema;
  case TestCategory.DM:
    return catDMSchema;
  case TestCategory.D1M:
    return catD1MSchema;
  case TestCategory.DEM:
    return catDEMSchema;
  case TestCategory.D1EM:
    return catD1EMSchema;
  default:
    return catBSchema;
  }
};
