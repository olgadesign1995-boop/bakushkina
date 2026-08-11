"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

import { prefersReducedMotion } from "@/lib/motion";
import styles from "./Reveal.module.css";

type RevealProps = {
  children: ReactNode;
  /** Каким тегом отрисовать обёртку. */
  as?: ElementType;
  /** Задержка внутри общей очереди, секунды. */
  delay?: number;
  /** Характер появления. */
  variant?: "rise" | "fade" | "mask" | "scale";
  className?: string;
};

/**
 * Появление блока при входе в экран.
 *
 * Работает на IntersectionObserver: пока элемент внизу — он смещён и прозрачен,
 * при входе получает класс и приходит в покой. Один раз, без мигания назад.
 *
 * Если пользователь просит меньше движения — элемент сразу виден.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  variant = "rise",
  className,
}: RevealProps) {
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
      // Запускаем чуть раньше, чем блок доедет до центра: движение успевает
      // закончиться к моменту, когда взгляд на него попадёт.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={[styles.reveal, styles[variant], className].filter(Boolean).join(" ")}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </Tag>
  );
}
