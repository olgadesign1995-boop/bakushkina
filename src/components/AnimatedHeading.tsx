"use client";

import { useEffect, useRef, type ElementType } from "react";

import { prefersReducedMotion, stagger } from "@/lib/motion";
import styles from "./AnimatedHeading.module.css";

type AnimatedHeadingProps = {
  /** Строки заголовка. Каждая появляется отдельно, снизу вверх. */
  lines: string[];
  as?: ElementType;
  className?: string;
  /** Задержка перед началом всей очереди, секунды. */
  delay?: number;
  id?: string;
};

/**
 * Заголовок, который собирается по строкам.
 *
 * Каждая строка живёт в контейнере с `overflow: hidden` и выезжает снизу —
 * приём набора: текст будто выходит из-под линии. Разбиение на строки задаётся
 * вручную массивом, поэтому перенос всегда осмысленный, а не случайный.
 *
 * Для доступности и поиска весь текст остаётся одной строкой в aria-label,
 * а визуальные части скрыты от скринридера.
 */
export function AnimatedHeading({
  lines,
  as: Tag = "h2",
  className,
  delay = 0,
  id,
}: AnimatedHeadingProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion()) {
      element.classList.add(styles.visible);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          element.classList.add(styles.visible);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      className={[styles.heading, className].filter(Boolean).join(" ")}
      aria-label={lines.join(" ")}
    >
      {lines.map((line, index) => (
        <span key={line} className={styles.lineWrap} aria-hidden="true">
          <span
            className={styles.line}
            style={{ transitionDelay: `${delay + index * stagger.line}s` }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
