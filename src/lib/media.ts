import manifest from "@/data/media-manifest.json";

export type ImageVariant = {
  width: number;
  avif: string;
  webp: string;
  jpg: string;
};

export type ManifestImage = {
  id: string;
  project: string;
  kind: string;
  width: number;
  height: number;
  aspectRatio: number | null;
  variants: ImageVariant[];
};

export type PosterVariant = {
  width: number;
  avif: string;
  webp: string;
};

export type ManifestVideo = {
  id: string;
  project: string;
  mode: "loop" | "player";
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  mp4: string;
  webm: string;
  poster: PosterVariant[];
};

type Manifest = {
  generatedAt: string;
  images: ManifestImage[];
  videos: ManifestVideo[];
  vectors: { id: string; project: string; src: string }[];
};

const data = manifest as Manifest;

const imageIndex = new Map(data.images.map((image) => [image.id, image]));
const videoIndex = new Map(data.videos.map((video) => [video.id, video]));

/** Возвращает описание изображения или null, если файл ещё не загружен. */
export function getImage(id: string): ManifestImage | null {
  return imageIndex.get(id) ?? null;
}

export function getVideo(id: string): ManifestVideo | null {
  return videoIndex.get(id) ?? null;
}

/** srcSet для конкретного формата. */
export function buildSrcSet(
  variants: ImageVariant[],
  format: "avif" | "webp" | "jpg",
): string {
  return variants.map((variant) => `${variant[format]} ${variant.width}w`).join(", ");
}

/** Самый широкий вариант — используется как src запасного <img>. */
export function largestVariant(variants: ImageVariant[]): ImageVariant {
  return variants.reduce((best, current) => (current.width > best.width ? current : best));
}
