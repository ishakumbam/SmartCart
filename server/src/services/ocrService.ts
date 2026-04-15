import { ImageAnnotatorClient } from '@google-cloud/vision';
import Tesseract from 'tesseract.js';

type OcrEngineMode = 'auto' | 'google' | 'tesseract';

function ocrEngine(): OcrEngineMode {
  const v = (process.env.OCR_ENGINE ?? 'auto').toLowerCase();
  if (v === 'google' || v === 'tesseract') return v;
  return 'auto';
}

function hasGoogleCredentials(): boolean {
  return !!process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
}

async function loadImageBuffer(imageSource: string): Promise<Buffer> {
  const res = await fetch(imageSource);
  if (!res.ok) {
    throw new Error(`Could not download receipt image for OCR (HTTP ${res.status})`);
  }
  return Buffer.from(await res.arrayBuffer());
}

let visionClient: ImageAnnotatorClient | null = null;

async function runGoogleVision(imageSource: string): Promise<string> {
  if (!hasGoogleCredentials()) {
    throw new Error('Google Vision selected but GOOGLE_APPLICATION_CREDENTIALS is not set.');
  }
  if (!visionClient) {
    visionClient = new ImageAnnotatorClient();
  }

  let image: { content?: Buffer; source?: { imageUri: string } };
  if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
    image = { content: await loadImageBuffer(imageSource) };
  } else {
    image = { source: { imageUri: imageSource } };
  }

  const [docResult] = await visionClient.documentTextDetection({ image });
  const docText = docResult.fullTextAnnotation?.text?.trim();
  if (docText) return docText;

  const [textResult] = await visionClient.textDetection({ image });
  return textResult.fullTextAnnotation?.text?.trim() ?? '';
}

type TessWorker = Awaited<ReturnType<typeof Tesseract.createWorker>>;
let tessWorker: TessWorker | null = null;

async function getTesseractWorker(): Promise<TessWorker> {
  if (!tessWorker) {
    const w = await Tesseract.createWorker('eng');
    await w.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
    });
    tessWorker = w;
  }
  return tessWorker;
}

/** Free, on-device OCR via Tesseract (no GCP bill). Best for http(s) presigned receipt URLs. */
async function runTesseractVision(imageSource: string): Promise<string> {
  if (!imageSource.startsWith('http://') && !imageSource.startsWith('https://')) {
    throw new Error('Tesseract OCR needs an https image URL (your upload pipeline already uses this).');
  }
  const buffer = await loadImageBuffer(imageSource);
  const worker = await getTesseractWorker();
  const { data } = await worker.recognize(buffer);
  return data.text?.trim() ?? '';
}

/**
 * Receipt OCR: Google Vision when configured, otherwise **Tesseract.js** (free, runs on your server).
 *
 * `OCR_ENGINE`: `auto` (default) | `google` | `tesseract`
 * - **auto**: Vision if `GOOGLE_APPLICATION_CREDENTIALS` is set, else Tesseract.
 * - **google**: Vision only (fails if not configured).
 * - **tesseract**: Tesseract only (no GCP).
 */
export const runReceiptOcr = async (imageSource: string): Promise<string> => {
  const mode = ocrEngine();

  if (mode === 'google') {
    return runGoogleVision(imageSource);
  }
  if (mode === 'tesseract') {
    return runTesseractVision(imageSource);
  }

  // auto
  if (hasGoogleCredentials()) {
    return runGoogleVision(imageSource);
  }
  return runTesseractVision(imageSource);
};
