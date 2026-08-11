"use client";

import { useEffect, useState } from "react";

import { Button } from "./Button";
import styles from "./Header.module.css";

const links = [
  { href: "#works", label: "Работы" },
  { href: "#process", label: "Как работаю" },
  { href: "#about", label: "О себе" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        <a href="#top" className={styles.brand}>
          Ольга Бакушкина
          <span className={styles.brandRole}>графический дизайнер</span>
        </a>

        <nav className={styles.nav} aria-label="Разделы страницы">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>

        <Button href="#contact" className={styles.cta}>
          Связаться
        </Button>
      </div>
    </header>
  );
}
