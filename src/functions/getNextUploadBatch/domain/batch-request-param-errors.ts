export enum BatchRequestParamaterErrors {
  PARAM_NOT_PROVIDED = 'Invalid APIGatewayEvent params provided',
  INTERFACE_NOT_FOUND = 'Invalid APIGatewayEvent param provided for interface type',
  BATCH_SIZE_NOT_NUMERIC = 'Invalid APIGatewayEvent param provided for batch_size (NaN)',
  BATCH_SIZE_NOT_VALID = 'Invalid APIGatewayEvent param provided for batch_size (must be greater than 0)',
}
