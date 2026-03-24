import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "gotspoil",
    short_name: "gotspoil",
    description: "מלווה צפייה נטול ספוילרים עבור משחקי הכס.",
    start_url: "/",
    display: "standalone",
    background_color: "#080910",
    theme_color: "#080910",
    lang: "he",
    dir: "rtl",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
