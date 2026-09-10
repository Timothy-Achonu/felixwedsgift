import { z } from "zod";

const optionalValue = z.string().trim().min(1).optional();

export const serverEnvironmentSchema = {
  SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_").optional(),
  CLOUDINARY_API_KEY: optionalValue,
  CLOUDINARY_API_SECRET: optionalValue,
};

export const clientEnvironmentSchema = {
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .startsWith("sb_publishable_")
    .optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: optionalValue,
};

export const environmentSchema = z.object({
  ...serverEnvironmentSchema,
  ...clientEnvironmentSchema,
});
