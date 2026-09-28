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
    href: "https://www.magnific.com/free-photo/",
  },
  ballycastle: {
    label: "Photo: Magnific",
    href: "https://www.magnific.com/free-photo/",
  },
  forest: {
    label: "Photo: Dieny Portinanni on Unsplash",
    href: "https://unsplash.com/photos/vPyn_xGD7cM",
  },
} satisfies Record<string, PhotoCredit>;
