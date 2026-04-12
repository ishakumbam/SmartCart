import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient();

export const runReceiptOcr = async (imageUri: string): Promise<string> => {
  const [result] = await client.textDetection(imageUri);
  return result.fullTextAnnotation?.text ?? '';
};
