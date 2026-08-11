"use client";

import { useEffect, useRef } from "react";

import { Button } from "./Button";
import { Picture } from "./Picture";
import styles from "./Hero.module.css";

/**
 * Первый экран, концепция «Полка и лента».
 * Слева предмет как на полке, справа кадр как в ленте — два полюса из заголовка.
 * При скролле полюса чуть расходятся, освобождая место работам.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 640px)");
    if (reduced.matches || narrow.matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      // 0 в начале, 1 когда герой почти ушёл вверх.
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
      element.style.setProperty("--shelf-shift", `${progress * 34}px`);
      element.style.setProperty("--feed-shift", `${progress * -34}px`);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className={styles.hero} ref={ref}>
      <div className="container">
        <div className={styles.grid}>
          <div className={`${styles.pole} ${styles.shelf}`}>
            <figure className={styles.poleFigure}>
              <Picture
                id="ecozavr-09"
                alt="Эко-гель Ecozavr в корзине с зелёными яблоками — упаковка бренда бытовой химии"
                sizes="(max-width: 980px) 45vw, 22vw"
                className={styles.shelfImage}
                priority
              />
              <div className={styles.shelfLine} />
              <figcaption className={styles.poleLabel}>Упаковка на полке</figcaption>
            </figure>
          </div>

          <div className={styles.text}>
            <p className={styles.eyebrow}>
              <span className={styles.dot} aria-hidden="true" />
              Открыта к работе в штате и к проектам
            </p>
            <h1 className={styles.title}>
              <span className={styles.name}>Ольга Бакушкина</span>
              Графический дизайнер полного цикла — от упаковки на полке до ролика в ленте
            </h1>
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
                <Picture
                  id="domashniy-03"
                  alt="Маскот телеканала «Домашний» — пташка в кресле с книгой"
                  sizes="(max-width: 980px) 45vw, 22vw"
                  className={styles.feedImage}
                  priority
                />
              </div>
              <figcaption className={styles.poleLabel}>Ролик в ленте</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
