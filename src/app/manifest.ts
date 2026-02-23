import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CutMyCase - Custom Foam Inserts",
    short_name: "CutMyCase",
    description:
      "AI-powered custom foam inserts for protective cases. Upload a photo, get a perfect fit.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#FF4D00",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/images/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["business", "shopping", "utilities"],
  };
}
