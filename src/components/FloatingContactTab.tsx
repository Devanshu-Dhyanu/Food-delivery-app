import { MessageCircleMore } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';

type FloatingContactTabProps = {
  href?: string;
  label?: string;
};

type FloatingContactPosition = {
  x: number;
  y: number;
};

const STORAGE_KEY = 'vajra_floating_contact_position';

export default function FloatingContactTab({
  href = '/contact-us',
  label = 'Contact Us',
}: FloatingContactTabProps) {
  const [dragMode, setDragMode] = useState(false);
  const [position, setPosition] = useState<FloatingContactPosition | null>(null);
  const dragStateRef = useRef<{
    active: boolean;
    pointerOffsetX: number;
    pointerOffsetY: number;
    moved: boolean;
  }>({
    active: false,
    pointerOffsetX: 0,
    pointerOffsetY: 0,
    moved: false,
  });
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as FloatingContactPosition;
      if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
        setPosition(parsed);
      }
    } catch {
      // Ignore storage issues.
    }
  }, []);

  useEffect(() => {
    if (!position) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    } catch {
      // Ignore storage issues.
    }
  }, [position]);

  useEffect(() => {
    if (!dragMode) {
      dragStateRef.current.active = false;
    }
  }, [dragMode]);

  const clampPosition = (nextX: number, nextY: number) => {
    const cardWidth = rootRef.current?.offsetWidth ?? 220;
    const cardHeight = rootRef.current?.offsetHeight ?? 76;
    const maxX = Math.max(12, window.innerWidth - cardWidth - 12);
    const maxY = Math.max(12, window.innerHeight - cardHeight - 12);

    return {
      x: Math.min(Math.max(12, nextX), maxX),
      y: Math.min(Math.max(12, nextY), maxY),
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLAnchorElement>) => {
    if (!dragMode) {
      return;
    }

    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    dragStateRef.current = {
      active: true,
      pointerOffsetX: event.clientX - rect.left,
      pointerOffsetY: event.clientY - rect.top,
      moved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (!dragMode || !dragStateRef.current.active) {
      return;
    }

    dragStateRef.current.moved = true;
    setPosition(
      clampPosition(
        event.clientX - dragStateRef.current.pointerOffsetX,
        event.clientY - dragStateRef.current.pointerOffsetY
      )
    );
  };

  const handlePointerUp = (event: PointerEvent<HTMLAnchorElement>) => {
    if (!dragMode) {
      return;
    }

    dragStateRef.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (dragMode || dragStateRef.current.moved) {
      event.preventDefault();
      dragStateRef.current.moved = false;
    }
  };

  const floatingStyle = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto',
        transform: 'none',
      }
    : undefined;

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

        .vajra-floating-contact.is-drag-mode,
        .vajra-floating-contact.is-custom {
          transform: none;
        }

        .vajra-floating-contact.is-drag-mode {
          transition: none;
        }

        .vajra-floating-contact-link {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          min-height: 76px;
          padding: 0 22px 0 18px;
          border-radius: 22px 0 0 22px;
          background: linear-gradient(135deg, #2f79d8 0%, #2867c0 100%);
          color: #ffffff;
          text-decoration: none;
          box-shadow: 0 18px 38px rgba(12, 28, 58, 0.34);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-right: 0;
          user-select: none;
        }

        .vajra-floating-contact.is-drag-mode .vajra-floating-contact-link {
          cursor: grab;
        }

        .vajra-floating-contact.is-drag-mode .vajra-floating-contact-link:active {
          cursor: grabbing;
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
        className={`vajra-floating-contact${dragMode ? ' is-drag-mode' : ''}${position ? ' is-custom' : ''}`}
        style={floatingStyle}
        aria-label="Quick contact access"
      >
        <a
          href={href}
          className="vajra-floating-contact-link"
          onDoubleClick={(event) => {
            event.preventDefault();
            setDragMode((current) => !current);
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleClick}
          title={dragMode ? 'Drag to move. Double-click again to lock.' : 'Double-click to move this tab.'}
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
