import {
  Loader2,
  Mic,
  MicOff,
  PhoneIncoming,
  PhoneOff,
  PhoneOutgoing,
  Radio,
} from 'lucide-react';
import type { DeliveryCallSession, DeliveryCallSessionStatus } from '../lib/supabase';
import {
  formatDeliveryCallTimer,
  getDeliveryCallRoleLabel,
  getDeliveryCallStatusLabel,
} from '../lib/deliveryCalls';

type DeliveryVoiceCallPhase =
  | 'incoming'
  | 'dialing'
  | 'connecting'
  | 'connected'
  | 'ending';

interface DeliveryVoiceCallModalProps {
  busy: boolean;
  counterpartLabel: string;
  counterpartRole: 'customer' | 'delivery_partner';
  elapsedSeconds: number;
  errorMessage: string | null;
  muted: boolean;
  onAccept: () => void;
  onClose: () => void;
  onDecline: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  phase: DeliveryVoiceCallPhase;
  session: DeliveryCallSession | null;
}

const getPhaseCopy = (phase: DeliveryVoiceCallPhase, status: DeliveryCallSessionStatus) => {
  switch (phase) {
    case 'incoming':
      return {
        eyebrow: 'Incoming voice call',
        title: 'Delivery call is ringing for you',
        description: 'Accept to talk inside the app. If the browser asks for microphone access, allow it once.',
      };
    case 'dialing':
      return {
        eyebrow: 'Calling now',
        title: 'Waiting for the other person to answer',
        description: 'Keep this tab open. The call will connect here as soon as it is accepted.',
      };
    case 'connecting':
      return {
        eyebrow: 'Connecting audio',
        title: 'Joining secure voice channel',
        description: 'Microphone and audio connection are being prepared right now.',
      };
    case 'connected':
      return {
        eyebrow: 'Live in-app call',
        title: 'Voice call is active',
        description: 'You can continue browsing the app, but keep this screen open for the cleanest audio.',
      };
    case 'ending':
    default:
      return {
        eyebrow: getDeliveryCallStatusLabel(status),
        title: 'Wrapping up the call',
        description: 'We are safely closing the session for both sides.',
      };
  }
};

export default function DeliveryVoiceCallModal({
  busy,
  counterpartLabel,
  counterpartRole,
  elapsedSeconds,
  errorMessage,
  muted,
  onAccept,
  onClose,
  onDecline,
  onEnd,
  onToggleMute,
  phase,
  session,
}: DeliveryVoiceCallModalProps) {
  if (!session) {
    return null;
  }

  const phaseCopy = getPhaseCopy(phase, session.status);
  const orderLabel = session.order_id.slice(0, 8).toUpperCase();
  const showAccept = phase === 'incoming';
  const showMute = phase === 'connected' || phase === 'connecting';
  const showEnd = phase !== 'incoming' && phase !== 'ending';

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-slate-950/70 px-4 pb-4 pt-24 backdrop-blur-md sm:items-center sm:p-6">
      <div className="w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.98)_100%)] shadow-2xl shadow-black/40">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
                {phaseCopy.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-black text-white">{phaseCopy.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{phaseCopy.description}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              Hide
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-[28px] border border-emerald-400/15 bg-emerald-500/10 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-slate-950/55">
                {phase === 'incoming' ? (
                  <PhoneIncoming className="h-8 w-8 text-emerald-100" />
                ) : phase === 'connected' ? (
                  <Radio className="h-8 w-8 text-emerald-100" />
                ) : (
                  <PhoneOutgoing className="h-8 w-8 text-emerald-100" />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-2xl font-black text-white">{counterpartLabel}</p>
                <p className="mt-1 text-sm text-emerald-50/80">
                  {getDeliveryCallRoleLabel(counterpartRole)} | Order {orderLabel}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                {phase === 'connecting' || busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : phase === 'connected' ? (
                  <Radio className="h-3.5 w-3.5" />
                ) : phase === 'incoming' ? (
                  <PhoneIncoming className="h-3.5 w-3.5" />
                ) : (
                  <PhoneOutgoing className="h-3.5 w-3.5" />
                )}
                {phase === 'connected'
                  ? `Live ${formatDeliveryCallTimer(elapsedSeconds)}`
                  : getDeliveryCallStatusLabel(session.status)}
              </span>

              <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                Secure app audio
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-[22px] border border-red-400/20 bg-red-500/10 px-4 py-4 text-sm leading-6 text-red-100">
              {errorMessage}
            </div>
          )}

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Quick note
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              If audio does not connect because microphone permission is blocked, you can still use the normal phone call
              button from the order card without losing your order data.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {showAccept && (
              <button
                type="button"
                onClick={onAccept}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneIncoming className="h-4 w-4" />}
                Accept in app
              </button>
            )}

            {showMute && (
              <button
                type="button"
                onClick={onToggleMute}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-semibold text-white transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {muted ? 'Unmute mic' : 'Mute mic'}
              </button>
            )}

            <button
              type="button"
              onClick={showAccept ? onDecline : onEnd}
              disabled={busy}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                showAccept
                  ? 'border border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/20'
                  : 'border border-red-400/20 bg-red-500/10 text-red-100 hover:bg-red-500/20'
              }`}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneOff className="h-4 w-4" />}
              {showAccept ? 'Decline' : showEnd ? 'End call' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
