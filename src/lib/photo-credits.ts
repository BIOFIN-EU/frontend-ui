// Attribution for the background photos in public/images. The same credit is
// embedded in each file's EXIF (Artist / Copyright / ImageDescription).
// Replace `href` with the photo's own page when you have it.
export type PhotoCredit = {
  label: string;
  href: string;
};

export const photoCredits = {
  bertraghboyBay: {
    label: "Photo: Magnific",
    href: "https://www.magnific.com/free-photo/bertraghboy-bay-covered-greenery-cloudy-sky-connemara-ireland_10991031.htm",
  },
  ballycastle: {
    label: "Photo: Magnific",
    href: "https://www.magnific.com/free-photo/high-angle-shot-valley-sea-near-ballycastle-county-mayo-ireland_11342081.htm",
  },
  forest: {
    label: "Photo: Dieny Portinanni on Unsplash",
    href: "https://unsplash.com/photos/vPyn_xGD7cM",
  },
} satisfies Record<string, PhotoCredit>;
