interface BrandedLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function BrandedLoader({ message = 'Loading...', fullScreen = false }: BrandedLoaderProps) {
  return (
    <>
      <style>{`
        .vajra-loader-wrap {
          position: relative;
          width: 230px;
          height: 300px;
        }
        .vajra-loader-boxshadow {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1px solid #fb923c;
          transform: scale(0.84);
          box-shadow: rgba(249, 115, 22, 0.45) 0px 30px 70px 0px;
          transition: all 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        }
        .vajra-loader-main {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: linear-gradient(0deg, rgb(62, 0, 0) 0%, rgb(255, 72, 0) 60%, rgb(62, 0, 0) 100%);
          position: absolute;
          clip-path: polygon(0 0, 100% 0, 100% 40px, 100% calc(100% - 40px), calc(100% - 40px) 100%, 40px 100%, 0 calc(100% - 40px));
          box-shadow: rgba(255, 95, 31, 0.45) 0px 7px 29px 0px;
          transition: all 0.3s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        }
        .vajra-loader-top {
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 0;
          z-index: 2;
          border-top: 115px solid #0b0b0b;
          border-left: 115px solid transparent;
          border-right: 115px solid transparent;
          transition: all 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        }
        .vajra-loader-side {
          position: absolute;
          width: 100%;
          top: 0;
          transform: translateX(-50%);
          height: 101%;
          background: #0b0b0b;
          clip-path: polygon(0% 0%, 50% 0, 95% 45%, 100% 100%, 0% 100%);
          transition: all 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86) 1s;
        }
        .vajra-loader-left { left: 0; }
        .vajra-loader-right {
          right: 0;
          transform: translateX(50%) scale(-1, 1);
        }
        .vajra-loader-title {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 84px;
          font-weight: 700;
          font-size: 25px;
          color: #fff7ed;
          letter-spacing: 0.04em;
          opacity: 0;
          z-index: 3;
          transition: all 0.2s ease-out 0s;
          white-space: nowrap;
        }
        .vajra-loader-button-container {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
        }
        .vajra-loader-button {
          position: absolute;
          transform: translateX(-50%);
          width: 48px;
          height: 36px;
          clip-path: polygon(0 0, 100% 0, 81% 100%, 21% 100%);
          background: #0b0b0b;
          border: none;
          color: #fb923c;
          display: grid;
          place-content: center;
          transition: all 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        }
        .vajra-loader-button svg {
          width: 16px;
          height: 16px;
          transition: transform 0.2s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        }
        .vajra-loader-button:nth-child(1) { bottom: 300px; transition-delay: 0.4s; }
        .vajra-loader-button:nth-child(2) { bottom: 300px; transition-delay: 0.6s; }
        .vajra-loader-button:nth-child(3) { bottom: 300px; transition-delay: 0.8s; }
        .vajra-loader-wrap:hover .vajra-loader-main { transform: scale(1.06); }
        .vajra-loader-wrap:hover .vajra-loader-top { top: -50px; }
        .vajra-loader-wrap:hover .vajra-loader-left {
          left: -50px;
          transition: all 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86) 0.1s;
        }
        .vajra-loader-wrap:hover .vajra-loader-right {
          right: -50px;
          transition: all 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86) 0.1s;
        }
        .vajra-loader-wrap:hover .vajra-loader-title {
          opacity: 1;
          transition: all 0.2s ease-out 1.2s;
        }
        .vajra-loader-wrap:hover .vajra-loader-button:nth-child(1) { bottom: 84px; transition-delay: 0.8s; }
        .vajra-loader-wrap:hover .vajra-loader-button:nth-child(2) { bottom: 44px; transition-delay: 0.6s; }
        .vajra-loader-wrap:hover .vajra-loader-button:nth-child(3) { bottom: 4px; transition-delay: 0.4s; }
        .vajra-loader-wrap:hover .vajra-loader-button svg { transform: scale(1.13); }
        @media (max-width: 640px) {
          .vajra-loader-wrap { transform: scale(0.92); }
          .vajra-loader-title { font-size: 22px; }
        }
      `}</style>

      <div className={`flex flex-col items-center justify-center gap-5 px-4 py-10 ${fullScreen ? 'min-h-screen bg-gray-900' : 'min-h-[60vh]'}`}>
        <div className="vajra-loader-wrap" role="status" aria-label={message}>
          <div className="vajra-loader-boxshadow" />
          <div className="vajra-loader-main">
            <div className="vajra-loader-top" />
            <div className="vajra-loader-left vajra-loader-side" />
            <div className="vajra-loader-right vajra-loader-side" />
            <div className="vajra-loader-title">VAJRA</div>
            <div className="vajra-loader-button-container" aria-hidden="true">
              <button className="vajra-loader-button" type="button" tabIndex={-1}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                </svg>
              </button>
              <button className="vajra-loader-button" type="button" tabIndex={-1}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.9 2H22l-6.8 7.7L23 22h-6.1l-4.8-6.3L6.4 22H3.2l7.1-8.1L2 2h6.2l4.5 5.9L18.9 2z" />
                </svg>
              </button>
              <button className="vajra-loader-button" type="button" tabIndex={-1}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-4.3 1.4-5-1.2-7-1.2" />
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.4c3 0 6-1.9 6-5.4.08-1.3-.3-2.5-1-3.5.3-1.1.3-2.3 0-3.5 0 0-1 0-3 1.5a10.2 10.2 0 0 0-8 0C6 2 5 2 5 2c-.3 1.2-.3 2.4 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.4 6 5.4-.9 1.1-1.2 2.5-1 3.9v3.7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-sm font-medium tracking-[0.08em] text-gray-200" aria-live="polite">{message}</p>
      </div>
    </>
  );
}
