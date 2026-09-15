import type { Metadata } from "next";

import type { WeddingContent } from "@/types/wedding";

type PublicPage = "home" | "gallery";

function getCoupleName(wedding: WeddingContent) {
  return `${wedding.couple.partnerOne} & ${wedding.couple.partnerTwo}`;
}

function getCoupleDescription(wedding: WeddingContent) {
  return `${wedding.couple.partnerOne} and ${wedding.couple.partnerTwo}`;
}

export function getPublicWeddingMetadata(
  wedding: WeddingContent,
  page: PublicPage,
): Metadata {
  const coupleName = getCoupleName(wedding);
  const coupleDescription = getCoupleDescription(wedding);

  if (page === "gallery") {
    return {
      title: `Wedding Gallery | ${coupleName}`,
      description: `Photographs from ${coupleDescription}'s wedding celebration.`,
    };
  }

  return {
    title: `${coupleName} | ${wedding.weddingDateLabel}`,
    description: `Join ${coupleDescription} for a joyful wedding celebration in ${wedding.details.venueAddress}.`,
  };
}
