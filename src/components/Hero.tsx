"use client";

import { useEffect, useRef } from "react";

import { AnimatedHeading } from "./AnimatedHeading";
import { Button } from "./Button";
import { Picture } from "./Picture";
import {
  clamp,
  damp,
  isCoarsePointer,
  isNarrow,
  onFrame,
  onScroll,
  prefersReducedMotion,
} from "@/lib/motion";
import styles from "./Hero.module.css";

/**
 * Первый экран: «полка и лента».
 *
 * Идея та же, что была утверждена, но теперь она живёт. Три слоя движения:
 *
 * 1. Заголовок собирается по строкам — текст выходит из-под линии набора.
 * 2. Упаковка слева стоит как предмет: при скролле она медленно поворачивается
 *    и приподнимается, тень под ней растёт. Это показывает объём вещи.
 * 3. Кадр справа живёт как лента: он чуть отстаёт от скролла и мягко
 *    перетекает вверх, а поверх идёт полоса прогресса просмотра.
 *
 * При движении курсора вся композиция едва заметно сдвигается по параллаксу —
 * предметы реагируют на присутствие человека, но не пляшут.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (prefersReducedMotion()) return;

    const narrow = isNarrow();

    // Скролл: разводим полюса и поворачиваем предмет.
    const stopScroll = onScroll(() => {
      const rect = element.getBoundingClientRect();
      const progress = clamp(-rect.top / Math.max(rect.height, 1));

      element.style.setProperty("--p", progress.toFixed(4));
    });

    if (narrow || isCoarsePointer()) return stopScroll;

    // Курсор: мягкий параллакс всей сцены.
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const stopFrame = onFrame(() => {
      currentX = damp(currentX, targetX, 0.07);
      currentY = damp(currentY, targetY, 0.07);
      element.style.setProperty("--mx", currentX.toFixed(4));
      element.style.setProperty("--my", currentY.toFixed(4));
    });

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      stopScroll();
      stopFrame();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section className={styles.hero} ref={ref}>
      <div className="container">
        <div className={styles.grid}>
          {/* Левый полюс: предмет на полке. */}
          <div className={`${styles.pole} ${styles.shelf}`}>
            <figure className={styles.poleFigure}>
              <div className={styles.shelfStage}>
                <Picture
                  id="ecozavr-09"
                  alt="Эко-гель Ecozavr в корзине с зелёными яблоками — упаковка бренда бытовой химии"
                  sizes="(max-width: 980px) 45vw, 22vw"
                  className={styles.shelfImage}
                  priority
                />
                <span className={styles.shelfShadow} aria-hidden="true" />
              </div>
              <div className={styles.shelfLine} />
              <figcaption className={styles.poleLabel}>Упаковка на полке</figcaption>
            </figure>
          </div>

          {/* Центр: имя, заголовок, действия. */}
          <div className={styles.text}>
            <p className={styles.eyebrow}>
              <span className={styles.dot} aria-hidden="true" />
              Открыта к работе в штате и к проектам
            </p>

            <span className={styles.name}>Ольга Бакушкина</span>

            <AnimatedHeading
              as="h1"
              className={styles.title}
              delay={0.1}
              lines={[
                "Графический дизайнер",
                "полного цикла — от упаковки",
                "на полке до ролика в ленте",
              ]}
            />

            <p className={styles.lead}>
              Айдентика, упаковка и препресс, digital-продукты, соцсети, презентации.
              Отдельная сильная сторона — бренд-персонажи и анимация: веду их от сценария
              до готового видео.
            </p>

            <div className={styles.actions}>
              <Button href="#works">Смотреть работы</Button>
              <Button href="#contact" variant="ghost">
                Связаться
              </Button>
            </div>
          </div>

          {/* Правый полюс: кадр в ленте. */}
          <div className={`${styles.pole} ${styles.feed}`}>
            <figure className={styles.poleFigure}>
              <div className={styles.feedFrame}>
                <div className={styles.feedBar}>
                  <span className={styles.feedMeta}>Лента</span>
                  <span className={styles.feedDots} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
                <div className={styles.feedViewport}>
                  <Picture
                    id="domashniy-03"
                    alt="Маскот телеканала «Домашний» — пташка в кресле с книгой"
                    sizes="(max-width: 980px) 45vw, 22vw"
                    className={styles.feedImage}
                    priority
                  />
                </div>
                <span className={styles.feedProgress} aria-hidden="true">
                  <span className={styles.feedProgressBar} />
                </span>
              </div>
              <figcaption className={styles.poleLabel}>Ролик в ленте</figcaption>
            </figure>
          </div>
        </div>

        <span className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollHintLine} />
          Листайте
        </span>
      </div>
    </section>
  );
}
