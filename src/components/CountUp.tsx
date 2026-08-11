"use client";

import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "@/lib/motion";

type CountUpProps = {
  /** Итоговое число. */
  value: number;
  /** Что дописать после числа: «+», «К», « / 5.0». */
  suffix?: string;
  /** Знаков после запятой. */
  decimals?: number;
  className?: string;
};

/**
 * Число, которое докручивается до значения при появлении в экране.
 *
 * Смысл приёма: цифры результата — самое ценное в кейсе, и движение
 * заставляет взгляд на них задержаться. Докрутка идёт по замедляющейся
 * кривой, поэтому финальное значение успевает «осесть».
 *
 * Итоговое значение сразу лежит в разметке — если скрипт не выполнится
 * или пользователь просит меньше движения, число всё равно на месте.
 */
export function CountUp({ value, suffix = "", decimals = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (prefersReducedMotion()) return;

    const format = (input: number) =>
      `${input.toLocaleString("ru-RU", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);

          const started = performance.now();
          const total = 1400;
          let raf = 0;

          const tick = (now: number) => {
            const t = Math.min(1, (now - started) / total);
            // Замедление к концу: быстро набирает, мягко останавливается.
            const eased = 1 - Math.pow(1 - t, 3);
            element.textContent = format(value * eased);
            if (t < 1) raf = window.requestAnimationFrame(tick);
          };

          element.textContent = format(0);
          raf = window.requestAnimationFrame(tick);

          return () => window.cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value, suffix, decimals]);

  return (
    <span ref={ref} className={className}>
      {`${value.toLocaleString("ru-RU", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`}
    </span>
  );
}
