import { updateUploadStatus } from '../query-builder';

describe('updateUploadStatus query builder', () => {

  let dummyAppRef: string;
  let dummyRequestBody: any;

  beforeEach(() => {
    dummyAppRef = 'abcdef12345678';
    dummyRequestBody = {
      upload_status: 'ACCEPTED',
      retry_count: 15,
      error_message: '500 Internal Server Error',
      staff_number: '12345',
      interface: 'TARS',
    };
  });
  it('should contain UPDATE UPLOAD_QUEUE', () => {
    const res = updateUploadStatus(dummyAppRef, dummyRequestBody);
    expect(res).toMatch(/UPDATE UPLOAD_QUEUE/);
  });
  it('should contain the correct upload status', () => {
    const res = updateUploadStatus(dummyAppRef, dummyRequestBody);
    expect(res).toMatch(/upload_status = 'ACCEPTED'/);
  });
  it('should contain the correct retry count', () => {
    const res = updateUploadStatus(dummyAppRef, dummyRequestBody);
    expect(res).toMatch(/retry_count = retry_count \+ 15/);
  });
  it('should contain the correct error message', () => {
    const res = updateUploadStatus(dummyAppRef, dummyRequestBody);
    expect(res).toMatch(/error_message = '500 Internal Server Error'/);
  });
  it('should contain the correct staff number', () => {
    const res = updateUploadStatus(dummyAppRef, dummyRequestBody);
    expect(res).toMatch(/staff_number = '12345'/);
  });
  it('should contain the correct application referenence', () => {
    const res = updateUploadStatus(dummyAppRef, dummyRequestBody);
    expect(res).toMatch(/application_reference = 'abcdef12345678'/);
  });
  it('should contain the correct interface', () => {
    const res = updateUploadStatus(dummyAppRef, dummyRequestBody);
    expect(res).toMatch(/interface = 'TARS'/);
  });
});
