import { describe, expect, it } from "vitest";

import { environmentSchema } from "@/env/schema";

describe("environment schema", () => {
  it("allows an unconfigured foundation environment", () => {
    expect(environmentSchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid provider configuration", () => {
    const result = environmentSchema.safeParse({
      NEXT_PUBLIC_SITE_URL: "https://felixandgift.example",
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      SUPABASE_SECRET_KEY: "sb_secret_example",
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "felix-and-gift",
      CLOUDINARY_API_KEY: "example-key",
      CLOUDINARY_API_SECRET: "example-secret",
    });

    expect(result.success).toBe(true);
  });

  it("rejects malformed URLs and legacy Supabase key formats", () => {
    const result = environmentSchema.safeParse({
      NEXT_PUBLIC_SITE_URL: "not-a-url",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "legacy-anon-key",
      SUPABASE_SECRET_KEY: "legacy-service-role-key",
    });

    expect(result.success).toBe(false);
  });
});
