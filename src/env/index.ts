import { createEnv } from "@t3-oss/env-nextjs";

import { clientEnvironmentSchema, serverEnvironmentSchema } from "@/env/schema";

export const env = createEnv({
  server: serverEnvironmentSchema,
  client: clientEnvironmentSchema,
  runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    UPLOAD_RATE_LIMIT_SECRET: process.env.UPLOAD_RATE_LIMIT_SECRET,
  },
  emptyStringAsUndefined: true,
});
