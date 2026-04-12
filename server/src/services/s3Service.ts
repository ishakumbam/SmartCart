import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.S3_ENDPOINT?.trim();
const region = process.env.AWS_REGION ?? 'us-east-1';

const s3 = endpoint
  ? new S3Client({
      region: process.env.AWS_REGION ?? 'auto',
      endpoint,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
      forcePathStyle: true,
    })
  : new S3Client({ region });

const buildObjectUrl = (bucket: string, key: string): string => {
  if (process.env.S3_PUBLIC_URL?.trim()) {
    const base = process.env.S3_PUBLIC_URL.replace(/\/$/, '');
    return `${base}/${key}`;
  }
  if (endpoint) {
    const base = endpoint.replace(/\/$/, '');
    return `${base}/${bucket}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

export const createReceiptUploadUrl = async (
  key: string,
): Promise<{ uploadUrl: string; s3Url: string }> => {
  const bucket = process.env.AWS_S3_BUCKET ?? '';
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: 'image/jpeg',
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const s3Url = buildObjectUrl(bucket, key);
  return { uploadUrl, s3Url };
};
