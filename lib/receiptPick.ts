import * as ImageManipulator from 'expo-image-manipulator';

/** Presigned uploads expect JPEG bytes (server signs Content-Type: image/jpeg). */
export async function ensureJpegForUpload(localUri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(localUri, [], {
    compress: 0.88,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return result.uri;
}
