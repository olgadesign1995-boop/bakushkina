import clsx from "clsx";

import type { Project } from "@/data/projects";
import { stagger } from "@/lib/motion";

import { Button } from "./Button";
import { Picture } from "./Picture";
import { Reveal } from "./Reveal";
import { StatValue } from "./StatValue";
import { TiltCard } from "./TiltCard";
import { VideoBlock } from "./VideoBlock";
import styles from "./ProjectSection.module.css";

type ProjectSectionProps = {
  project: Project;
  index: number;
};

/**
 * Один проект: заголовок, обложка, развёртка по четырём шагам, галерея.
 *
 * Движение здесь работает на чтение, а не на эффект:
 * — обложка наклоняется под курсором, возвращая работе материальность;
 * — шаги разбора появляются по очереди, поэтому взгляд идёт сверху вниз;
 * — цифры результата докручиваются, задерживая внимание на главном;
 * — кадры галереи открываются шторкой, как проявляющаяся печать.
 */
export function ProjectSection({ project, index }: ProjectSectionProps) {
  const headingId = `${project.id}-title`;

  return (
    <article
      id={project.id}
      className={styles.project}
      aria-labelledby={headingId}
      style={{ ["--project-accent" as string]: project.accent }}
    >
      <Reveal as="header" className={styles.header}>
        <div>
          <p className={styles.meta}>
            <span className={styles.accentBar} aria-hidden="true" />
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span>{project.client}</span>
            {project.period ? <span>{project.period}</span> : null}
          </p>
          <h3 className={styles.title} id={headingId}>
            {project.title}
          </h3>
          <p className={styles.summary}>{project.summary}</p>
        </div>
        <ul className={styles.tags}>
          {project.tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              {tag}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal variant="scale" className={styles.coverReveal}>
        <TiltCard className={styles.cover} strength={4}>
          <Picture
            id={project.cover}
            alt={project.coverAlt}
            sizes="(max-width: 1240px) 100vw, 1200px"
            className={styles.coverImage}
          />
        </TiltCard>
      </Reveal>

      <div className={styles.steps}>
        <Reveal className={styles.step} delay={0}>
          <p className={styles.stepLabel}>
            <span className={styles.stepNumber}>01</span> Задача
          </p>
          <p className={styles.stepBody}>{project.task}</p>
        </Reveal>

        <Reveal className={styles.step} delay={stagger.line}>
          <p className={styles.stepLabel}>
            <span className={styles.stepNumber}>02</span> Анализ проблемы
          </p>
          <p className={styles.stepBody}>{project.analysis}</p>
        </Reveal>

        <Reveal className={styles.step} delay={stagger.line * 2}>
          <p className={styles.stepLabel}>
            <span className={styles.stepNumber}>03</span> Процесс
          </p>
          <ul className={styles.processList}>
            {project.process.map((item) => (
              <li key={item} className={styles.processItem}>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className={styles.step} delay={stagger.line * 3}>
          <p className={styles.stepLabel}>
            <span className={styles.stepNumber}>04</span> Готовое решение
          </p>
          <p className={styles.stepBody}>{project.outcome}</p>
        </Reveal>
      </div>

      {project.stats ? (
        <Reveal className={styles.stats}>
          {project.stats.map((stat) => (
            <div key={stat.value}>
              <StatValue value={stat.value} className={styles.statValue} />
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </Reveal>
      ) : null}

      {project.quote ? (
        <Reveal as="blockquote" className={styles.quote}>
          {project.quote}
        </Reveal>
      ) : null}

      {project.note ? (
        <Reveal as="p" variant="fade" className={styles.note}>
          {project.note}
        </Reveal>
      ) : null}

      {project.gallery.length > 0 ? (
        <div className={styles.gallery}>
          {project.gallery.map((item, galleryIndex) => (
            <Reveal
              key={item.image}
              as="figure"
              variant="mask"
              // Внутри ряда кадры открываются по очереди, но очередь короткая:
              // после третьего задержка сбрасывается, иначе низ ждёт слишком долго.
              delay={(galleryIndex % 3) * stagger.card}
              className={clsx(styles.galleryItem, item.wide && styles.wide)}
            >
              <TiltCard className={styles.galleryTilt} strength={3}>
                <Picture
                  id={item.image}
                  alt={item.alt}
                  sizes={
                    item.wide
                      ? "(max-width: 640px) 100vw, (max-width: 900px) 100vw, 780px"
                      : "(max-width: 640px) 100vw, (max-width: 900px) 50vw, 390px"
                  }
                  className={styles.galleryImage}
                />
              </TiltCard>
              {item.caption ? (
                <figcaption className={styles.galleryCaption}>{item.caption}</figcaption>
              ) : null}
            </Reveal>
          ))}
        </div>
      ) : null}

      {project.videos && project.videos.length > 0 ? (
        <div className={styles.videos}>
          {project.videos.map((item) => (
            <Reveal key={item.video} variant="scale">
              <VideoBlock id={item.video} title={item.title} caption={item.caption} />
            </Reveal>
          ))}
        </div>
      ) : null}

      {project.postStats ? (
        <Reveal className={styles.postStats}>
          <p className={styles.postStatsTitle}>{project.postStats.note}</p>
          <table className={styles.postStatsTable}>
            <thead>
              <tr>
                <th scope="col">Материал</th>
                <th scope="col">Показатели</th>
              </tr>
            </thead>
            <tbody>
              {project.postStats.rows.map((row) => (
                <tr key={row.material}>
                  <td>{row.material}</td>
                  <td>{row.values}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      ) : null}

      <Reveal as="footer" variant="fade" className={styles.footer}>
        <Button href="#contact" variant="ghost">
          Обсудить похожую задачу
        </Button>
        {project.link ? (
          <a
            className={styles.externalLink}
            href={project.link.href}
            target="_blank"
            rel="noreferrer noopener"
          >
            {project.link.label} ↗
          </a>
        ) : null}
      </Reveal>
    </article>
  );
}
