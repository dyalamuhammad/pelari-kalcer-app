import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SpeedTrack",
    short_name: "SpeedTrack",
    description: "Rekam lari kamu secara real-time dengan GPS.",
    start_url: "/",
    display: "standalone",
    background_color: "#05070F",
    theme_color: "#0A84FF",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}