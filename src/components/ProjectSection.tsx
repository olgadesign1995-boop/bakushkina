import clsx from "clsx";

import type { Project } from "@/data/projects";

import { Button } from "./Button";
import { Picture } from "./Picture";
import { VideoBlock } from "./VideoBlock";
import styles from "./ProjectSection.module.css";

type ProjectSectionProps = {
  project: Project;
  index: number;
};

/** Один проект: заголовок, обложка, развёртка по четырём шагам, галерея. */
export function ProjectSection({ project, index }: ProjectSectionProps) {
  const headingId = `${project.id}-title`;

  return (
    <article
      id={project.id}
      className={styles.project}
      aria-labelledby={headingId}
      style={{ ["--project-accent" as string]: project.accent }}
    >
      <header className={styles.header}>
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
      </header>

      <div className={styles.cover}>
        <Picture
          id={project.cover}
          alt={project.coverAlt}
          sizes="(max-width: 1240px) 100vw, 1200px"
          className={styles.coverImage}
        />
      </div>

      <div className={styles.steps}>
        <div className={styles.step}>
          <p className={styles.stepLabel}>
            <span className={styles.stepNumber}>01</span> Задача
          </p>
          <p className={styles.stepBody}>{project.task}</p>
        </div>

        <div className={styles.step}>
          <p className={styles.stepLabel}>
            <span className={styles.stepNumber}>02</span> Анализ проблемы
          </p>
          <p className={styles.stepBody}>{project.analysis}</p>
        </div>

        <div className={styles.step}>
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
        </div>

        <div className={styles.step}>
          <p className={styles.stepLabel}>
            <span className={styles.stepNumber}>04</span> Готовое решение
          </p>
          <p className={styles.stepBody}>{project.outcome}</p>
        </div>
      </div>

      {project.stats ? (
        <div className={styles.stats}>
          {project.stats.map((stat) => (
            <div key={stat.value}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      {project.quote ? <blockquote className={styles.quote}>{project.quote}</blockquote> : null}

      {project.note ? <p className={styles.note}>{project.note}</p> : null}

      {project.gallery.length > 0 ? (
        <div className={styles.gallery}>
          {project.gallery.map((item) => (
            <figure
              key={item.image}
              className={clsx(styles.galleryItem, item.wide && styles.wide)}
            >
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
              {item.caption ? (
                <figcaption className={styles.galleryCaption}>{item.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}

      {project.videos && project.videos.length > 0 ? (
        <div className={styles.videos}>
          {project.videos.map((item) => (
            <VideoBlock
              key={item.video}
              id={item.video}
              title={item.title}
              caption={item.caption}
            />
          ))}
        </div>
      ) : null}

      {project.postStats ? (
        <div className={styles.postStats}>
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
        </div>
      ) : null}

      <footer className={styles.footer}>
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
      </footer>
    </article>
  );
}
