import { notFound } from "next/navigation";

import type { WeddingContent } from "@/types/wedding";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";

import { mockWeddingContent } from "./mock-wedding";
import { pagePhoto, type PageImageRow } from "./page-images";

type WeddingSettingsRow = {
  partner_one_name: string;
  partner_two_name: string;
  wedding_date: string;
  timezone: string;
  ceremony_time: string;
  reception_time: string;
  venue_name: string;
  venue_address: string;
  dress_code: string;
  directions_url: string;
  hero_eyebrow: string;
  hero_message: string;
  story_heading: string;
  story_introduction: string;
  story_body: string;
  details_heading: string;
};

type ScheduleItemRow = {
  id: string;
  time_label: string;
  title: string;
  description: string | null;
};

function formatWeddingDate(date: string, timezone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: timezone,
    year: "numeric",
  }).format(new Date(date));
}

export async function getWeddingContent(): Promise<WeddingContent> {
  if (!isSupabaseConfigured()) {
    return mockWeddingContent;
  }

  const supabase = createSupabasePublicClient();
  const { data: settings, error: settingsError } = await supabase
    .from("wedding_settings")
    .select(
      "partner_one_name, partner_two_name, wedding_date, timezone, ceremony_time, reception_time, venue_name, venue_address, dress_code, directions_url, hero_eyebrow, hero_message, story_heading, story_introduction, story_body, details_heading",
    )
    .eq("id", 1)
    .eq("is_published", true)
    .maybeSingle<WeddingSettingsRow>();

  if (settingsError) {
    throw new Error("Unable to load published wedding settings.", {
      cause: settingsError,
    });
  }

  if (!settings) {
    // A deliberate unpublish must render a 404, not fail ISR and retain an old page.
    notFound();
  }

  const { data: schedule, error: scheduleError } = await supabase
    .from("schedule_items")
    .select("id, time_label, title, description")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<ScheduleItemRow[]>();

  if (scheduleError) {
    throw new Error("Unable to load the wedding schedule.", {
      cause: scheduleError,
    });
  }

  const { data: pageImages, error: pageImagesError } = await supabase
    .from("page_images")
    .select(
      "slot, cloudinary_public_id, secure_url, alt, width, height, focal_x, focal_y",
    )
    .returns<PageImageRow[]>();

  if (pageImagesError) {
    throw new Error("Unable to load published page images.", {
      cause: pageImagesError,
    });
  }

  const images = new Map(
    (pageImages ?? []).map((row) => [row.slot, pagePhoto(row)]),
  );

  return {
    ...mockWeddingContent,
    isMock: false,
    couple: {
      partnerOne: settings.partner_one_name,
      partnerTwo: settings.partner_two_name,
    },
    weddingDate: settings.wedding_date,
    weddingDateLabel: formatWeddingDate(
      settings.wedding_date,
      settings.timezone,
    ),
    timezone: settings.timezone,
    hero: {
      ...mockWeddingContent.hero,
      eyebrow: settings.hero_eyebrow,
      message: settings.hero_message,
      image: images.get("hero_desktop") ?? mockWeddingContent.hero.image,
      mobileImage:
        images.get("hero_mobile") ?? mockWeddingContent.hero.mobileImage,
    },
    story: {
      ...mockWeddingContent.story,
      heading: settings.story_heading,
      introduction: settings.story_introduction,
      body: settings.story_body,
      images: [
        images.get("story_primary") ?? mockWeddingContent.story.images[0],
        images.get("story_inset") ?? mockWeddingContent.story.images[1],
      ],
    },
    details: {
      ...mockWeddingContent.details,
      heading: settings.details_heading,
      ceremonyTime: settings.ceremony_time,
      receptionTime: settings.reception_time,
      venueName: settings.venue_name,
      venueAddress: settings.venue_address,
      dressCode: settings.dress_code,
      directionsUrl: settings.directions_url,
      image: images.get("venue") ?? mockWeddingContent.details.image,
    },
    schedule: (schedule ?? []).map((item) => ({
      id: item.id,
      time: item.time_label,
      title: item.title,
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}
