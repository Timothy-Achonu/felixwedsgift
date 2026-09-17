import "server-only";

import { v2 as cloudinary } from "cloudinary";

import { env } from "@/env";
import {
  guestPhotoMimeTypes,
  maximumGuestPhotoBytes,
  maximumGuestPhotoDimension,
} from "@/lib/photos/constants";

function configuredCloudinary() {
  const cloud_name = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const api_key = env.CLOUDINARY_API_KEY;
  const api_secret = env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Cloudinary is not configured.");
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  return { cloud_name, api_key, api_secret };
}

export function signGuestPhotoUpload(publicId: string) {
  const { cloud_name, api_key, api_secret } = configuredCloudinary();
  const timestamp = Math.floor(Date.now() / 1000);
  const parameters = { overwrite: false, public_id: publicId, timestamp };
  return {
    cloudName: cloud_name,
    apiKey: api_key,
    ...parameters,
    signature: cloudinary.utils.api_sign_request(parameters, api_secret),
  };
}

export async function verifyGuestPhoto(publicId: string) {
  configuredCloudinary();
  if (!/^wedding\/guest\/[0-9a-f-]{36}$/.test(publicId)) {
    throw new Error("Invalid guest-photo asset ID.");
  }
  const asset = await cloudinary.api.resource(publicId, {
    resource_type: "image",
    type: "authenticated",
  });
  const mime = `image/${asset.format === "jpg" ? "jpeg" : asset.format}`;
  if (
    !guestPhotoMimeTypes.includes(
      mime as (typeof guestPhotoMimeTypes)[number],
    ) ||
    !Number.isInteger(asset.bytes) ||
    asset.bytes < 1 ||
    asset.bytes > maximumGuestPhotoBytes ||
    !Number.isInteger(asset.width) ||
    !Number.isInteger(asset.height) ||
    asset.width < 1 ||
    asset.height < 1 ||
    asset.width > maximumGuestPhotoDimension ||
    asset.height > maximumGuestPhotoDimension ||
    (typeof asset.pages === "number" && asset.pages > 1)
  ) {
    throw new Error("Cloudinary returned an unsupported photograph.");
  }
  return {
    secureUrl: asset.secure_url as string,
    width: asset.width as number,
    height: asset.height as number,
    format: asset.format as string,
    bytes: asset.bytes as number,
  };
}

export async function changeGuestPhotoDelivery(
  publicId: string,
  from: "authenticated" | "upload",
  to: "authenticated" | "upload",
) {
  configuredCloudinary();
  const asset = await cloudinary.uploader.rename(publicId, publicId, {
    resource_type: "image",
    type: from,
    to_type: to,
    overwrite: false,
    invalidate: true,
  });
  return asset.secure_url as string;
}

export async function destroyGuestPhoto(
  publicId: string,
  deliveryType: "authenticated" | "upload",
) {
  configuredCloudinary();
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    type: deliveryType,
    invalidate: true,
  });
}

export function guestPhotoPreviewUrl(
  publicId: string,
  deliveryType: "authenticated" | "upload",
) {
  configuredCloudinary();
  return cloudinary.url(publicId, {
    type: deliveryType,
    sign_url: deliveryType === "authenticated",
    transformation: [{ width: 960, crop: "limit", quality: 75 }],
  });
}

export function guestPhotoDownloadUrl(
  publicId: string,
  format: string,
  deliveryType: "authenticated" | "upload",
) {
  configuredCloudinary();
  return cloudinary.utils.private_download_url(publicId, format, {
    type: deliveryType,
    expires_at: Math.floor(Date.now() / 1000) + 300,
    attachment: true,
  });
}
