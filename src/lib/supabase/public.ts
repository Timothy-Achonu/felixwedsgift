import "server-only";

import { createClient } from "@supabase/supabase-js";

import {
  weddingContentRevalidateSeconds,
  weddingContentTag,
  weddingGalleryTag,
} from "@/lib/wedding/cache";

import { getSupabaseConfig } from "./config";

export function createSupabasePublicClient() {
  const { url, publishableKey } = getSupabaseConfig();
  // This client has no user session: shared cached data must always obey anon RLS.
  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => {
        const target = new URL(
          input instanceof Request ? input.url : String(input),
        );
        const method =
          init?.method ?? (input instanceof Request ? input.method : "GET");
        const isPublicRead =
          method === "GET" &&
          target.origin === new URL(url).origin &&
          /^\/rest\/v1\/(wedding_settings|schedule_items|page_images|photos)$/.test(
            target.pathname,
          );
        const tag = target.pathname.endsWith("/photos")
          ? weddingGalleryTag
          : weddingContentTag;
        return fetch(input, {
          ...init,
          cache: isPublicRead ? "force-cache" : "no-store",
          ...(isPublicRead
            ? {
                next: {
                  tags: [tag],
                  revalidate: weddingContentRevalidateSeconds,
                },
              }
            : {}),
        });
      },
    },
  });
}
