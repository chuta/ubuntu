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

/** Parse bucket + object key from s3:// or virtual-host/path-style HTTPS URLs. */
export function parseS3Location(storageUrl: string): { bucket: string; key: string } | null {
  if (storageUrl.startsWith("s3://")) {
    const withoutScheme = storageUrl.slice(5);
    const slash = withoutScheme.indexOf("/");
    if (slash <= 0) return null;
    return {
      bucket: withoutScheme.slice(0, slash),
      key: withoutScheme.slice(slash + 1),
    };
  }

  try {
    const url = new URL(storageUrl);
    const virtualHost = url.hostname.match(/^(.+)\.s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/i);
    if (virtualHost) {
      const key = url.pathname.replace(/^\/+/, "");
      return key ? { bucket: virtualHost[1], key } : null;
    }

    if (url.hostname.startsWith("s3.") && url.pathname.length > 1) {
      const parts = url.pathname.replace(/^\/+/, "").split("/");
      if (parts.length >= 2) {
        return { bucket: parts[0], key: parts.slice(1).join("/") };
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function parseS3Key(storageUrl: string): string | null {
  return parseS3Location(storageUrl)?.key ?? null;
}

export async function getPresignedDownloadUrl(storageUrl: string, expiresIn = 3600) {
  const location = parseS3Location(storageUrl);
  if (!location) throw new Error("Invalid storage URL");
  const s3 = getClient();
  const command = new GetObjectCommand({
    Bucket: location.bucket,
    Key: location.key,
  });
  return getSignedUrl(s3, command, { expiresIn });
}

/** Inline storage when S3 is unavailable (dev / AI drafts) */
export function inlineStorageUrl(documentId: string, version: number) {
  return `inline://${documentId}/v${version}`;
}

export function exportKey(userId: string, filename: string) {
  return `exports/${userId}/${filename}`;
}

export async function getObjectText(storageUrl: string): Promise<string> {
  const location = parseS3Location(storageUrl);
  if (!location) throw new Error("Invalid storage URL");
  const s3 = getClient();
  const obj = await s3.send(
    new GetObjectCommand({
      Bucket: location.bucket,
      Key: location.key,
    })
  );
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
