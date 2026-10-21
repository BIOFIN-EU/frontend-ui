// Attribution for the photos in public/images: "Photo: <author> on <site>",
// linking to the photo's own page (authors checked on those pages, 2026-10).
// The same credit is embedded in each file's EXIF (Artist / Copyright /
// ImageDescription).
export type PhotoCredit = {
  label: string;
  href: string;
};

export const photoCredits = {
  bertraghboyBay: {
    label: "Photo: wirestock on Magnific",
    href: "https://www.magnific.com/free-photo/bertraghboy-bay-covered-greenery-cloudy-sky-connemara-ireland_10991031.htm",
  },
  ballycastle: {
    label: "Photo: wirestock on Magnific",
    href: "https://www.magnific.com/free-photo/high-angle-shot-valley-sea-near-ballycastle-county-mayo-ireland_11342081.htm",
  },
  forest: {
    label: "Photo: Dieny Portinanni on Unsplash",
    href: "https://unsplash.com/photos/vPyn_xGD7cM",
  },
  daintreeRiver: {
    label: "Photo: brgfx on Magnific",
    href: "https://www.magnific.com/free-photo/aerial-view-winding-river-through-lush-daintree-rainforest_427528644.htm",
  },
  haifoss: {
    label: "Photo: wirestock on Magnific",
    href: "https://www.magnific.com/free-photo/aerial-shot-high-striking-haifoss-waterfall-streaming-down-iceland_9990765.htm",
  },
  // Magnific's own photo: its page names Magnific as the author.
  womanTouchingTree: {
    label: "Photo: Magnific",
    href: "https://www.magnific.com/free-photo/woman-touching-tree-with-hand_4687727.htm",
  },
  malmoHarbour: {
    label: "Photo: Karl Hörnfeldt on Unsplash",
    href: "https://unsplash.com/photos/qxpLVlNBv5w",
  },
} satisfies Record<string, PhotoCredit>;
