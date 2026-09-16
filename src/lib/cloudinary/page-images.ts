import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { env } from "@/env";
import {
  maximumPageImageBytes,
  pageImageFormats,
} from "@/lib/images/page-images";

function credentials() {
  const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary page-image credentials are not configured.");
  }
  return { cloudName, apiKey, apiSecret };
}

function signature(parameters: Record<string, string>, secret: string) {
  const value = Object.entries(parameters)
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([key, item]) => `${key}=${item}`)
    .join("&");
  return createHash("sha1")
    .update(value + secret)
    .digest("hex");
}

export function signedPageImageUpload() {
  const { cloudName, apiKey, apiSecret } = credentials();
  const parameters = {
    overwrite: "false",
    public_id: `wedding/page/${randomUUID()}`,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  return {
    cloudName,
    apiKey,
    ...parameters,
    signature: signature(parameters, apiSecret),
  };
}

export type VerifiedCloudinaryImage = {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export async function verifyPageImage(
  publicId: string,
): Promise<VerifiedCloudinaryImage> {
  if (!/^wedding\/page\/[0-9a-f-]{36}$/.test(publicId)) {
    throw new Error("Invalid page-image asset ID.");
  }
  const { cloudName, apiKey, apiSecret } = credentials();
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/resources/image/upload/${publicId.split("/").map(encodeURIComponent).join("/")}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
      },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error("The uploaded image could not be verified in Cloudinary.");
  }
  const asset: unknown = await response.json();
  if (!asset || typeof asset !== "object") {
    throw new Error("Cloudinary returned an invalid image record.");
  }
  const record = asset as Record<string, unknown>;
  const secureUrl = record.secure_url;
  const width = record.width;
  const height = record.height;
  const format = record.format;
  const bytes = record.bytes;
  if (
    record.public_id !== publicId ||
    typeof secureUrl !== "string" ||
    !secureUrl.startsWith(
      `https://res.cloudinary.com/${cloudName}/image/upload/`,
    ) ||
    typeof width !== "number" ||
    typeof height !== "number" ||
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    typeof format !== "string" ||
    !pageImageFormats.includes(format) ||
    typeof bytes !== "number" ||
    !Number.isInteger(bytes) ||
    bytes < 1 ||
    bytes > maximumPageImageBytes ||
    width < 1 ||
    height < 1
  ) {
    throw new Error("Cloudinary returned an unexpected image asset.");
  }
  return { publicId, secureUrl, width, height, format, bytes };
}

export async function destroyPageImage(publicId: string) {
  if (!/^wedding\/page\/[0-9a-f-]{36}$/.test(publicId)) return;
  const { cloudName, apiKey, apiSecret } = credentials();
  const parameters = {
    invalidate: "true",
    public_id: publicId,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  const body = new URLSearchParams({
    ...parameters,
    api_key: apiKey,
    signature: signature(parameters, apiSecret),
  });
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/destroy`,
    { method: "POST", body },
  );
  if (!response.ok) {
    throw new Error("Cloudinary could not remove the superseded asset.");
  }
}
