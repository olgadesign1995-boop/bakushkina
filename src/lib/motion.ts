/**
 * Ядро движения сайта.
 *
 * Один источник правды для всех анимаций: длительности, кривые, задержки.
 * Любой компонент берёт значения отсюда, поэтому движение по всей странице
 * ощущается как одна система, а не как набор случайных эффектов.
 *
 * Правило проекта: движение подчинено смыслу. Оно показывает материю работ
 * (упаковку, кадр, разворот), а не украшает пустоту.
 */

/** Базовые длительности, секунды. */
export const duration = {
  /** Микрореакция: наведение, нажатие. */
  micro: 0.22,
  /** Появление элемента. */
  enter: 0.72,
  /** Крупный перестроечный переход. */
  shift: 1.05,
} as const;

/**
 * Кривые. `soft` — основная: быстрый старт, длинное успокоение.
 * Так движение читается как «материал приходит в покой», а не как рывок.
 */
export const ease = {
  soft: [0.16, 0.84, 0.24, 1] as const,
  softCss: "cubic-bezier(0.16, 0.84, 0.24, 1)",
  outCss: "cubic-bezier(0.22, 0.61, 0.36, 1)",
} as const;

/** Шаг задержки между соседними элементами в очереди появления. */
export const stagger = {
  line: 0.075,
  card: 0.09,
  word: 0.035,
} as const;

/** Пользователь просит меньше движения — уважаем. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Узкий экран: тяжёлые эффекты (наклон, крупный параллакс) там не нужны. */
export function isNarrow(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 900px)").matches;
}

/** Устройство без точного указателя — наклон и курсорные эффекты отключаем. */
export function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Плавное приближение значения к цели. Даёт инерцию без физического движка:
 * значение догоняет цель каждый кадр, а не прыгает к ней.
 */
export function damp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

/** Ограничение значения диапазоном. */
export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Прогресс прохождения элемента через экран: 0 — только показался снизу,
 * 1 — полностью ушёл вверх. Основа всех скролл-сценариев на сайте.
 */
export function scrollProgress(rect: DOMRect, viewportHeight: number): number {
  const total = rect.height + viewportHeight;
  const passed = viewportHeight - rect.top;
  return clamp(passed / total);
}

/**
 * Подписка на кадры анимации с автоматической остановкой.
 * Возвращает функцию отписки — её отдаём в cleanup эффекта.
 */
export function onFrame(callback: () => void): () => void {
  let raf = 0;
  let alive = true;

  const tick = () => {
    if (!alive) return;
    callback();
    raf = window.requestAnimationFrame(tick);
  };

  raf = window.requestAnimationFrame(tick);

  return () => {
    alive = false;
    if (raf) window.cancelAnimationFrame(raf);
  };
}

/**
 * Экономная подписка на скролл: колбэк вызывается не чаще одного раза за кадр.
 */
export function onScroll(callback: () => void): () => void {
  let raf = 0;

  const handler = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      raf = 0;
      callback();
    });
  };

  callback();
  window.addEventListener("scroll", handler, { passive: true });
  window.addEventListener("resize", handler, { passive: true });

  return () => {
    window.removeEventListener("scroll", handler);
    window.removeEventListener("resize", handler);
    if (raf) window.cancelAnimationFrame(raf);
  };
}
