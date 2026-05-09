import React, { useState } from "react";
import { Link } from "react-router-dom";
import Resume from "../settings/resume.json";
import "./ContactPage.css";
import { SiteNav } from "../components/nav/SiteNav";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const locationCards = [
  { country: "India", city: "Punjab", className: "contact-map-card-india" },
  { country: "Canada", city: "Remote-ready", className: "contact-map-card-canada" },
  { country: "Germany", city: "Global reach", className: "contact-map-card-germany" },
  { country: "Australia", city: "Digital-first", className: "contact-map-card-australia" },
];

export const ContactPage = () => {
  const [formValues, setFormValues] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const safeName = formValues.name || "Portfolio visitor";
    const safeEmail = formValues.email || "Not provided";
    const safeSubject = formValues.subject || `Portfolio message from ${safeName}`;
    const body = encodeURIComponent(
      `Name: ${safeName}\nEmail: ${safeEmail}\nSubject: ${safeSubject}\n\n${formValues.message}`
    );
    const subject = encodeURIComponent(safeSubject);

    window.location.href = `mailto:${Resume.basics.email}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="contact-page">
      <div className="contact-page-shell">
        <div className="contact-page-topbar">
          <Link to="/" className="contact-page-back">
            <span aria-hidden="true">&#8592;</span> Back to Home
          </Link>
          <SiteNav />
          <a className="contact-page-mail" href={`mailto:${Resume.basics.email}`}>
            {Resume.basics.email}
          </a>
        </div>

        <section className="contact-page-card">
          <div className="contact-page-head">
            <p className="contact-page-kicker">Contact us</p>
            <h1>Let&apos;s build something serious.</h1>
            <p>
              Share your idea, startup need, or collaboration plan here. When
              you send the form, it opens a ready-to-send email with your
              message filled in.
            </p>
          </div>

          <div className="contact-page-grid">
            <form className="contact-form-panel" onSubmit={handleSubmit}>
              <label className="contact-form-field">
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formValues.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="contact-form-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formValues.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="contact-form-field">
                <span>Subject</span>
                <input
                  type="text"
                  name="subject"
                  placeholder="What do you want to build?"
                  value={formValues.subject}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="contact-form-field">
                <span>Message</span>
                <textarea
                  name="message"
                  placeholder="Tell me about your idea, project, or collaboration."
                  value={formValues.message}
                  onChange={handleChange}
                  rows={7}
                  required
                />
              </label>

              <button type="submit" className="contact-form-submit">
                Send Message
              </button>
            </form>

            <div className="contact-visual-panel" aria-hidden="true">
              <div className="contact-map-surface">
                <div className="contact-map contact-map-left" />
                <div className="contact-map contact-map-right" />
                <span className="contact-map-dot contact-map-dot-one" />
                <span className="contact-map-dot contact-map-dot-two" />
                <span className="contact-map-dot contact-map-dot-three" />
                <span className="contact-map-dot contact-map-dot-four" />

                {locationCards.map((item) => (
                  <article key={item.country} className={`contact-map-card ${item.className}`}>
                    <strong>{item.country}</strong>
                    <span>{item.city}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
