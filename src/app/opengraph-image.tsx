import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { site } from "@/lib/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OG-картинка генерируется кодом из фирменной типографики.
 * Шрифты локальные — внешние CDN не участвуют, генерация не падает без сети.
 */
async function loadFont(file: string) {
  return readFile(join(process.cwd(), "src", "assets", "fonts", file));
}

export default async function OpengraphImage() {
  const [cyrillic, latin] = await Promise.all([
    loadFont("manrope-cyrillic-700.ttf"),
    loadFont("manrope-latin-700.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0b0b0f",
          color: "#f4f4f6",
          fontFamily: "Manrope",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#a3a3b2" }}>
          {site.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            lineHeight: 1.1,
            letterSpacing: -1.5,
            maxWidth: 1000,
          }}
        >
          {site.ogTagline}
        </div>
        <div style={{ display: "flex", height: 10, background: "#6c5ce7", width: 240 }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Manrope", data: cyrillic, weight: 700, style: "normal" },
        { name: "Manrope", data: latin, weight: 700, style: "normal" },
      ],
    },
  );
}
