"use client";

import { useRef, useState } from "react";

import { getVideo } from "@/lib/media";

import styles from "./VideoBlock.module.css";

type VideoBlockProps = {
  id: string;
  title: string;
  caption?: string;
};

/**
 * Видео играет на самой странице — без ухода на внешний сервис.
 * Режим loop: беззвучная петля, стартует сама, гаснет при prefers-reduced-motion.
 * Режим player: постер + кнопка, файл не грузится, пока не нажали.
 */
export function VideoBlock({ id, title, caption }: VideoBlockProps) {
  const video = getVideo(id);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  if (!video) return null;

  const poster = video.poster[0]?.webp;
  const ratio =
    video.width && video.height ? `${video.width} / ${video.height}` : "16 / 9";

  if (video.mode === "loop") {
    return (
      <figure className={styles.figure}>
        <video
          className={styles.video}
          style={{ aspectRatio: ratio }}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={title}
        >
          <source src={video.webm} type="video/webm" />
          <source src={video.mp4} type="video/mp4" />
        </video>
        {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <figure className={styles.figure}>
      <div className={styles.player} style={{ aspectRatio: ratio }}>
        <video
          ref={ref}
          className={styles.video}
          poster={poster}
          controls={started}
          playsInline
          preload="none"
          aria-label={title}
        >
          <source src={video.webm} type="video/webm" />
          <source src={video.mp4} type="video/mp4" />
        </video>
        {!started ? (
          <button
            type="button"
            className={styles.play}
            onClick={() => {
              setStarted(true);
              void ref.current?.play();
            }}
          >
            <span className={styles.playIcon} aria-hidden="true" />
            <span className={styles.playLabel}>Смотреть: {title}</span>
          </button>
        ) : null}
      </div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
