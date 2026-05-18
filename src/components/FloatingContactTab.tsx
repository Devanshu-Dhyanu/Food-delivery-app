import { MessageCircleMore } from 'lucide-react';
import { useRef } from 'react';

type FloatingContactTabProps = {
  href?: string;
  label?: string;
};

export default function FloatingContactTab({
  href = '/contact-us',
  label = 'Contact Us',
}: FloatingContactTabProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <style>{`
        .vajra-floating-contact {
          position: fixed;
          right: 0;
          top: 50%;
          z-index: 110;
          transform: translate3d(58%, -50%, 0);
          transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .vajra-floating-contact:hover,
        .vajra-floating-contact:focus-within {
          transform: translate3d(0, -50%, 0);
        }

        .vajra-floating-contact-link {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          min-height: 76px;
          padding: 0 22px 0 20px;
          border-radius: 22px 0 0 22px;
          background: linear-gradient(135deg, #2f79d8 0%, #2867c0 100%);
          color: #ffffff;
          text-decoration: none;
          box-shadow: 0 18px 38px rgba(12, 28, 58, 0.34);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-right: 0;
          user-select: none;
        }

        .vajra-floating-contact-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .vajra-floating-contact-text {
          font-family: 'Manrope', sans-serif;
          font-size: 1.02rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          white-space: nowrap;
        }

        @media (max-width: 820px) {
          .vajra-floating-contact {
            top: auto;
            bottom: 24px;
            transform: translate3d(46%, 0, 0);
          }

          .vajra-floating-contact:hover,
          .vajra-floating-contact:focus-within {
            transform: translate3d(0, 0, 0);
          }

          .vajra-floating-contact-link {
            min-height: 64px;
            padding: 0 18px 0 16px;
          }

          .vajra-floating-contact-icon {
            width: 38px;
            height: 38px;
          }

          .vajra-floating-contact-text {
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div
        ref={rootRef}
        className="vajra-floating-contact"
        aria-label="Quick contact access"
      >
        <a
          href={href}
          className="vajra-floating-contact-link"
          title="Contact The Vajra"
        >
          <span className="vajra-floating-contact-icon">
            <MessageCircleMore size={22} strokeWidth={2} />
          </span>
          <span className="vajra-floating-contact-text">{label}</span>
        </a>
      </div>
    </>
  );
}
