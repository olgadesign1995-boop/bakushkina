"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { damp, isCoarsePointer, isNarrow, onFrame, prefersReducedMotion } from "@/lib/motion";
import styles from "./TiltCard.module.css";

type TiltCardProps = {
  children: ReactNode;
  /** Сила наклона в градусах. Больше 6 выглядит как аттракцион. */
  strength?: number;
  className?: string;
};

/**
 * Карточка, слегка поворачивающаяся вслед за курсором.
 *
 * Задача приёма — вернуть предмету материальность: обложка перестаёт быть
 * плоской картинкой и ведёт себя как лежащий на столе разворот. Именно так
 * работают сетки превью на референсе — вещь реагирует на присутствие руки.
 *
 * Наклон сглажен: значение догоняет цель каждый кадр, поэтому нет дёрганья
 * при быстром движении мыши. На тач-устройствах и при запросе меньшего
 * движения эффект не включается вовсе.
 */
export function TiltCard({ children, strength = 5, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (prefersReducedMotion() || isCoarsePointer() || isNarrow()) return;

    // Цель и текущее значение: разница между ними и даёт инерцию.
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetGlow = 0;
    let currentGlow = 0;
    let inside = false;

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      // Координаты курсора внутри карточки, от -0.5 до 0.5.
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      targetY = px * strength;
      targetX = -py * strength;
      // Блик идёт за курсором.
      element.style.setProperty("--glow-x", `${(px + 0.5) * 100}%`);
      element.style.setProperty("--glow-y", `${(py + 0.5) * 100}%`);
    };

    const onEnter = () => {
      inside = true;
      targetGlow = 1;
    };

    const onLeave = () => {
      inside = false;
      targetX = 0;
      targetY = 0;
      targetGlow = 0;
    };

    const stop = onFrame(() => {
      currentX = damp(currentX, targetX, 0.12);
      currentY = damp(currentY, targetY, 0.12);
      currentGlow = damp(currentGlow, targetGlow, 0.1);

      // Ниже порога — обнуляем, чтобы браузер не держал слой без нужды.
      const idle =
        !inside &&
        Math.abs(currentX) < 0.01 &&
        Math.abs(currentY) < 0.01 &&
        currentGlow < 0.01;

      if (idle) {
        element.style.transform = "";
        element.style.setProperty("--glow", "0");
        return;
      }

      element.style.transform = `perspective(900px) rotateX(${currentX.toFixed(
        3,
      )}deg) rotateY(${currentY.toFixed(3)}deg)`;
      element.style.setProperty("--glow", currentGlow.toFixed(3));
    });

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerenter", onEnter);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={[styles.tilt, className].filter(Boolean).join(" ")}>
      {children}
      <span className={styles.glow} aria-hidden="true" />
    </div>
  );
}
