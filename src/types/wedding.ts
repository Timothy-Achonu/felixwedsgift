export type WeddingLifecycle = "upcoming" | "today" | "complete";

export type WeddingPhoto = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  guestName?: string;
};

export type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  description?: string;
};

export type WeddingContent = {
  isMock: boolean;
  couple: {
    partnerOne: string;
    partnerTwo: string;
  };
  weddingDate: string;
  weddingDateLabel: string;
  timezone: string;
  hero: {
    eyebrow: string;
    message: string;
    image: WeddingPhoto;
  };
  story: {
    heading: string;
    introduction: string;
    body: string;
    images: [WeddingPhoto, WeddingPhoto];
  };
  details: {
    heading: string;
    ceremonyTime: string;
    receptionTime: string;
    venueName: string;
    venueAddress: string;
    dressCode: string;
    directionsUrl: string;
  };
  schedule: ScheduleItem[];
  gallery: WeddingPhoto[];
};
