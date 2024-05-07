export interface TestResultRecord {
  test_result: any; // We persist objects that aren't necessarily conformant to our test schema
  autosave: any; // must be any to satisfy the buffer return from sql
}
