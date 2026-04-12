import * as FileSystem from 'expo-file-system';
import { apiFetch } from './api';
import { ensureJpegForUpload } from './receiptPick';

type UploadUrlResponse = { uploadUrl: string; receiptId: string; s3Url: string };

export async function uploadReceiptFromUri(uri: string): Promise<{ receiptId: string }> {
  const { uploadUrl, receiptId, s3Url } = await apiFetch<UploadUrlResponse>('/api/receipts/upload-url');
  const result = await FileSystem.uploadAsync(uploadUrl, uri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      'Content-Type': 'image/jpeg',
    },
  });
  if (result.status !== 200) {
    throw new Error(`Upload failed (${result.status})`);
  }
  await apiFetch(`/api/receipts`, {
    method: 'POST',
    body: JSON.stringify({ receiptId, s3Url }),
  });
  return { receiptId };
}

type ReceiptRow = { status: string };

export async function pollReceiptStatus(
  receiptId: string,
  opts?: { maxTries?: number; delayMs?: number },
): Promise<'PROCESSED' | 'FAILED' | 'TIMEOUT'> {
  const max = opts?.maxTries ?? 45;
  const delay = opts?.delayMs ?? 2000;
  for (let i = 0; i < max; i++) {
    const r = await apiFetch<ReceiptRow>(`/api/receipts/${receiptId}`);
    if (r.status === 'PROCESSED') return 'PROCESSED';
    if (r.status === 'FAILED') return 'FAILED';
    await new Promise((res) => setTimeout(res, delay));
  }
  return 'TIMEOUT';
}

/** Pick from camera or library → JPEG → presigned PUT → queue processing → poll until done. */
export async function runReceiptPipeline(localImageUri: string): Promise<'PROCESSED' | 'FAILED' | 'TIMEOUT'> {
  const jpegUri = await ensureJpegForUpload(localImageUri);
  const { receiptId } = await uploadReceiptFromUri(jpegUri);
  return pollReceiptStatus(receiptId);
}
