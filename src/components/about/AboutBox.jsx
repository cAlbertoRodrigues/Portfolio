import React from "react";

const AboutBox = ({ projectsCompleted }) => {
  return (
    <div className="about__boxes grid">
      <div className="about__box">
        <i className="about__icon icon-fire"></i>
        <div>
          <h3 className="about__title">{projectsCompleted ?? "..."}</h3>
          <span className="about__subtitle">Projetos concluídos</span>
        </div>
      </div>

      <div className="about__box">
        <i className="about__icon icon-cup"></i>
        <div>
          <h3 className="about__title">5670</h3>
          <span className="about__subtitle">Xícara de café</span>
        </div>
      </div>

      <div className="about__box">
        <i className="about__icon icon-people"></i>
        <div>
          <h3 className="about__title">46</h3>
          <span className="about__subtitle">Clientes satisfeitos</span>
        </div>
      </div>
    </div>
  );
};

export default AboutBox;
