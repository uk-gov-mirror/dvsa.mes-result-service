/**
 * Describes the scenario where an attempt was made to update a single upload status,
 * but a single record was not updated.
 */
export class InconsistentUpdateError extends Error {
  constructor() {
    super('Failed to update a single UPLOAD_QUEUE record');
    Object.setPrototypeOf(this, InconsistentUpdateError.prototype);
  }
}
