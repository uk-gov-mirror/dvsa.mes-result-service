import { gunzipSync } from 'zlib';

export const decompressRequestBody = (compressedRequestBody: string) => {
  try {
    const decodedBuffer = Buffer.from(compressedRequestBody, 'base64');
    const unzippedJson = gunzipSync(decodedBuffer).toString();
    return JSON.parse(unzippedJson);
  } catch (err) {
    throw new Error(`Error decompressing request body: ${err}`);
  }
};
