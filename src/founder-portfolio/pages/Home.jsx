import React, { useEffect, useState } from "react";
import { PortfolioLink } from "../PortfolioLink";
import Resume from "../settings/resume.json";
import "./Home.css";
import { SiteNav } from "../components/nav/SiteNav";

import Founder from "../assets/recentprojects/founder.png";
import HeroCircle from "../assets/recentprojects/hero-circle.png";
import LinkedInPreview from "../assets/recentprojects/linkedin-preview.png";

const iconUrl = (slug, color = "white") => `https://cdn.simpleicons.org/${slug}/${color}`;
const vajraLaunchDate = new Date("2026-08-15T10:00:00+05:30");

const getCountdownParts = () => {
  const now = new Date();
  const diff = Math.max(vajraLaunchDate.getTime() - now.getTime(), 0);

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    { label: "days", value: String(days).padStart(2, "0") },
    { label: "hours", value: String(hours).padStart(2, "0") },
    { label: "minutes", value: String(minutes).padStart(2, "0") },
    { label: "seconds", value: String(seconds).padStart(2, "0") },
  ];
};

const projects = [
  {
    title: "The Vajra",
    alt: "The Vajra platform preview",
    summary:
      "A future-ready platform concept designed to unify delivery, commerce, and everyday services inside one bold product experience.",
    tags: ["Platform Vision", "Launch Experience", "Founder Product"],
    frame: "laptop",
  },
];

const skillGroups = [
  {
    title: "Product-Led Building",
    description:
      "I approach software like a founder: start with the problem, shape the experience, and build only what moves the product forward.",
    items: [
      { label: "MVP Thinking" },
      { label: "User Flow Design" },
      { label: "Feature Prioritization" },
      { label: "Founder Execution" },
    ],
    tone: "medium",
  },
  {
    title: "Design-Led Frontend",
    description:
      "Clean interfaces are one of my biggest unfair advantages. I care about first impressions, clarity, and product trust.",
    items: [
      { label: "CSS3", iconClass: "fab fa-css3-alt", color: "#1572b6" },
      { label: "React", iconClass: "fab fa-react", color: "#61dafb" },
      { label: "Tailwind", iconUrl: iconUrl("tailwindcss", "06B6D4") },
      { label: "Sass", iconUrl: iconUrl("sass", "CC6699") },
      { label: "Figma", iconClass: "fab fa-figma", color: "#a855f7" },
    ],
    tone: "medium",
  },
  {
    title: "Full-Stack MVP Systems",
    description:
      "From landing pages to application logic, I build the systems needed to get a venture from idea to usable product.",
    items: [
      { label: "JavaScript", iconClass: "fab fa-js", color: "#f7df1e" },
      { label: "TypeScript", iconUrl: iconUrl("typescript", "3178C6") },
      { label: "Python", iconClass: "fab fa-python", color: "#ffd43b" },
      { label: "Node.js", iconClass: "fab fa-node-js", color: "#68a063" },
      { label: "Express", iconUrl: iconUrl("express", "FFFFFF") },
      { label: "Firebase", iconUrl: iconUrl("firebase", "FFCA28") },
    ],
    tone: "large",
  },
  {
    title: "Launch-Ready Presentation",
    description:
      "I use motion, storytelling, and visual hierarchy to make products feel credible before someone even clicks twice.",
    items: [
      { label: "Motion", iconUrl: iconUrl("framer", "BB4B96") },
      { label: "GSAP", iconUrl: iconUrl("greensock", "88CE02") },
      { label: "Spline", iconUrl: iconUrl("spline", "00D18C") },
    ],
    tone: "medium",
  },
  {
    title: "Startup Infrastructure",
    description:
      "I am comfortable with the backend and deployment layer needed to make products stable, demoable, and ready to share.",
    items: [
      { label: "MySQL", iconUrl: iconUrl("mysql", "4479A1") },
      { label: "PostgreSQL", iconUrl: iconUrl("postgresql", "4169E1") },
      { label: "MongoDB", iconUrl: iconUrl("mongodb", "47A248") },
      { label: "Docker", iconClass: "fab fa-docker", color: "#2496ed" },
      { label: "Vercel", iconUrl: iconUrl("vercel", "FFFFFF") },
    ],
    tone: "medium",
  },
  {
    title: "Founder Operating System",
    description:
      "Sports and startup life have trained me for consistency, pressure, ownership, and the messy reality of building from zero.",
    items: [
      { label: "Leadership" },
      { label: "Discipline" },
      { label: "Problem Solving" },
      { label: "Team Building" },
      { label: "Adaptability" },
    ],
    tone: "wide",
  },
];

const socialLinks = [
  { label: "Email", href: `mailto:${Resume.basics.email}`, iconClass: "fas fa-envelope" },
  { label: "Instagram", href: "https://www.instagram.com/devanshudhyanu", iconClass: "fab fa-instagram" },
  { label: "Facebook", href: "https://www.facebook.com/devanshudhyanu", iconClass: "fab fa-facebook-f" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/devanshudhyanu", iconClass: "fab fa-linkedin-in" },
  { label: "GitHub", href: "https://github.com/Devanshu-Dhyanu", iconClass: "fab fa-github" },
  { label: "LeetCode", href: "https://leetcode.com/devanshu_dhyanu13", iconClass: "fas fa-code" },
];

export const Home = () => {
  const phone = Resume.basics.phone || "+91 available on request";
  const firstName = Resume.basics.name.split(" ")[0];
  const startupUrl = "https://www.vajracognixia.in";
  const heroTitleTop = "Founder";
  const heroTitleBottom = "Builder";
  const linkedInUrl = "https://www.linkedin.com/in/devanshudhyanu";
  const [countdownParts, setCountdownParts] = useState(getCountdownParts);
  const collaborationTypes = [
    {
      title: "For startups",
      text:
        "If you need a sharp frontend, landing page, MVP surface, or digital identity that looks serious fast, I can help shape and build it.",
    },
    {
      title: "For founders",
      text:
        "If you are validating an idea, refining a concept, or need a builder who understands both product taste and execution, I am open to the conversation.",
    },
    {
      title: "For collaborations",
      text:
        "If you are a designer, developer, operator, or early-stage team building something meaningful, I am interested in founder-energy partnerships.",
    },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdownParts(getCountdownParts());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const renderSkillToken = (item) => {
    const circleStyle = item.color ? { color: item.color } : undefined;

    if (item.iconClass) {
      return (
        <span key={item.label} className="skill-logo-circle" title={item.label}>
          <i className={item.iconClass} style={circleStyle} aria-hidden="true" />
        </span>
      );
    }

    if (item.iconUrl) {
      return (
        <span key={item.label} className="skill-logo-circle" title={item.label}>
          <img src={item.iconUrl} alt={item.label} className="skill-logo-image" />
        </span>
      );
    }

    if (item.short) {
      return (
        <span
          key={item.label}
          className="skill-logo-circle skill-logo-text"
          style={circleStyle}
          title={item.label}
        >
          {item.short}
        </span>
      );
    }

    return (
      <span key={item.label} className="skill-badge">
        {item.label}
      </span>
    );
  };

  return (
    <main className="portfolio-page">
      <section className="hero-section" id="home">
        <div className="hero-topbar">
          <div className="hero-intro-block">
            <p className="eyebrow">@ Code by {Resume.basics.name}</p>
            <div className="hero-circle-wrap">
              <img
                className="hero-circle-image"
                src={HeroCircle}
                alt={`${Resume.basics.name} portrait`}
              />
              <div className="hero-circle-preview" aria-hidden="true">
                <img
                  className="hero-circle-preview-image"
                  src={HeroCircle}
                  alt=""
                />
              </div>
            </div>
          </div>
          <SiteNav />
          <p className="hero-summary">
            Founder at The VajraCognixia Technologies Private Limited building sharp digital products,
            startup-ready interfaces, and internet experiences that feel
            confident from the first scroll.
          </p>
        </div>

        <div className="hero-media">
          <a className="hero-side-arrow" href="#intro" aria-label="Scroll to intro">
            <span>&#8595;</span>
          </a>
          <p className="hero-center-note">DEVANSHU DHYANU</p>
          <img
            className="hero-feature-image"
            src={Founder}
            alt={`${Resume.basics.name} founder portrait`}
          />
          <a className="hero-arrow" href="#intro" aria-label="Scroll to intro">
            <span>&#8599;</span>
          </a>
          <div className="social-pill" aria-label="Social links">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                className="social-pill-link"
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                title={item.label}
              >
                <i className={item.iconClass} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="hero-title-wrap">
          <p className="hero-kicker">building ventures with taste and speed</p>
          <div className="hero-title-stack">
            <h1 className="hero-title hero-title-top">{heroTitleTop}</h1>
            <h1 className="hero-title hero-title-bottom">
              {heroTitleBottom} <span>&amp;</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="intro-section" id="intro">
        <div className="intro-copy">
          <p>
            I am {Resume.basics.name}, a founder-minded builder creating
            products, brand experiences, and digital systems through
            Vajracognixia. I care about making ideas look serious, feel useful,
            and move fast from concept to execution.
          </p>
        </div>
        <div className="intro-side">
          <p>
            My work sits between product instinct, frontend craft, and founder
            energy. Alongside building ventures, I bring the discipline of a
            national handball athlete and the curiosity of a student still
            learning in public.
          </p>
          <div className="founder-note">
            <strong>Currently building:</strong> Vajracognixia as a venture
            focused on ambitious digital products, startup identity, and modern
            execution.
          </div>
          <PortfolioLink to="/contact" className="text-link">
            Build with me <span>&#8599;</span>
          </PortfolioLink>
          <a
            href={startupUrl}
            className="startup-link"
            target="_blank"
            rel="noreferrer"
          >
            Vajracognixia <span>www.vajracognixia.in</span>
          </a>
        </div>
      </section>

      <section className="works-section" id="works">
        <div className="section-heading-row">
          <h2 className="section-title">What I&apos;m Building</h2>
          <p className="section-note">
            Experiments, assets, and product builds that reflect how I think as
            a founder, not just how I code as a developer.
          </p>
        </div>

        <div className="projects-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.title}>
              <div
                className={`project-image-wrap${
                  project.frame === "laptop" ? " project-image-wrap-laptop" : ""
                }`}
              >
                {project.frame === "laptop" ? (
                  <div className="project-laptop-shell">
                    <div className="project-laptop-camera" aria-hidden="true" />
                    <div className="project-laptop-screen">
                      <div className="vajra-preview" aria-label={project.alt}>
                        <div className="vajra-preview-nav">
                          <div className="vajra-preview-brand">
                            <span className="vajra-preview-mark" aria-hidden="true" />
                            <div>
                              <span className="vajra-preview-brand-top">THE</span>
                              <span className="vajra-preview-brand-main">VAJRA</span>
                            </div>
                          </div>
                          <div className="vajra-preview-links" aria-hidden="true">
                            <span>Why Vajra</span>
                            <span>Vision</span>
                            <span>Founder</span>
                          </div>
                        </div>

                        <div className="vajra-preview-body">
                          <p className="vajra-preview-kicker">Launching soon</p>
                          <h4>Delivering The Future</h4>
                          <p className="vajra-preview-copy">
                            Order food online, buy and sell products, and access
                            everyday services through one future-ready platform.
                          </p>

                          <div className="vajra-preview-countdown-card">
                            <div className="vajra-preview-countdown-copy">
                              <span>Launch countdown</span>
                              <p>The Vajra goes live on 15 August 2026, 10:00 AM IST.</p>
                            </div>
                            <div className="vajra-preview-countdown-grid">
                              {countdownParts.map((part) => (
                                <div key={part.label} className="vajra-preview-countdown-box">
                                  <strong>{part.value}</strong>
                                  <span>{part.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="project-laptop-base" aria-hidden="true" />
                  </div>
                ) : (
                  <img src={project.image} alt={project.alt} />
                )}
              </div>
              <div className="project-footer">
                <div className="project-badge-row">
                  <span className="project-badge">Flagship build</span>
                  <span className="project-badge project-badge-muted">Launches August 2026</span>
                </div>
                <div className="project-copy">
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <div className="project-tags" aria-label={`${project.title} tags`}>
                    {project.tags.map((tag) => (
                      <span key={tag} className="project-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <PortfolioLink
                    className="project-link"
                    to="/vajra"
                  >
                    Explore Vajra <span>&#8599;</span>
                  </PortfolioLink>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="projects-more">
          <PortfolioLink to="/vajra" className="explore-button">
            <span className="explore-dot" />
            Explore more
          </PortfolioLink>
        </div>
      </section>

      <section className="venture-section" id="vajracognixia">
        <div className="section-heading-row venture-heading-row">
          <div>
            <p className="eyebrow">@ About Vajracognixia</p>
            <h2 className="section-title">A founder-led studio in motion</h2>
          </div>
          <p className="section-note">
            I am building Vajracognixia as the place where design taste,
            product instinct, and modern execution meet.
          </p>
        </div>

        <div className="venture-grid">
          <article className="venture-story-card">
            <p className="venture-lead">
              Vajracognixia is my long-term vehicle for turning ambitious ideas
              into polished digital products, launch assets, and startup
              experiences that look ready from day one.
            </p>
            <p>
              It reflects how I want to build: with speed, clarity, and a
              strong sense of presentation. The goal is not just to ship code,
              but to shape products people can trust, share, and rally around.
            </p>
            <a
              href={startupUrl}
              className="venture-link"
              target="_blank"
              rel="noreferrer"
            >
              Visit Vajracognixia <span>&#8599;</span>
            </a>
          </article>

          <div className="venture-principles-card">
            <p className="venture-card-label">Positioning</p>
            <div className="venture-principles">
              <div className="venture-principle">
                <span className="venture-principle-index">&#9711;</span>
                <p>Digital products should feel credible before they explain themselves.</p>
              </div>
              <div className="venture-principle">
                <span className="venture-principle-index">&#9711;</span>
                <p>Speed matters, but taste decides whether people trust what you launch.</p>
              </div>
              <div className="venture-principle">
                <span className="venture-principle-index">&#9711;</span>
                <p>
                  Execution should connect brand, interface, and product clarity in
                  one system.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="venture-aside-card">
          <p className="venture-card-label">What Vajracognixia stands for</p>
          <p className="venture-aside-copy">
            A soft but serious visual language for startup identity, product
            presentation, and founder-led execution.
          </p>
        </div>
      </section>

      <section className="skills-section" id="skills">
        <div className="skills-header">
          <p className="eyebrow">@ Founder toolkit</p>
          <h2 className="skills-title">What I bring to a venture</h2>
        </div>

        <div className="skills-grid">
          {skillGroups.map((group) => (
            <article className={`skill-card skill-card-${group.tone}`} key={group.title}>
              <div className="skill-badges">
                {group.items.map((item) => renderSkillToken(item))}
              </div>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
            </article>
          ))}
        </div>

        <a
          className="linkedin-showcase"
          href={linkedInUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open LinkedIn profile"
        >
          <div className="linkedin-showcase-frame">
            <img src={LinkedInPreview} alt="LinkedIn profile preview" />
            <div className="linkedin-showcase-overlay">
              <span className="linkedin-showcase-kicker">LinkedIn profile</span>
              <strong>See the full founder profile</strong>
            </div>
          </div>
        </a>
      </section>

      <section className="contact-section" id="contact">
        <p className="contact-overline">For founders, startups, and bold ideas.</p>
        <h2 className="contact-title">If you are building something ambitious, let&apos;s talk</h2>

        <div className="contact-funnel">
          {collaborationTypes.map((item) => (
            <article className="contact-funnel-card" key={item.title}>
              <p className="contact-funnel-label">{item.title}</p>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="contact-cta-row">
          <div className="contact-line" />
          <PortfolioLink className="contact-button" to="/contact">
            Start here
          </PortfolioLink>
        </div>

        <div className="contact-meta">
          <div>
            <span>Email:</span>
            <a href={`mailto:${Resume.basics.email}`}>{Resume.basics.email}</a>
          </div>
          <div>
            <span>Phone:</span>
            <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
          </div>
          <div>
            <span>Best for:</span>
            <a href={startupUrl} target="_blank" rel="noreferrer">
              Startup websites, MVP experiences, founder collaborations
            </a>
          </div>
        </div>
      </section>

      <section className="statement-section">
        <p className="hero-kicker">founder energy, product discipline</p>
        <div className="statement-row">
          <h2 className="statement-title">{firstName}</h2>
          <a className="statement-arrow" href="#home" aria-label="Back to top">
            <span>&#8599;</span>
          </a>
        </div>
      </section>
    </main>
  );
};
