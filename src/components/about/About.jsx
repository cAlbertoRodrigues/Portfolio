import React from "react";
import "./about.css";
import Image from "../../assets/avatar-1.svg";
import AboutBox from "./AboutBox";
import { useGithubStats } from "../../hooks/useGithubStats";

const About = () => {
  const { loading, error, stats } = useGithubStats();

  const langs = stats.topLanguages || [];
  const l1 = langs[0];
  const l2 = langs[1];
  const l3 = langs[2];

  return (
    <section className="about container section" id="about">
      <h2 className="section__title">About Me</h2>

      <div className="about__container grid">
        <img src={Image} alt="" className="about__img" />

        <div className="about__data grid">
          <div className="about__info">
            <p className="about__description">
              I am Carlos Alberto, a Full-Stack Developer from Rio de Janeiro, Brazil. I have solid experience in web design, application development, and customization, as well as strong skills in backend technologies.
            </p>
            <button type="button" className="btn">
              Download CV
            </button>
          </div>

          <div className="about__skills grid">
            <div className="skills__data">
              <div className="skills__titles">
                <h3 className="skills__name">
                  {loading ? "Carregando..." : error ? "Falha ao carregar" : l1?.name || "-"}
                </h3>
                <span className="skills__number">
                  {loading ? "..." : error ? "--" : `${l1?.percent ?? 0}%`}
                </span>
              </div>

              <div className="skills__bar">
                <span
                  className="skills__percentage lang__1"
                  style={{ width: `${loading || error ? 0 : l1?.percent ?? 0}%` }}
                ></span>
              </div>
            </div>

            <div className="skills__data">
              <div className="skills__titles">
                <h3 className="skills__name">
                  {loading ? "Carregando..." : error ? "Falha ao carregar" : l2?.name || "-"}
                </h3>
                <span className="skills__number">
                  {loading ? "..." : error ? "--" : `${l2?.percent ?? 0}%`}
                </span>
              </div>

              <div className="skills__bar">
                <span
                  className="skills__percentage lang__2"
                  style={{ width: `${loading || error ? 0 : l2?.percent ?? 0}%` }}
                ></span>
              </div>
            </div>

            <div className="skills__data">
              <div className="skills__titles">
                <h3 className="skills__name">
                  {loading ? "Carregando..." : error ? "Falha ao carregar" : l3?.name || "-"}
                </h3>
                <span className="skills__number">
                  {loading ? "..." : error ? "--" : `${l3?.percent ?? 0}%`}
                </span>
              </div>

              <div className="skills__bar">
                <span
                  className="skills__percentage lang__3"
                  style={{ width: `${loading || error ? 0 : l3?.percent ?? 0}%` }}
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AboutBox projectsCompleted={loading || error ? null : stats.projectsCompleted} />
    </section>
  );
};

export default About;
