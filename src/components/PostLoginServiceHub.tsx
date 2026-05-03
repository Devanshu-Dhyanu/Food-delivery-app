import {
  ArrowUpRight,
  CarFront,
  CarTaxiFront,
  Store,
  UtensilsCrossed,
} from 'lucide-react';

type HubTarget = 'home' | 'car-rent' | 'second-hand-market' | 'taxi';

interface PostLoginServiceHubProps {
  onNavigate: (page: HubTarget) => void;
}

const leftMenu = ['Service', 'Identity', 'Command', 'System Inspection', 'Development'] as const;
const rightStatus = ['K x', 'K Radar', 'K Mobility'] as const;

const storyPanels = [
  {
    title: 'We created a workflow for a Vajraian drone',
    body:
      'The post-login screen is now the command surface where the user chooses the next live module without changing the underlying product flow.',
    accent: 'wide',
    className: 'hub-panel-right hub-panel-top',
  },
  {
    title: 'Primary brief',
    body:
      'Food delivery, car rental, second hand market, and taxi stay visible together so the app feels like one system instead of unrelated screens.',
    accent: 'tag',
    className: 'hub-panel-center',
  },
  {
    title: 'The next step was creating visual cues',
    body:
      'Target rings, status labels, floating cards, and a central drone composition pull the landing page closer to your reference.',
    accent: 'corner',
    className: 'hub-panel-right hub-panel-bottom',
  },
] as const;

const serviceCards: Array<{
  id: HubTarget;
  title: string;
  status: string;
  description: string;
  icon: typeof UtensilsCrossed;
}> = [
  {
    id: 'home',
    title: 'Food Delivery',
    status: 'Live now',
    description: 'Restaurants, menus, orders, and tracking.',
    icon: UtensilsCrossed,
  },
  {
    id: 'car-rent',
    title: 'Car Rental',
    status: 'Now booking',
    description: 'Pick a vehicle and submit rental hours.',
    icon: CarFront,
  },
  {
    id: 'second-hand-market',
    title: 'Second Hand Market',
    status: 'Live now',
    description: 'Campus buy and sell marketplace flow.',
    icon: Store,
  },
  {
    id: 'taxi',
    title: 'Taxi',
    status: 'Coming soon',
    description: 'Quick mobility access for future rides.',
    icon: CarTaxiFront,
  },
];

export default function PostLoginServiceHub({ onNavigate }: PostLoginServiceHubProps) {
  return (
    <section className="hub-screen">
      <style>{`
        .hub-screen {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 18%, rgba(255,255,255,0.12), transparent 19%),
            radial-gradient(circle at 20% 10%, rgba(255,255,255,0.05), transparent 20%),
            radial-gradient(circle at 80% 12%, rgba(255,255,255,0.04), transparent 16%),
            linear-gradient(180deg, #101214 0%, #030405 38%, #000000 100%);
          color: #f2f4f1;
          font-family: "Arial Narrow", Arial, sans-serif;
        }

        .hub-screen::before,
        .hub-screen::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .hub-screen::before {
          background:
            radial-gradient(circle at 50% 8%, rgba(255,255,255,0.16), transparent 26%),
            radial-gradient(circle at 35% 18%, rgba(89, 96, 101, 0.34), transparent 18%),
            radial-gradient(circle at 65% 20%, rgba(89, 96, 101, 0.28), transparent 18%),
            linear-gradient(180deg, rgba(255,255,255,0.04), transparent 30%);
          mix-blend-mode: screen;
          opacity: 0.82;
          animation: cloudShift 18s ease-in-out infinite alternate;
        }

        .hub-screen::after {
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 100% 5px;
          opacity: 0.06;
        }

        .hub-shell {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 18px 16px 24px;
          display: flex;
          flex-direction: column;
        }

        .hub-topline {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          font-size: 9px;
          color: rgba(255,255,255,0.78);
        }

        .hub-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .hub-brand-mark {
          width: 28px;
          height: 10px;
          border-top: 2px solid #f4f5f3;
          border-left: 2px solid #f4f5f3;
          border-right: 2px solid transparent;
          transform: skewX(-24deg);
          opacity: 0.86;
        }

        .hub-meta {
          display: flex;
          gap: 18px;
          color: rgba(255,255,255,0.45);
        }

        .hub-main {
          position: relative;
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: 124px 1fr 280px;
          gap: 18px;
        }

        .hub-left,
        .hub-right {
          position: relative;
          padding-top: 10px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.22em;
        }

        .hub-left-menu {
          list-style: none;
          margin: 20px 0 0;
          padding: 0;
          color: rgba(207, 255, 102, 0.82);
        }

        .hub-left-menu li {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 7px;
        }

        .hub-left-menu li::before {
          content: "x";
          color: rgba(207, 255, 102, 0.82);
          font-size: 9px;
        }

        .hub-left-sidecard {
          position: absolute;
          left: 0;
          bottom: 148px;
          width: 70px;
          display: grid;
          gap: 7px;
        }

        .hub-thumb {
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          padding: 4px;
        }

        .hub-thumb img {
          display: block;
          width: 100%;
          height: 46px;
          object-fit: cover;
          filter: grayscale(1) contrast(1.1);
        }

        .hub-thumb span {
          display: block;
          margin-top: 4px;
          color: rgba(207, 255, 102, 0.78);
          font-size: 7px;
          letter-spacing: 0.18em;
        }

        .hub-center {
          position: relative;
          min-height: 760px;
        }

        .hub-drone-wrap {
          position: relative;
          display: flex;
          justify-content: center;
          margin-top: 24px;
          animation: drift 7s ease-in-out infinite;
        }

        .hub-drone-glow {
          position: absolute;
          top: -14px;
          left: 50%;
          width: min(70vw, 900px);
          height: 300px;
          transform: translateX(-50%);
          background: radial-gradient(circle at 50% 30%, rgba(255,255,255,0.15), transparent 58%);
          filter: blur(32px);
          opacity: 0.55;
        }

        .hub-drone {
          width: min(76vw, 980px);
          max-width: 980px;
          object-fit: contain;
          filter: brightness(0.47) contrast(1.2) saturate(0.65);
          mix-blend-mode: screen;
          opacity: 0.94;
        }

        .hub-beacon {
          position: absolute;
          left: 50%;
          top: 18px;
          width: 1px;
          height: 132px;
          transform: translateX(-50%);
          background: linear-gradient(180deg, rgba(255, 65, 65, 0.95), rgba(255, 65, 65, 0));
        }

        .hub-beacon::before {
          content: "";
          position: absolute;
          top: -4px;
          left: 50%;
          width: 10px;
          height: 10px;
          transform: translateX(-50%);
          border-radius: 999px;
          background: #ef4444;
          box-shadow: 0 0 16px rgba(239,68,68,0.95), 0 0 28px rgba(239,68,68,0.55);
          animation: pulse 1.6s ease-in-out infinite;
        }

        .hub-horizon {
          position: absolute;
          left: 10%;
          right: 10%;
          top: 250px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 15%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.22) 85%, transparent);
        }

        .hub-target {
          position: absolute;
          left: 50%;
          bottom: 158px;
          width: min(64vw, 520px);
          aspect-ratio: 1;
          transform: translateX(-50%);
          border-radius: 999px;
          border: 1px dashed rgba(255,255,255,0.08);
        }

        .hub-target::before,
        .hub-target::after {
          content: "";
          position: absolute;
          inset: 12%;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.04);
        }

        .hub-target::after {
          inset: -1px;
          border: 1px solid rgba(207,255,102,0.08);
          clip-path: polygon(0 0, 35% 0, 35% 2px, 0 2px);
          animation: rotateSweep 14s linear infinite;
          transform-origin: center;
        }

        .hub-center-title {
          position: absolute;
          left: 50%;
          bottom: 302px;
          transform: translateX(-50%);
          text-align: center;
          color: #b5ef2f;
          font-size: clamp(24px, 2.2vw, 34px);
          line-height: 0.9;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          text-shadow: 0 0 18px rgba(181,239,47,0.22);
          animation: glowText 2.8s ease-in-out infinite alternate;
        }

        .hub-center-title span {
          display: block;
        }

        .hub-chevron {
          position: absolute;
          bottom: 336px;
          font-size: 18px;
          color: rgba(255,255,255,0.18);
        }

        .hub-chevron.left {
          left: calc(50% - 124px);
        }

        .hub-chevron.right {
          right: calc(50% - 124px);
        }

        .hub-panel {
          position: absolute;
          width: 230px;
          border: 1px solid rgba(255,255,255,0.11);
          background: rgba(26, 28, 30, 0.82);
          backdrop-filter: blur(12px);
          padding: 14px 16px;
          box-shadow: 0 20px 48px rgba(0,0,0,0.35);
          animation: floatPanel 6.4s ease-in-out infinite;
        }

        .hub-panel::after {
          content: "";
          position: absolute;
          right: -1px;
          bottom: 18px;
          width: 10px;
          height: 48px;
          background: #9ad620;
          clip-path: polygon(100% 0, 100% 100%, 0 88%, 0 12%);
        }

        .hub-panel small {
          display: inline-block;
          color: #a6de2f;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          margin-bottom: 8px;
        }

        .hub-panel h3 {
          margin: 0 0 8px;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255,255,255,0.92);
          font-weight: 500;
        }

        .hub-panel p {
          margin: 0;
          font-size: 10px;
          line-height: 1.65;
          color: rgba(255,255,255,0.62);
        }

        .hub-panel-right {
          right: 28px;
        }

        .hub-panel-top {
          top: 322px;
          width: 252px;
        }

        .hub-panel-center {
          left: 50%;
          bottom: 160px;
          transform: translateX(52px);
          width: 220px;
          animation-delay: -1.8s;
        }

        .hub-panel-bottom {
          right: 32px;
          bottom: 198px;
          width: 188px;
          animation-delay: -3.2s;
        }

        .hub-panel-corner {
          position: absolute;
          right: 26px;
          bottom: 178px;
          width: 54px;
          height: 54px;
          border-right: 1px solid rgba(181,239,47,0.55);
          border-bottom: 1px solid rgba(181,239,47,0.55);
          opacity: 0.75;
        }

        .hub-panel-corner::before,
        .hub-panel-corner::after {
          content: "";
          position: absolute;
          background: rgba(181,239,47,0.55);
        }

        .hub-panel-corner::before {
          top: 0;
          right: 0;
          width: 14px;
          height: 1px;
        }

        .hub-panel-corner::after {
          bottom: 0;
          left: 0;
          width: 1px;
          height: 14px;
        }

        .hub-right-status {
          display: grid;
          gap: 8px;
          color: rgba(207,255,102,0.84);
          margin-top: 22px;
        }

        .hub-right-status div {
          display: flex;
          justify-content: space-between;
        }

        .hub-bottom {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: auto;
          padding-top: 10px;
        }

        .hub-card {
          position: relative;
          overflow: hidden;
          min-height: 126px;
          text-align: left;
          border: 1px solid rgba(255,255,255,0.11);
          background: linear-gradient(180deg, rgba(22,24,26,0.92), rgba(8,9,10,0.92));
          padding: 14px 14px 16px;
          transition: transform 280ms ease, border-color 280ms ease, box-shadow 280ms ease;
        }

        .hub-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(181,239,47,0.14), transparent 32%);
          opacity: 0;
          transition: opacity 280ms ease;
        }

        .hub-card::after {
          content: "";
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 10px;
          height: 2px;
          background: linear-gradient(90deg, rgba(181,239,47,0.95), rgba(181,239,47,0.05));
          transform: scaleX(0.18);
          transform-origin: left;
          transition: transform 280ms ease;
        }

        .hub-card:hover {
          transform: translateY(-4px);
          border-color: rgba(181,239,47,0.34);
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
        }

        .hub-card:hover::before {
          opacity: 1;
        }

        .hub-card:hover::after {
          transform: scaleX(1);
        }

        .hub-card-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .hub-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .hub-card-icon {
          display: inline-flex;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #b5ef2f;
        }

        .hub-card-status {
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          color: rgba(255,255,255,0.5);
        }

        .hub-card h2 {
          margin: 16px 0 8px;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.92);
        }

        .hub-card p {
          margin: 0;
          font-size: 11px;
          line-height: 1.55;
          color: rgba(255,255,255,0.62);
        }

        .hub-card-link {
          margin-top: auto;
          padding-top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #b5ef2f;
          font-size: 10px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }

        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
          50% { transform: translateX(-50%) scale(1.35); opacity: 0.72; }
        }

        @keyframes drift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }

        @keyframes floatPanel {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes cloudShift {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(0, 18px, 0) scale(1.03); }
        }

        @keyframes glowText {
          0% { text-shadow: 0 0 8px rgba(181,239,47,0.2); }
          100% { text-shadow: 0 0 22px rgba(181,239,47,0.42); }
        }

        @keyframes rotateSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1180px) {
          .hub-main {
            grid-template-columns: 1fr;
          }

          .hub-left,
          .hub-right {
            display: none;
          }

          .hub-center {
            min-height: 820px;
          }

          .hub-panel-top {
            right: 12px;
          }

          .hub-panel-bottom {
            right: 12px;
          }
        }

        @media (max-width: 860px) {
          .hub-shell {
            padding: 14px 12px 18px;
          }

          .hub-topline {
            letter-spacing: 0.16em;
            font-size: 8px;
          }

          .hub-meta {
            display: none;
          }

          .hub-center {
            min-height: 860px;
          }

          .hub-drone-wrap {
            margin-top: 42px;
          }

          .hub-drone {
            width: 100%;
          }

          .hub-horizon {
            top: 210px;
            left: 4%;
            right: 4%;
          }

          .hub-target {
            width: min(92vw, 440px);
            bottom: 330px;
          }

          .hub-center-title {
            bottom: 476px;
            font-size: 26px;
          }

          .hub-chevron {
            display: none;
          }

          .hub-panel {
            position: relative;
            right: auto;
            left: auto;
            bottom: auto;
            top: auto;
            width: 100%;
            transform: none;
            margin-top: 14px;
          }

          .hub-panel-center,
          .hub-panel-top,
          .hub-panel-bottom {
            transform: none;
          }

          .hub-panel-stack {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 108px;
            display: grid;
            gap: 12px;
          }

          .hub-panel-corner {
            display: none;
          }

          .hub-bottom {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin-top: 18px;
          }
        }

        @media (max-width: 560px) {
          .hub-center {
            min-height: 930px;
          }

          .hub-brand-mark {
            width: 22px;
          }

          .hub-beacon {
            top: 34px;
            height: 92px;
          }

          .hub-horizon {
            top: 168px;
          }

          .hub-target {
            bottom: 368px;
            width: min(94vw, 360px);
          }

          .hub-center-title {
            bottom: 492px;
            font-size: 21px;
          }

          .hub-panel-stack {
            bottom: 120px;
          }

          .hub-bottom {
            grid-template-columns: 1fr;
          }

          .hub-card {
            min-height: 114px;
          }
        }
      `}</style>

      <div className="hub-shell">
        <div className="hub-topline">
          <div className="hub-brand">
            <span className="hub-brand-mark" />
            <div>
              <div>Vajra Dynamics</div>
              <div style={{ color: 'rgba(255,255,255,0.42)', marginTop: 4 }}>Experimental Field</div>
            </div>
          </div>

          <div className="hub-meta">
            <span>Command</span>
            <span>Sector Zero</span>
            <span>05:24</span>
          </div>
        </div>

        <div className="hub-main">
          <aside className="hub-left">
            <div style={{ color: 'rgba(255,255,255,0.34)' }}>Overview</div>
            <ul className="hub-left-menu">
              {leftMenu.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="hub-left-sidecard">
              <div className="hub-thumb">
                <img src="/area/podium.png" alt="Command surface preview" />
                <span>Command Core</span>
              </div>
              <div className="hub-thumb">
                <img src="/area/balance.png" alt="System alignment preview" />
                <span>Commercial</span>
              </div>
            </div>
          </aside>

          <div className="hub-center">
            <div className="hub-drone-wrap">
              <div className="hub-drone-glow" />
              <img className="hub-drone" src="/area/vajra-hero-drone.jpg" alt="Vajra drone" />
              <div className="hub-beacon" />
            </div>

            <div className="hub-horizon" />
            <div className="hub-target" />
            <div className="hub-center-title">
              <span>Main</span>
              <span>Task Of</span>
              <span>The</span>
              <span>Project</span>
            </div>
            <div className="hub-chevron left">&gt;&gt;</div>
            <div className="hub-chevron right">&lt;&lt;</div>

            <div className="hub-panel-stack">
              {storyPanels.map((panel) => (
                <article key={panel.title} className={`hub-panel ${panel.className}`}>
                  <small>{panel.accent === 'tag' ? 'x x x' : 'Field Note'}</small>
                  <h3>{panel.title}</h3>
                  <p>{panel.body}</p>
                </article>
              ))}
            </div>

            <div className="hub-panel-corner" />
          </div>

          <aside className="hub-right">
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.34)' }}>
              <span>Signal</span>
              <span>05:24</span>
            </div>
            <div className="hub-right-status">
              {rightStatus.map((item) => (
                <div key={item}>
                  <span>{item}</span>
                  <span>x</span>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="hub-bottom">
          {serviceCards.map((card) => {
            const Icon = card.icon;

            return (
              <button key={card.id} type="button" className="hub-card" onClick={() => onNavigate(card.id)}>
                <div className="hub-card-content">
                  <div className="hub-card-head">
                    <span className="hub-card-icon">
                      <Icon size={18} />
                    </span>
                    <span className="hub-card-status">{card.status}</span>
                  </div>
                  <h2>{card.title}</h2>
                  <p>{card.description}</p>
                  <span className="hub-card-link">
                    Open module
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
