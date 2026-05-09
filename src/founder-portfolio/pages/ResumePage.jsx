import React from "react";
import ResumeData from "../settings/resume.json";
import { PortfolioLink } from "../PortfolioLink";
import "./ResumePage.css";

export const ResumePage = () => {
  const { basics, work, education, skills, interests } = ResumeData;

  return (
    <main className="resume-embedded-page">
      <PortfolioLink to="/" className="resume-back">
        Back to portfolio
      </PortfolioLink>

      <header>
        <h1>{basics.name}</h1>
        <p className="muted">
          {basics.label} | {basics.location.city}, {basics.location.region}
        </p>
        <div className="profiles">
          <a href={`mailto:${basics.email}`}>{basics.email}</a>
          {basics.profiles.map((profile) => (
            <a
              key={profile.network}
              href={profile.url}
              target={profile.url.startsWith("http") ? "_blank" : undefined}
              rel={profile.url.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {profile.network}
            </a>
          ))}
        </div>
      </header>

      <section>
        <h2>Professional Summary</h2>
        <p>{basics.description}</p>
        <p>Open to internships, freelance projects, and collaboration.</p>
      </section>

      <section>
        <h2>Technical Skills</h2>
        <ul>
          {skills.map((skill) => (
            <li key={skill.name}>
              <strong>{skill.name}:</strong> {skill.keywords.join(", ")}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Experience</h2>
        {work.map((item) => (
          <div key={item.company}>
            <h3>{item.company}</h3>
            <p>{item.summary}</p>
            <ul>
              {item.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2>Education</h2>
        {education.map((item) => (
          <p key={item.institution}>
            {item.studyType} in {item.area}, {item.institution} ({item.startDate} - {item.endDate})
          </p>
        ))}
      </section>

      <section>
        <h2>Additional</h2>
        <ul>
          {interests.map((item) => (
            <li key={item.name}>
              <strong>{item.name}:</strong> {item.keywords.join(", ")}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};
