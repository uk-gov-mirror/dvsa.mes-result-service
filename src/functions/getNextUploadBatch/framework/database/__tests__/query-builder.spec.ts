import { buildTarsNextBatchQuery } from '../query-builder';

describe('Querybuilder', () => {
  it('should contain the batch size provided as a param', () => {
    const result = buildTarsNextBatchQuery(5, '');
    expect(result).toMatch(/5/);
  });
});
