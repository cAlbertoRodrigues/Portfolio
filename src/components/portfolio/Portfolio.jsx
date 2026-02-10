import React, { useMemo, useState } from "react";
import "./portfolio.css";
import { useProjects } from "../../hooks/useProjects";

const TABS = [
  { key: "tudo", label: "Tudo" },
  { key: "projeto", label: "Projeto" },
  { key: "criativo", label: "Criativo" },
  { key: "software", label: "Software" },
];

const Portfolio = () => {
  const { loading, error, projects } = useProjects();
  const [active, setActive] = useState("tudo");

  const items = useMemo(() => {
    if (active === "tudo") return projects;
    return projects.filter((p) => p.category === active);
  }, [projects, active]);

  return (
    <section className="work container section" id="work">
      <h2 className="section__title">Trabalhos recentes</h2>

      <div className="work__filters">
        {TABS.map((t) => (
          <span
            key={t.key}
            className={active === t.key ? "work__item active-work" : "work__item"}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </span>
        ))}
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p>{error}</p>}

      <div className="work__container grid">
        {items.map((elem) => {
          const { id, image, title, category, link } = elem;

          return (
            <div className="work__card" key={id}>
              <div className="work__thumbnail">
                <img src={image} alt="" className="work__img" />
                <div className="work__mask"></div>
              </div>

              <span className="work__category">{category}</span>
              <h3 className="work__title">{title}</h3>

              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="work__button"
              >
                <i className="icon-link work__button-icon"></i>
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Portfolio;
