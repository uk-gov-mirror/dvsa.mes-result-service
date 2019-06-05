import * as mesSchema from '@dvsa/mes-test-schema/categories/B/index.json';
import joi, { ValidationResult } from '@hapi/joi';
import enjoi from 'enjoi';

/**
 * Converts the MES schema into a Joi schema which will then be validated
 * using joi.validate() to determine the data received by /test-result endpoint
 * is valid.
 *
 * @param data: any
 */
export function validateMESJoiSchema(data: any): ValidationResult<any> {
  const joiSchema = enjoi.schema(mesSchema);

  return joi.validate(data, joiSchema);
}
