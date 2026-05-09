import React from "react";
import { Link } from "react-router-dom";
import "./Vajra.css";
import VajraCoverBg from "../assets/vajra/vajra-cover-bg.png";
import { SiteNav } from "../components/nav/SiteNav";

const sections = [
  { index: "01", title: "Overview" },
  { index: "02", title: "Why Vajra Is Different" },
  { index: "03", title: "How It Works" },
  { index: "04", title: "For Users" },
  { index: "05", title: "For Vendors" },
  { index: "06", title: "Launch Vision" },
];

const differentiators = [
  {
    title: "One product for multiple daily actions",
    text:
      "Vajra is being shaped so food ordering, product discovery, and useful services feel like one connected product journey instead of separate digital habits.",
  },
  {
    title: "No unnecessary middle layer",
    text:
      "The delivery vision is stronger because Vajra is built around direct coordination and drone-based fulfillment, reducing the usual middle-man friction between vendor and customer.",
  },
  {
    title: "Founder-led product taste",
    text:
      "Vajra is being built with presentation, trust, and usability in mind so the platform feels credible before it needs to explain itself too much.",
  },
];

const flowSteps = [
  {
    title: "Discover",
    text:
      "Users land on Vajra and explore food, products, or local services from one entry point instead of switching between different apps.",
  },
  {
    title: "Compare",
    text:
      "They review options, pricing, and relevance in a simpler environment designed to reduce clutter and make choices easier.",
  },
  {
    title: "Order or connect",
    text:
      "Whether the action is ordering food, buying a product, or reaching a service provider, Vajra acts as the central action layer.",
  },
  {
    title: "Track and return",
    text:
      "The product should build repeat trust through clarity, updates, and an experience strong enough to bring users back again.",
  },
];

const operationalFlows = [
  {
    title: "Food order flow",
    text:
      "A user selects a restaurant, customizes the order, confirms delivery details, and receives live status as the order moves toward drone-based fulfillment.",
  },
  {
    title: "Service booking flow",
    text:
      "A user chooses a service category, reviews providers, checks availability or response terms, and submits a request through one guided interaction.",
  },
  {
    title: "Product commerce flow",
    text:
      "A user discovers a relevant product, compares options, places an order, and follows updates without leaving the Vajra ecosystem.",
  },
];

const userBenefits = [
  {
    title: "Order food faster",
    text:
      "Vajra should help users discover nearby food options and place orders without the usual clutter and decision fatigue.",
  },
  {
    title: "Explore useful products",
    text:
      "People can browse products in the same platform where they already handle other needs, making discovery feel more natural.",
  },
  {
    title: "Find local services",
    text:
      "Practical service access should feel easier, more structured, and more dependable than fragmented search behavior.",
  },
  {
    title: "Use one trusted destination",
    text:
      "The long-term user value is simple: less app switching, less confusion, and more confidence in daily digital actions.",
  },
];

const vendorBenefits = [
  {
    title: "Stronger presentation",
    text:
      "Restaurants, sellers, and service providers should look more credible inside Vajra than they would in a noisy, low-trust environment.",
  },
  {
    title: "More direct fulfillment",
    text:
      "With drone-led delivery in the model, Vajra can reduce unnecessary delivery dependency layers and move closer to a direct vendor-to-customer experience.",
  },
  {
    title: "A platform that can scale",
    text:
      "Vajra is meant to grow category by category, giving vendors a place that can mature with them instead of feeling temporary.",
  },
];

const vendorFlows = [
  {
    title: "Onboarding",
    text:
      "Restaurants, sellers, and service providers join Vajra with structured business details, category selection, and a cleaner public-facing profile.",
  },
  {
    title: "Listing and management",
    text:
      "Vendors manage menus, products, pricing, availability, and service details so users always see current and decision-ready information.",
  },
  {
    title: "Order and request handling",
    text:
      "Once a customer acts, vendors receive the order or lead clearly, respond faster, and move through fulfillment with less confusion.",
  },
];

const trustSignals = [
  {
    title: "Clear status updates",
    text:
      "Users should know whether an order is confirmed, in progress, dispatched, or completed without guessing what is happening next.",
  },
  {
    title: "Stronger listing quality",
    text:
      "Better structure, cleaner presentation, and category discipline help both users and vendors trust what they are seeing.",
  },
  {
    title: "Repeat-use readiness",
    text:
      "Saved context, simpler reordering, and familiar flows can make Vajra feel worth returning to instead of starting from zero each time.",
  },
];

const platformSystems = [
  {
    title: "Payments layer",
    text:
      "Vajra should eventually support a smooth payment experience so ordering, booking, and buying feel complete inside one trusted system.",
  },
  {
    title: "Drone routing and updates",
    text:
      "Users and vendors should receive clear confirmation, dispatch, route, and completion signals so drone-led delivery never feels invisible or uncertain.",
  },
  {
    title: "Dashboard readiness",
    text:
      "A future dashboard layer can give customers order history and give vendors a simple control surface for listings, requests, and activity.",
  },
];

const trackingTimeline = [
  {
    title: "Placed",
    text:
      "The request or order is submitted and instantly confirmed with a clear next-step signal.",
  },
  {
    title: "Accepted",
    text:
      "The vendor confirms the order and the system prepares it for direct fulfillment so the user knows the request is actively moving forward.",
  },
  {
    title: "Drone in transit",
    text:
      "After preparation and dispatch, the user can track the delivery as it moves through the drone fulfillment stage.",
  },
  {
    title: "Completed",
    text:
      "The action closes cleanly, opening the door for rating, repeat ordering, or continued engagement later.",
  },
];

const marketReasons = [
  {
    title: "Built for local behavior",
    text:
      "Vajra is meant to reflect how people actually handle everyday needs in local markets where convenience, trust, and speed matter together.",
  },
  {
    title: "Reduced middle-man dependency",
    text:
      "By combining platform coordination with drone-based delivery, Vajra can aim for a cleaner vendor-to-customer path instead of relying on too many human intermediaries.",
  },
  {
    title: "A brand people can recognize",
    text:
      "Clear product language and stronger presentation help Vajra stand out not just as a function, but as a platform people remember.",
  },
];

const launchRoadmap = [
  {
    title: "Phase 1",
    text:
      "Launch Vajra with a strong product story and a clear explanation of what users can do inside the platform.",
  },
  {
    title: "Phase 2",
    text:
      "Sharpen core journeys across food, product discovery, and everyday services so the user flow feels instantly understandable.",
  },
  {
    title: "Phase 3",
    text:
      "Improve trust, retention, and repeat usage until Vajra feels reliable enough to become part of daily behavior.",
  },
];

export const Vajra = () => {
  return (
    <main className="vajra-page">
      <aside className="vajra-sidebar">
        <Link to="/" className="vajra-redo-link">
          <span aria-hidden="true">&#8634;</span> Back
        </Link>

        <nav className="vajra-sidebar-nav" aria-label="Vajra product sections">
          {sections.map((item) => (
            <a key={item.index} href={`#section-${item.index}`} className="vajra-sidebar-link">
              <strong>{item.title}</strong>
              <span>{item.index}</span>
            </a>
          ))}
        </nav>

        <div className="vajra-sidebar-footer">
          <a href="#section-03">How Vajra Works</a>
          <Link to="/contact">Contact Us</Link>
        </div>
      </aside>

      <section className="vajra-content">
        <div className="vajra-page-nav">
          <SiteNav />
        </div>

        <section className="vajra-cover vajra-panel">
          <div
            className="vajra-cover-art"
            style={{
              backgroundImage: `linear-gradient(rgba(15, 24, 36, 0.28), rgba(15, 24, 36, 0.38)), url(${VajraCoverBg})`,
            }}
          >
            <div className="vajra-cover-mark" aria-hidden="true">
              <span>&#10149;</span>
            </div>
            <h1>The Vajra</h1>
          </div>

          <div className="vajra-cover-footer">
            <h2>One platform for food, products, and everyday services</h2>
            <p>
              Vajra is positioned as a serious multi-utility platform where
              daily actions feel more connected, more trustworthy, and easier to
              complete.
            </p>
          </div>
        </section>

        <section className="vajra-panel vajra-intro" id="section-01">
          <div className="vajra-intro-copy">
            <p>
              Vajra is a product vision built around one clear idea: people
              should not need a different digital environment for every small
              daily task. Food ordering, product discovery, and practical
              service access can live inside one better system.
            </p>
            <p>
              Instead of feeling like another single-category app, Vajra is
              designed to become a stronger utility layer with cleaner flow,
              sharper presentation, and more confidence in how users move from
              intent to action.
            </p>
          </div>

          <div className="vajra-contents">
            <h3>Inside Vajra</h3>
            <div className="vajra-contents-list">
              {sections.map((item) => (
                <div key={item.index} className="vajra-contents-row">
                  <span>{item.index}</span>
                  <strong>{item.title}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="vajra-panel vajra-section-lead" id="section-02">
          <div className="vajra-section-title">
            <span>02</span>
            <h2>Why Vajra Is Different</h2>
          </div>

          <div className="vajra-section-copy">
            <p>
              Vajra is not trying to copy one app category and stop there. The
              real difference is that it treats food, commerce, and services as
              related user behavior instead of isolated products.
            </p>
            <p>
              That creates room for a platform that feels more unified, more
              useful, and more intentional than the fragmented patterns people
              already deal with.
            </p>
            <p>
              A key part of that difference is the delivery model itself:
              Vajra’s vision includes drone-based delivery so the system can
              reduce middle-man dependency and move closer to direct execution.
            </p>
          </div>
        </section>

        <section className="vajra-panel vajra-personality-grid">
          <div className="vajra-word-cloud" aria-hidden="true">
            <span className="vajra-word vajra-word-blue">Unified</span>
            <span className="vajra-word vajra-word-orange">Useful</span>
            <span className="vajra-word vajra-word-navy">Modern</span>
            <span className="vajra-word vajra-word-amber">Credible</span>
          </div>

          <div className="vajra-principles">
            <h3>Why the product stands out</h3>
            <div className="vajra-principle-list">
              {differentiators.map((item) => (
                <article key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="vajra-panel vajra-copy-grid" id="section-03">
          <h3>How Vajra Works</h3>
          <div className="vajra-copy-columns">
            {flowSteps.map((step) => (
              <article key={step.title}>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="vajra-panel vajra-copy-grid">
          <h3>Core product flows</h3>
          <div className="vajra-copy-columns">
            {operationalFlows.map((flow) => (
              <article key={flow.title}>
                <strong>{flow.title}</strong>
                <p>{flow.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="vajra-panel vajra-section-lead" id="section-04">
          <div className="vajra-section-title">
            <span>04</span>
            <h2>For Users</h2>
          </div>

          <div className="vajra-section-copy">
            <p>
              On the user side, Vajra should feel practical from the very first
              session. The platform is meant to help people act faster, compare
              more clearly, and handle common needs without unnecessary noise.
            </p>
            <p>
              The user story is not just convenience. It is convenience with
              better trust, better presentation, and a simpler journey.
            </p>
          </div>
        </section>

        <section className="vajra-panel vajra-color-grid">
          {userBenefits.map((item, index) => (
            <article
              key={item.title}
              style={{
                background:
                  index === 0
                    ? "#f7f4ee"
                    : index === 1
                    ? "#0f2742"
                    : index === 2
                    ? "#f26a0a"
                    : "#dfe6ef",
                color: index === 0 || index === 3 ? "#111" : "#f7f4ee",
              }}
            >
              <span>User outcome</span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section className="vajra-panel vajra-section-lead" id="section-05">
          <div className="vajra-section-title">
            <span>05</span>
            <h2>For Vendors</h2>
          </div>

          <div className="vajra-section-copy">
            <p>
              Vajra should also work as a stronger platform environment for the
              businesses inside it. Restaurants, sellers, and service providers
              need more than listings. They need discoverability and trust.
            </p>
            <p>
              That means the platform should help vendors appear organized,
              easier to choose, and better matched to customer intent.
            </p>
          </div>
        </section>

        <section className="vajra-panel vajra-type-showcase">
          <div>
            <span className="vajra-type-label">Vendor Principle</span>
            <h3>Businesses should feel represented, not buried.</h3>
          </div>
          <div>
            <span className="vajra-type-label">Platform Standard</span>
            <p>
              Vajra should give vendors a more credible digital surface while
              still keeping the customer journey clear and decision-oriented.
            </p>
          </div>
        </section>

        <section className="vajra-panel vajra-copy-grid">
          <h3>What vendors should gain</h3>
          <div className="vajra-copy-columns">
            {vendorBenefits.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="vajra-panel vajra-copy-grid">
          <h3>Vendor-side workflow</h3>
          <div className="vajra-copy-columns">
            {vendorFlows.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="vajra-panel vajra-section-lead" id="section-06">
          <div className="vajra-section-title">
            <span>06</span>
            <h2>Launch Vision</h2>
          </div>

          <div className="vajra-section-copy">
            <p>
              Vajra is being positioned as a launch-ready product direction, not
              just a vague concept. The next step is to turn this clarity into
              sharper flows, tighter category structure, and stronger trust
              signals.
            </p>
            <p>
              The launch vision is simple: people should understand immediately
              what Vajra helps them do, why it feels different, and why it is
              worth returning to.
            </p>
            <p>
              That also means building around trust signals like better order
              visibility, clearer vendor presentation, and flows that can later
              support payments, notifications, and repeat actions naturally.
            </p>
            <p>
              Over time, the drone-delivery layer should become one of Vajra’s
              clearest advantages because it supports faster, more direct, and
              less middle-dependent fulfillment.
            </p>
          </div>
        </section>

        <section className="vajra-panel vajra-art-grid">
          {launchRoadmap.map((item) => (
            <div key={item.title} className="vajra-art-card">
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          ))}
        </section>

        <section className="vajra-panel vajra-copy-grid">
          <h3>Trust and retention layer</h3>
          <div className="vajra-copy-columns">
            {trustSignals.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="vajra-panel vajra-copy-grid">
          <h3>Platform systems</h3>
          <div className="vajra-copy-columns">
            {platformSystems.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="vajra-panel vajra-copy-grid">
          <h3>Order tracking timeline</h3>
          <div className="vajra-copy-columns">
            {trackingTimeline.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="vajra-panel vajra-copy-grid">
          <h3>Why Vajra can win locally</h3>
          <div className="vajra-copy-columns">
            {marketReasons.map((item) => (
              <article key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="vajra-panel vajra-section-lead" id="contact-vajra">
          <div className="vajra-section-title">
            <span>07</span>
            <h2>Founder Note</h2>
          </div>

          <div className="vajra-section-copy">
            <p>
              I am building Vajra as part of a larger founder journey through
              Vajracognixia. The goal is to create a product that feels sharp,
              useful, and serious enough to earn trust from both users and
              businesses.
            </p>
            <p>
              This page is meant to show Vajra as an actual product direction:
              how it works, who it serves, and where it can grow next.
            </p>
            <p>
              For collaborations or product conversations, use the Contact Us
              page to send a direct message.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
};
