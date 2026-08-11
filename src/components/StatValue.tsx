"use client";

import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "@/lib/motion";

type StatValueProps = {
  /** Готовая строка из данных: «51 900+», «4.9 / 5.0», «20+». */
  value: string;
  className?: string;
};

/**
 * Разбирает строку показателя и докручивает первое число при появлении.
 *
 * Данные в проекте хранятся человеческим текстом, а не числами, — так их
 * проще править. Поэтому компонент сам находит число, запоминает всё, что
 * идёт до и после, и анимирует только цифры.
 *
 * «51 900+»    → докручивает 51 900, дописывает «+»
 * «4.9 / 5.0»  → докручивает 4.9 с одним знаком, дописывает « / 5.0»
 *
 * В разметке сразу лежит финальная строка: без скрипта и при запросе
 * меньшего движения показатель виден целиком.
 */
export function StatValue({ value, className }: StatValueProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (prefersReducedMotion()) return;

    // Первое число в строке: с пробелами-разделителями тысяч или дробное.
    const match = value.match(/(\d[\d\u00a0\u202f ]*(?:[.,]\d+)?)/);
    if (!match) return;

    const raw = match[1];
    const prefix = value.slice(0, match.index ?? 0);
    const suffix = value.slice((match.index ?? 0) + raw.length);

    const normalized = raw.replace(/[\u00a0\u202f ]/g, "").replace(",", ".");
    const target = Number.parseFloat(normalized);
    if (!Number.isFinite(target)) return;

    const decimals = normalized.includes(".")
      ? normalized.split(".")[1]?.length ?? 0
      : 0;

    const format = (input: number) =>
      `${prefix}${input.toLocaleString("ru-RU", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

    let raf = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);

          const started = performance.now();
          const total = 1500;

          const tick = (now: number) => {
            const t = Math.min(1, (now - started) / total);
            // Быстрый набор, мягкая остановка — число «оседает».
            const eased = 1 - Math.pow(1 - t, 3);
            element.textContent = format(target * eased);
            if (t < 1) raf = window.requestAnimationFrame(tick);
          };

          element.textContent = format(0);
          raf = window.requestAnimationFrame(tick);
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
