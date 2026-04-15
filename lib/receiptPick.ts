import * as ImageManipulator from 'expo-image-manipulator';

const MAX_EDGE_PX = 2200;

/** Presigned uploads expect JPEG bytes (server signs Content-Type: image/jpeg). */
export async function ensureJpegForUpload(localUri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: MAX_EDGE_PX } }],
      {
        compress: 0.88,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );
    return result.uri;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not prepare image';
    throw new Error(`${msg}. Try another photo or use the camera tab.`);
  }
}
