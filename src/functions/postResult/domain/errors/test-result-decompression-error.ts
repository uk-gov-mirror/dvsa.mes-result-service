export class TestResultDecompressionError extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, TestResultDecompressionError.prototype);
  }
}
