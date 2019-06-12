import { updateUploadStatus } from '../query-builder';

describe('updateUploadStatus query builder', () => {

  let dummyAppRef: number;
  let dummyRequestBody: any;

  beforeEach(() => {
    dummyAppRef = 1234567890;
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
  it('should contain the correct processing status', () => {
    const res = updateUploadStatus(dummyAppRef, dummyRequestBody);
    expect(res).toMatch(/processing_status_name = 'ACCEPTED'/);
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
    expect(res).toMatch(/application_reference = 1234567890/);
  });
  it('should contain the correct interface', () => {
    const res = updateUploadStatus(dummyAppRef, dummyRequestBody);
    expect(res).toMatch(/interface_type_name = 'TARS'/);
  });
});
