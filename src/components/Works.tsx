"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { projectTags, projects, type ProjectTag } from "@/data/projects";
import { prefersReducedMotion } from "@/lib/motion";

import { AnimatedHeading } from "./AnimatedHeading";
import { ProjectSection } from "./ProjectSection";
import { Reveal } from "./Reveal";
import styles from "./Works.module.css";

const ALL = "Все работы" as const;

type Filter = typeof ALL | ProjectTag;

export function Works() {
  const [filter, setFilter] = useState<Filter>(ALL);
  // Ключ смены: заставляет список переигрывать появление после фильтрации.
  const [pass, setPass] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

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

  // После смены фильтра список коротко «вздыхает»: гаснет и возвращается.
  useEffect(() => {
    const element = listRef.current;
    if (!element) return;
    if (prefersReducedMotion()) return;

    element.classList.remove(styles.listIn);
    // Пересчёт стилей, иначе браузер склеит удаление и добавление класса.
    void element.offsetWidth;
    element.classList.add(styles.listIn);
  }, [pass]);

  const choose = (option: Filter) => {
    if (option === filter) return;
    setFilter(option);
    setPass((value) => value + 1);
  };

  return (
    <section className={styles.section} id="works" aria-labelledby="works-title">
      <div className="container">
        <div className={styles.head}>
          <div className={styles.headText}>
            <AnimatedHeading as="h2" id="works-title" lines={["Работы"]} />
            <Reveal as="p" delay={0.12}>
              Каждый проект — с задачей, разбором проблемы, процессом и результатом.
              Отфильтруйте по типу работ, если ищете что-то конкретное.
            </Reveal>
          </div>
        </div>

        <Reveal as="ul" variant="fade" className={styles.filter} delay={0.16}>
          {options.map((option) => {
            const active = filter === option;
            const count = counts.get(option) ?? 0;
            return (
              <li key={option}>
                <button
                  type="button"
                  className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                  aria-pressed={active}
                  onClick={() => choose(option)}
                  disabled={count === 0}
                >
                  {option}
                  <span className={styles.count}>{count}</span>
                </button>
              </li>
            );
          })}
        </Reveal>

        <div className={styles.list} ref={listRef}>
          {visible.map((project, index) => (
            <ProjectSection
              key={`${pass}-${project.id}`}
              project={project}
              index={index}
            />
          ))}
        </div>

        {visible.length === 0 ? (
          <p className={styles.empty}>В этой категории пока нет проектов.</p>
        ) : null}
      </div>
    </section>
  );
}
