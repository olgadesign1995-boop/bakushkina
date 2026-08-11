import { ContactForm } from "@/components/ContactForm";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StickyCta } from "@/components/StickyCta";
import { Works } from "@/components/Works";
import styles from "@/components/Sections.module.css";
import { experience } from "@/data/projects";

const scope = [
  "Айдентика",
  "Упаковка и препресс",
  "POS и наружка",
  "Digital и соцсети",
  "Презентации и инфографика",
  "Бренд-персонажи",
  "Анимация и видео",
];

const tools = [
  { label: "Графика", value: "Adobe Illustrator, Adobe Photoshop, Figma" },
  { label: "Видео и звук", value: "CapCut" },
  { label: "Презентации", value: "MS PowerPoint" },
  { label: "Web", value: "Tilda, Readymag, Taplink" },
];

const contacts = [
  { label: "Почта", value: "bakushkina.olya@mail.ru", href: "mailto:bakushkina.olya@mail.ru" },
  { label: "Telegram", value: "@Olyadsgn", href: "https://t.me/Olyadsgn" },
  { label: "Телефон", value: "+7 977 351 47 11", href: "tel:+79773514711" },
];

export default function Home() {
  return (
    <>
      <a href="#works" className="skip-link">
        Перейти к работам
      </a>

      <Header />

      <main id="top">
        <Hero />

        <div className={styles.scope}>
          <div className={`container ${styles.scopeInner}`}>
            {scope.map((item) => (
              <span key={item} className={styles.scopeItem}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <Works />

        <section className={styles.process} id="process" aria-labelledby="process-title">
          <div className="container">
            <div className={styles.processGrid}>
              <div>
                <h2 id="process-title">Как устроена работа</h2>
                <p className={styles.processLead}>
                  Начинаю не с картинки, а с задачи: что человек должен понять, где он
                  теряет внимание, что мешает продукту на полке или в ленте. Дальше —
                  концепция, эскизы, согласование, финальная сборка и подготовка к
                  продакшну: препресс для печати, адаптации для digital, монтаж и звук для
                  видео.
                </p>

                <div className={styles.aiBlock}>
                  <p className={styles.aiTitle}>Место нейросетей в этом процессе</p>
                  <p>
                    Нейросети ускоряют перебор: там, где раньше заказчик видел два-три
                    концепта, сейчас он получает пятнадцать-двадцать направлений за то же
                    время. Но генерация — это черновик. Она плывёт в деталях: ломает
                    пропорции, теряет фирменные элементы, путает мелкую графику.
                  </p>
                  <p>
                    Всё, что идёт в финал, я дорабатываю руками в Illustrator и Photoshop.
                    Ценность не в том, чтобы получить красивый кадр, а в том, чтобы знать,
                    какие из двадцати вариантов выбросить.
                  </p>
                </div>

                <p className={styles.limit}>
                  Свои модели не обучаю и код не пишу — работаю на готовых сервисах и
                  ручном продакшне.
                </p>
              </div>

              <div className={styles.tools}>
                {tools.map((tool) => (
                  <div key={tool.label} className={styles.toolGroup}>
                    <span className={styles.toolLabel}>{tool.label}</span>
                    <p className={styles.toolValue}>{tool.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.about} id="about" aria-labelledby="about-title">
          <div className="container">
            <div className={styles.aboutGrid}>
              <div className={styles.aboutText}>
                <h2 id="about-title">О себе</h2>
                <p>
                  Меня зовут Ольга. Я графический дизайнер: делаю то, что можно взять в
                  руки — упаковку, этикетки, полиграфию, — и то, что живёт на экране:
                  креативы, соцсети, презентации, анимацию. Люблю задачи, где нужно
                  придумать характер: персонажа, который потом работает за бренд в десятках
                  материалов.
                </p>
                <p>
                  Работала в наружной рекламе, в производстве бытовой химии, на федеральном
                  телеканале и в страховании — поэтому одинаково спокойно отношусь и к
                  препрессу, и к гайдбуку, и к сжатым срокам.
                </p>
                <ul className={styles.facts}>
                  <li className={styles.fact}>Москва, UTC+3</li>
                  <li className={styles.fact}>Гибрид, офис, удалённо</li>
                  <li className={styles.fact}>Готова к переезду и командировкам</li>
                  <li className={styles.fact}>Русский родной, английский B1</li>
                </ul>
              </div>

              <div>
                <h3>Опыт</h3>
                <div className={styles.experience}>
                  {experience.map((item) => (
                    <div key={item.period} className={styles.expItem}>
                      <span className={styles.expPeriod}>{item.period}</span>
                      <span className={styles.expCompany}>{item.company}</span>
                      <span className={styles.expRole}>{item.role}</span>
                      <p className={styles.expDetails}>{item.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.contact} id="contact" aria-labelledby="contact-title">
          <div className="container">
            <div className={styles.contactGrid}>
              <div>
                <h2 id="contact-title">Давайте поговорим</h2>
                <p className={styles.contactLead}>
                  Открыта к работе в штате и к проектам. Напишите удобным способом —
                  отвечу.
                </p>
                <ul className={styles.directList}>
                  {contacts.map((contact) => (
                    <li key={contact.label}>
                      <a className={styles.directLink} href={contact.href}>
                        <span className={styles.directLabel}>{contact.label}</span>
                        <span className={styles.directValue}>{contact.value}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <span>© {new Date().getFullYear()} Ольга Бакушкина</span>
          <div className={styles.footerLinks}>
            <a href="mailto:bakushkina.olya@mail.ru">bakushkina.olya@mail.ru</a>
            <a href="https://t.me/Olyadsgn" target="_blank" rel="noreferrer noopener">
              Telegram
            </a>
            <a href="tel:+79773514711">+7 977 351 47 11</a>
          </div>
        </div>
      </footer>

      <StickyCta />
    </>
  );
}
