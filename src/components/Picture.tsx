import { buildSrcSet, getImage, largestVariant } from "@/lib/media";

type PictureProps = {
  /** id изображения в media-manifest */
  id: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

/**
 * Отдаёт AVIF → WebP → JPG с явными размерами.
 * Размеры берутся из манифеста, поэтому вёрстка не «прыгает» при загрузке.
 */
export function Picture({ id, alt, sizes = "100vw", className, priority }: PictureProps) {
  const image = getImage(id);

  if (!image) {
    // Файла ещё нет — не рисуем битую картинку.
    return null;
  }

  const fallback = largestVariant(image.variants);

  return (
    <picture>
      <source type="image/avif" srcSet={buildSrcSet(image.variants, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={buildSrcSet(image.variants, "webp")} sizes={sizes} />
      <img
        src={fallback.jpg}
        srcSet={buildSrcSet(image.variants, "jpg")}
        sizes={sizes}
        alt={alt}
        width={image.width}
        height={image.height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}
