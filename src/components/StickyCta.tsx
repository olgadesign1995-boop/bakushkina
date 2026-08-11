"use client";

import { useEffect, useState } from "react";

import styles from "./Sections.module.css";

/** Липкая кнопка на мобильном: появляется после первого экрана, прячется у формы. */
export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.8;
      const contact = document.getElementById("contact");
      const nearContact = contact
        ? contact.getBoundingClientRect().top < window.innerHeight * 0.9
        : false;
      setVisible(past && !nearContact);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`${styles.stickyCta} ${visible ? styles.stickyVisible : ""}`}>
      <a href="#contact" className={styles.stickyButton} tabIndex={visible ? 0 : -1}>
        Связаться
      </a>
    </div>
  );
}
