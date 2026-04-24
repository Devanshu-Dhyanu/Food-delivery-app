interface BrandedLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function BrandedLoader({
  message = 'Loading...',
  fullScreen = false,
}: BrandedLoaderProps) {
  return (
    <>
      <style>{`
        @keyframes vajraSpeeder {
          0% {
            transform: translate(2px, 1px) rotate(0deg);
          }

          10% {
            transform: translate(-1px, -3px) rotate(-1deg);
          }

          20% {
            transform: translate(-2px, 0) rotate(1deg);
          }

          30% {
            transform: translate(1px, 2px) rotate(0deg);
          }

          40% {
            transform: translate(1px, -1px) rotate(1deg);
          }

          50% {
            transform: translate(-1px, 3px) rotate(-1deg);
          }

          60% {
            transform: translate(-1px, 1px) rotate(0deg);
          }

          70% {
            transform: translate(3px, 1px) rotate(-1deg);
          }

          80% {
            transform: translate(-2px, -1px) rotate(1deg);
          }

          90% {
            transform: translate(2px, 1px) rotate(0deg);
          }

          100% {
            transform: translate(1px, -2px) rotate(-1deg);
          }
        }

        @keyframes vajraFazer1 {
          0% {
            left: 0;
          }

          100% {
            left: -80px;
            opacity: 0;
          }
        }

        @keyframes vajraFazer2 {
          0% {
            left: 0;
          }

          100% {
            left: -100px;
            opacity: 0;
          }
        }

        @keyframes vajraFazer3 {
          0% {
            left: 0;
          }

          100% {
            left: -50px;
            opacity: 0;
          }
        }

        @keyframes vajraFazer4 {
          0% {
            left: 0;
          }

          100% {
            left: -150px;
            opacity: 0;
          }
        }

        @keyframes vajraLf1 {
          0% {
            left: 200%;
          }

          100% {
            left: -200%;
            opacity: 0;
          }
        }

        @keyframes vajraLf2 {
          0% {
            left: 200%;
          }

          100% {
            left: -200%;
            opacity: 0;
          }
        }

        @keyframes vajraLf3 {
          0% {
            left: 200%;
          }

          100% {
            left: -100%;
            opacity: 0;
          }
        }

        @keyframes vajraLf4 {
          0% {
            left: 200%;
          }

          100% {
            left: -100%;
            opacity: 0;
          }
        }

        .vajra-speed-loader-card {
          background:
            radial-gradient(circle at top, rgba(249, 115, 22, 0.14), transparent 48%),
            linear-gradient(135deg, rgba(17, 24, 39, 0.96), rgba(15, 23, 42, 0.98));
        }

        .vajra-speed-loader-scene {
          --vajra-loader-color: #f8fafc;
          position: relative;
          min-height: 180px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          background:
            radial-gradient(circle at 18% 30%, rgba(249, 115, 22, 0.16), transparent 28%),
            linear-gradient(180deg, rgba(3, 7, 18, 0.95), rgba(17, 24, 39, 0.92));
        }

        .vajra-speed-loader {
          position: absolute;
          top: 50%;
          left: 50%;
          margin-left: -50px;
          color: var(--vajra-loader-color);
          animation: vajraSpeeder 0.4s linear infinite;
        }

        .vajra-speed-loader > span {
          position: absolute;
          top: -19px;
          left: 60px;
          width: 35px;
          height: 5px;
          background: currentColor;
          border-radius: 2px 10px 1px 0;
        }

        .vajra-speed-loader-base span {
          position: absolute;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-right: 100px solid currentColor;
          border-bottom: 6px solid transparent;
        }

        .vajra-speed-loader-base span::before {
          content: "";
          position: absolute;
          top: -16px;
          right: -110px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: currentColor;
        }

        .vajra-speed-loader-base span::after {
          content: "";
          position: absolute;
          top: -16px;
          right: -98px;
          width: 0;
          height: 0;
          border-top: 0 solid transparent;
          border-right: 55px solid currentColor;
          border-bottom: 16px solid transparent;
        }

        .vajra-speed-loader-face {
          position: absolute;
          top: -15px;
          right: -125px;
          width: 20px;
          height: 12px;
          background: currentColor;
          border-radius: 20px 20px 0 0;
          transform: rotate(-40deg);
        }

        .vajra-speed-loader-face::after {
          content: "";
          position: absolute;
          top: 7px;
          right: 4px;
          width: 12px;
          height: 12px;
          background: currentColor;
          border-radius: 0 0 0 2px;
          transform: rotate(40deg);
          transform-origin: 50% 50%;
        }

        .vajra-speed-loader > span > span:nth-child(1),
        .vajra-speed-loader > span > span:nth-child(2),
        .vajra-speed-loader > span > span:nth-child(3),
        .vajra-speed-loader > span > span:nth-child(4) {
          position: absolute;
          width: 30px;
          height: 1px;
          background: currentColor;
        }

        .vajra-speed-loader > span > span:nth-child(1) {
          animation: vajraFazer1 0.2s linear infinite;
        }

        .vajra-speed-loader > span > span:nth-child(2) {
          top: 3px;
          animation: vajraFazer2 0.4s linear infinite;
        }

        .vajra-speed-loader > span > span:nth-child(3) {
          top: 1px;
          animation: vajraFazer3 0.4s linear infinite;
          animation-delay: -1s;
        }

        .vajra-speed-loader > span > span:nth-child(4) {
          top: 4px;
          animation: vajraFazer4 1s linear infinite;
          animation-delay: -1s;
        }

        .vajra-speed-loader-longfazers {
          position: absolute;
          inset: 0;
          color: var(--vajra-loader-color);
        }

        .vajra-speed-loader-longfazers span {
          position: absolute;
          height: 2px;
          width: 20%;
          background: currentColor;
          opacity: 0.82;
        }

        .vajra-speed-loader-longfazers span:nth-child(1) {
          top: 20%;
          animation: vajraLf1 0.6s linear infinite;
          animation-delay: -5s;
        }

        .vajra-speed-loader-longfazers span:nth-child(2) {
          top: 40%;
          animation: vajraLf2 0.8s linear infinite;
          animation-delay: -1s;
        }

        .vajra-speed-loader-longfazers span:nth-child(3) {
          top: 60%;
          animation: vajraLf3 0.6s linear infinite;
        }

        .vajra-speed-loader-longfazers span:nth-child(4) {
          top: 80%;
          animation: vajraLf4 0.5s linear infinite;
          animation-delay: -3s;
        }

        @media (max-width: 640px) {
          .vajra-speed-loader-scene {
            min-height: 160px;
          }

          .vajra-speed-loader-card {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vajra-speed-loader,
          .vajra-speed-loader > span > span,
          .vajra-speed-loader-longfazers span {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className={`flex items-center justify-center px-4 py-10 ${
          fullScreen ? 'min-h-screen bg-gray-900' : 'min-h-[60vh]'
        }`}
      >
        <div className="vajra-speed-loader-card w-full max-w-xl rounded-[28px] border border-white/5 px-6 py-6 shadow-2xl shadow-black/30 sm:px-8 sm:py-8">
          <div className="vajra-speed-loader-scene flex items-center justify-center px-4">
            <div className="vajra-speed-loader" role="status" aria-label={message}>
              <span aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>

              <div className="vajra-speed-loader-base" aria-hidden="true">
                <span />
                <div className="vajra-speed-loader-face" />
              </div>
            </div>

            <div className="vajra-speed-loader-longfazers" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <p className="mt-5 text-center text-sm font-medium tracking-[0.08em] text-gray-200" aria-live="polite">
            {message}
          </p>
        </div>
      </div>
    </>
  );
}
