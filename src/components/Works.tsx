"use client";

import { useMemo, useState } from "react";

import { projectTags, projects, type ProjectTag } from "@/data/projects";

import { ProjectSection } from "./ProjectSection";
import styles from "./Works.module.css";

const ALL = "Все работы" as const;

type Filter = typeof ALL | ProjectTag;

export function Works() {
  const [filter, setFilter] = useState<Filter>(ALL);

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([[ALL, projects.length]]);
    for (const tag of projectTags) {
      map.set(
        tag,
        projects.filter((project) => project.tags.includes(tag)).length,
      );
    }
    return map;
  }, []);

  const visible = useMemo(
    () =>
      filter === ALL
        ? projects
        : projects.filter((project) => project.tags.includes(filter)),
    [filter],
  );

  const options: Filter[] = [ALL, ...projectTags];

  return (
    <section className={styles.section} id="works" aria-labelledby="works-title">
      <div className="container">
        <div className={styles.head}>
          <div className={styles.headText}>
            <h2 id="works-title">Работы</h2>
            <p>
              Каждый проект — с задачей, разбором проблемы, процессом и результатом.
              Отфильтруйте по типу работ, если ищете что-то конкретное.
            </p>
          </div>
        </div>

        <ul className={styles.filter} role="list">
          {options.map((option) => {
            const active = filter === option;
            const count = counts.get(option) ?? 0;
            return (
              <li key={option}>
                <button
                  type="button"
                  className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                  aria-pressed={active}
                  onClick={() => setFilter(option)}
                  disabled={count === 0}
                >
                  {option}
                  <span className={styles.count}>{count}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className={styles.list}>
          {visible.map((project, index) => (
            <ProjectSection key={project.id} project={project} index={index} />
          ))}
        </div>

        {visible.length === 0 ? (
          <p className={styles.empty}>В этой категории пока нет проектов.</p>
        ) : null}
      </div>
    </section>
  );
}
