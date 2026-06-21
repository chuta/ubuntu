import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION ?? "eu-west-1";
const BUCKET = process.env.AWS_S3_BUCKET_NAME ?? process.env.AWS_S3_BUCKET;

let client: S3Client | null = null;

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      BUCKET
  );
}

function getClient(): S3Client {
  if (!isStorageConfigured()) {
    throw new Error("AWS S3 is not configured. Add credentials to .env");
  }
  if (!client) {
    client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

export function documentKey(documentId: string, version: number, filename: string) {
  return `documents/${documentId}/v${version}/${filename}`;
}

export function knowledgeKey(assetId: string, filename: string) {
  return `knowledge/${assetId}/${filename}`;
}

export async function uploadText(key: string, content: string, contentType = "text/markdown") {
  const s3 = getClient();
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: content,
      ContentType: contentType,
    })
  );
  return `s3://${BUCKET}/${key}`;
}

export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600) {
  const s3 = getClient();
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn });
  return { url, storageUrl: `s3://${BUCKET}/${key}`, key };
}

export async function getPresignedDownloadUrl(storageUrl: string, expiresIn = 3600) {
  const key = parseS3Key(storageUrl);
  if (!key) throw new Error("Invalid storage URL");
  const s3 = getClient();
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}

export function parseS3Key(storageUrl: string): string | null {
  if (storageUrl.startsWith("s3://")) {
    const withoutScheme = storageUrl.slice(5);
    const slash = withoutScheme.indexOf("/");
    if (slash === -1) return null;
    return withoutScheme.slice(slash + 1);
  }
  return null;
}

/** Inline storage when S3 is unavailable (dev / AI drafts) */
export function inlineStorageUrl(documentId: string, version: number) {
  return `inline://${documentId}/v${version}`;
}

export function exportKey(userId: string, filename: string) {
  return `exports/${userId}/${filename}`;
}

export async function getObjectText(storageUrl: string): Promise<string> {
  const key = parseS3Key(storageUrl);
  if (!key) throw new Error("Invalid storage URL");
  const s3 = getClient();
  const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return obj.Body?.transformToString("utf-8") ?? "";
}

export async function uploadBuffer(key: string, buffer: Buffer, contentType: string) {
  const s3 = getClient();
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `s3://${BUCKET}/${key}`;
}

export function isInlineStorage(storageUrl: string) {
  return storageUrl.startsWith("inline://");
}
