import {
  Loader2,
  Mic,
  MicOff,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  PhoneOutgoing,
  Radio,
  ShieldCheck,
  Volume2,
  X,
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
  canMinimize: boolean;
  counterpartLabel: string;
  counterpartRole: 'customer' | 'delivery_partner';
  elapsedSeconds: number;
  errorMessage: string | null;
  microphonePermission: 'unknown' | 'prompt' | 'checking' | 'granted' | 'denied' | 'unsupported';
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
        title: 'Incoming call',
        status: 'Calling...',
      };
    case 'dialing':
      return {
        title: 'Calling now',
        status: 'Calling...',
      };
    case 'connecting':
      return {
        title: 'Connecting',
        status: 'Connecting audio...',
      };
    case 'connected':
      return {
        title: 'Live now',
        status: 'Connected',
      };
    case 'ending':
    default:
      return {
        title: getDeliveryCallStatusLabel(status),
        status: 'Closing call...',
      };
  }
};

const getCenterIcon = (phase: DeliveryVoiceCallPhase, busy: boolean) => {
  if (busy || phase === 'connecting') {
    return <Loader2 className="h-16 w-16 animate-spin text-slate-900" />;
  }

  if (phase === 'incoming') {
    return <PhoneIncoming className="h-16 w-16 text-slate-900" />;
  }

  if (phase === 'connected') {
    return <Radio className="h-16 w-16 text-slate-900" />;
  }

  if (phase === 'ending') {
    return <PhoneOff className="h-16 w-16 text-slate-900" />;
  }

  return <PhoneCall className="h-16 w-16 text-slate-900" />;
};

export default function DeliveryVoiceCallModal({
  busy,
  canMinimize,
  counterpartLabel,
  counterpartRole,
  elapsedSeconds,
  errorMessage,
  microphonePermission,
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
  const callStatusLabel =
    phase === 'connected'
      ? formatDeliveryCallTimer(elapsedSeconds)
      : busy
        ? 'Working...'
        : phaseCopy.status;
  const microphoneStatusLabel =
    microphonePermission === 'granted'
      ? 'Mic ready'
      : microphonePermission === 'checking'
        ? 'Checking mic'
        : microphonePermission === 'denied'
          ? 'Mic blocked'
          : microphonePermission === 'unsupported'
            ? 'Mic unsupported'
            : 'Mic needed';

  return (
    <div className="fixed inset-0 z-[140] overflow-y-auto bg-black/95 backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.05)_0%,transparent_38%,rgba(255,255,255,0.02)_39%,transparent_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[420px] items-center justify-center px-4 py-6">
        <div className="relative flex min-h-[720px] w-full max-w-[360px] flex-col overflow-hidden rounded-[42px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,10,10,0.98)_0%,rgba(3,3,3,0.98)_100%)] shadow-[0_35px_100px_rgba(0,0,0,0.65)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,transparent_0%,transparent_18%,rgba(255,255,255,0.1)_19%,transparent_36%,transparent_100%)] opacity-60" />
          <div className="pointer-events-none absolute left-1/2 top-3 h-7 w-32 -translate-x-1/2 rounded-full bg-black/85 ring-1 ring-white/10" />

          <div className="relative flex flex-1 flex-col px-6 pb-8 pt-16 text-white">
            <div className="flex items-start justify-between">
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                {phaseCopy.title}
              </div>

              {canMinimize ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Stay open
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="max-w-[260px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {getDeliveryCallRoleLabel(counterpartRole)}
                </p>
                <h2 className="mt-6 break-words text-4xl font-light tracking-wide text-white">
                  {counterpartLabel}
                </h2>
                <p className="mt-4 text-lg text-slate-300">{callStatusLabel}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.22em] text-slate-500">
                  Order {orderLabel}
                </p>
              </div>

              <div className="relative mt-14">
                <div
                  className={`absolute inset-0 rounded-full blur-2xl ${
                    phase === 'incoming'
                      ? 'bg-emerald-500/20'
                      : phase === 'connected'
                        ? 'bg-sky-500/20'
                        : 'bg-white/10'
                  }`}
                />
                <div
                  className={`relative flex h-40 w-40 items-center justify-center rounded-full border shadow-2xl ${
                    phase === 'incoming'
                      ? 'border-emerald-300/20 bg-emerald-100'
                      : phase === 'connected'
                        ? 'border-sky-300/20 bg-sky-100'
                        : 'border-white/10 bg-white/75'
                  }`}
                >
                  {getCenterIcon(phase, busy)}
                </div>
              </div>

              <div className="mt-14 grid w-full max-w-[280px] grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em]">Secure</span>
                </div>
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    {microphonePermission === 'denied' || microphonePermission === 'unsupported' ? (
                      <MicOff className="h-5 w-5" />
                    ) : muted ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-center text-xs uppercase tracking-[0.18em]">
                    {phase === 'connected' && microphonePermission === 'granted'
                      ? muted
                        ? 'Muted'
                        : 'Live audio'
                      : microphoneStatusLabel}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-8 w-full max-w-[300px] rounded-[22px] border border-red-400/20 bg-red-500/10 px-4 py-4 text-sm leading-6 text-red-100">
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="relative mt-auto space-y-5">
              {showMute && (
                <button
                  type="button"
                  onClick={onToggleMute}
                  disabled={busy}
                  className="mx-auto flex h-14 min-w-[180px] items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {muted ? 'Unmute microphone' : 'Mute microphone'}
                </button>
              )}

              <div className={`grid gap-5 ${showAccept ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <button
                  type="button"
                  onClick={showAccept ? onDecline : onEnd}
                  disabled={busy}
                  className="flex flex-col items-center justify-center gap-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-[0_18px_40px_rgba(239,68,68,0.45)] transition hover:scale-[1.03]">
                    {busy && !showAccept ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <PhoneOff className="h-6 w-6" />
                    )}
                  </span>
                  <span className="text-sm font-medium tracking-wide">
                    {showAccept ? 'Decline' : 'End call'}
                  </span>
                </button>

                {showAccept && (
                  <button
                    type="button"
                    onClick={onAccept}
                    disabled={busy}
                    className="flex flex-col items-center justify-center gap-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-[0_18px_40px_rgba(34,197,94,0.45)] transition hover:scale-[1.03]">
                      {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <PhoneOutgoing className="h-6 w-6" />}
                    </span>
                    <span className="text-sm font-medium tracking-wide">Accept</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
