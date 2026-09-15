import type { WeddingContent, WeddingPhoto } from "@/types/wedding";

import { mockRemoteGalleryPhotos } from "./mock-remote-gallery";

const photos = {
  hero: {
    id: "hero-couple",
    src: "/images/wedding/hero-couple.jpg",
    alt: "Newlyweds holding hands in formal wedding attire",
    width: 2000,
    height: 1600,
    caption: "At the beginning of forever",
  },
  portrait: {
    id: "couple-portrait",
    src: "/images/wedding/couple-portrait.jpg",
    alt: "A newlywed couple posing together",
    width: 1400,
    height: 1750,
    caption: "Just married",
  },
  ceremony: {
    id: "ceremony",
    src: "/images/wedding/ceremony.jpg",
    alt: "A couple standing together during their wedding ceremony",
    width: 1400,
    height: 2108,
    caption: "The promise",
  },
  dance: {
    id: "first-dance",
    src: "/images/wedding/first-dance.jpg",
    alt: "A newlywed couple embracing during a sunset dance",
    width: 1400,
    height: 2100,
    caption: "Our first dance",
    guestName: "From the dance floor",
  },
  bride: {
    id: "bride-bouquet",
    src: "/images/wedding/bride-bouquet.jpg",
    alt: "A bride holding a white and red bouquet",
    width: 1400,
    height: 2100,
    caption: "A quiet moment before the celebration",
  },
  rings: {
    id: "wedding-rings",
    src: "/images/wedding/wedding-rings.jpg",
    alt: "Newlyweds showing their wedding rings",
    width: 1400,
    height: 933,
    caption: "A promise made visible",
  },
  table: {
    id: "reception-table",
    src: "/images/wedding/reception-table.jpg",
    alt: "An elegant wedding reception table with flowers and candles",
    width: 1400,
    height: 933,
    caption: "A place set for joy",
  },
  galleryPortrait: {
    id: "gallery-portrait",
    src: "/images/wedding/gallery-portrait.jpg",
    alt: "A wedding couple smiling at each other",
    width: 1400,
    height: 1960,
    caption: "Better together",
  },
} satisfies Record<string, WeddingPhoto>;

export const mockWeddingContent = {
  isMock: true,
  couple: {
    partnerOne: "Felix",
    partnerTwo: "Gift",
  },
  weddingDate: "2026-12-18T14:00:00+01:00",
  weddingDateLabel: "18 December 2026",
  timezone: "Africa/Lagos",
  hero: {
    eyebrow: "With full hearts",
    message: "We are getting married",
    image: photos.hero,
    mobileImage: photos.hero,
  },
  story: {
    heading: "We found home in each other.",
    introduction:
      "Two lives, one unfolding story, and a celebration made brighter by the people we love.",
    body: "What began in the ordinary became something we could not imagine living without. Through every season, laughter has been our rhythm and friendship our home. This December, we begin our next chapter surrounded by the family and friends who helped us get here.",
    images: [photos.portrait, photos.rings],
  },
  details: {
    heading: "Meet us in Lagos",
    ceremonyTime: "2:00 PM",
    receptionTime: "4:30 PM",
    venueName: "The Garden Estate",
    venueAddress: "Lagos, Nigeria",
    dressCode: "Formal / Elegantly colourful",
    directionsUrl:
      "https://www.google.com/maps/search/?api=1&query=The+Garden+Estate+Lagos+Nigeria",
    image: photos.table,
  },
  schedule: [
    {
      id: "ceremony",
      time: "2:00 PM",
      title: "Ceremony",
      description: "The vows, the rings, and the beginning of forever.",
    },
    {
      id: "cocktails",
      time: "3:30 PM",
      title: "Portraits & cocktails",
      description: "Raise a glass while we capture a few memories.",
    },
    {
      id: "reception",
      time: "4:30 PM",
      title: "Reception",
      description: "Dinner, toasts, and a room full of our favourite people.",
    },
    {
      id: "dinner",
      time: "6:00 PM",
      title: "Dinner",
      description: "Come hungry and save room for something sweet.",
    },
    {
      id: "dancing",
      time: "7:30 PM",
      title: "Dancing",
      description: "Comfortable shoes encouraged. Joy required.",
    },
  ],
  gallery: [
    photos.ceremony,
    photos.dance,
    photos.bride,
    photos.rings,
    photos.table,
    photos.galleryPortrait,
    photos.portrait,
    photos.hero,
    ...mockRemoteGalleryPhotos,
  ],
} satisfies WeddingContent;

export async function getWeddingContent(): Promise<WeddingContent> {
  return mockWeddingContent;
}
