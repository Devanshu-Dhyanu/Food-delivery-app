import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { PhoneCall } from 'lucide-react';
import DeliveryVoiceCallModal from '../components/DeliveryVoiceCallModal';
import {
  buildDeliveryCallChannelName,
  DELIVERY_CALL_POLL_INTERVAL,
  DELIVERY_CALL_RING_TIMEOUT_MS,
  isLiveDeliveryCallStatus,
  LIVE_DELIVERY_CALL_STATUSES,
} from '../lib/deliveryCalls';
import {
  supabase,
  type DeliveryCallParticipantRole,
  type DeliveryCallSession,
  type DeliveryCallSessionStatus,
  type Order,
} from '../lib/supabase';

type CallPhase = 'idle' | 'incoming' | 'dialing' | 'connecting' | 'connected' | 'ending';

type CallNotice = {
  tone: 'success' | 'error' | 'info';
  text: string;
} | null;

type MicrophonePermissionState =
  | 'unknown'
  | 'prompt'
  | 'checking'
  | 'granted'
  | 'denied'
  | 'unsupported';

type DeliveryVoiceCallContextValue = {
  activeOrderId: string | null;
  callBusy: boolean;
  startCustomerCall: (order: Order) => Promise<void>;
  startDeliveryPartnerCall: (order: Order, callerLabel?: string) => Promise<void>;
};

type CreateCallSessionArgs = {
  callerLabel: string;
  callerRole: DeliveryCallParticipantRole;
  orderId: string;
  receiverLabel: string;
  receiverRole: DeliveryCallParticipantRole;
  receiverUserId: string;
};

interface DeliveryVoiceCallProviderProps {
  children: ReactNode;
  userDisplayName?: string;
  userId: string;
}

const DeliveryVoiceCallContext = createContext<DeliveryVoiceCallContextValue | null>(null);

const isDeliveryCallSchemaMissing = (error: unknown) => {
  const maybeError = error as { code?: string; details?: string; message?: string };
  const details = `${maybeError?.code ?? ''} ${maybeError?.message ?? ''} ${maybeError?.details ?? ''}`.toLowerCase();

  return details.includes('delivery_call_sessions') || details.includes('42p01') || details.includes('pgrst');
};

const getCounterpartSessionData = (session: DeliveryCallSession, userId: string) => {
  const isCaller = session.caller_user_id === userId;

  return {
    isCaller,
    label: isCaller ? session.receiver_label || 'Delivery partner' : session.caller_label || 'Customer',
    role: isCaller ? session.receiver_role : session.caller_role,
  };
};

export function DeliveryVoiceCallProvider({
  children,
  userDisplayName = '',
  userId,
}: DeliveryVoiceCallProviderProps) {
  const [activeSession, setActiveSession] = useState<DeliveryCallSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [notice, setNotice] = useState<CallNotice>(null);
  const [phase, setPhase] = useState<CallPhase>('idle');
  const [sheetMinimized, setSheetMinimized] = useState(false);
  const [microphonePermission, setMicrophonePermission] =
    useState<MicrophonePermissionState>('unknown');

  const activeSessionRef = useRef<DeliveryCallSession | null>(null);
  const agoraModuleRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const localTrackRef = useRef<any>(null);
  const ringLoopRef = useRef<number | null>(null);
  const rtcClientRef = useRef<any>(null);
  const joinedSessionIdRef = useRef<string | null>(null);
  const missingLiveSessionPollsRef = useRef(0);

  const syncSessionState = (session: DeliveryCallSession | null) => {
    activeSessionRef.current = session;
    setActiveSession(session);
  };

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setNotice(null);
    }, 4500);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (phase !== 'connected' || !activeSession?.accepted_at) {
      setElapsedSeconds(0);
      return;
    }

    const syncElapsed = () => {
      const startedAt = new Date(activeSession.accepted_at || activeSession.initiated_at).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    };

    syncElapsed();
    const interval = window.setInterval(syncElapsed, 1000);

    return () => window.clearInterval(interval);
  }, [activeSession?.accepted_at, activeSession?.initiated_at, phase]);

  const pushNotice = (tone: NonNullable<CallNotice>['tone'], text: string) => {
    setNotice({ tone, text });
  };

  const syncMicrophonePermission = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicrophonePermission('unsupported');
      return;
    }

    if (!('permissions' in navigator) || !navigator.permissions?.query) {
      setMicrophonePermission((current) => (current === 'unknown' ? 'prompt' : current));
      return;
    }

    try {
      const permissionStatus = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });

      const nextState =
        permissionStatus.state === 'granted'
          ? 'granted'
          : permissionStatus.state === 'denied'
            ? 'denied'
            : 'prompt';

      setMicrophonePermission(nextState);
    } catch {
      setMicrophonePermission((current) => (current === 'unknown' ? 'prompt' : current));
    }
  };

  const getAudioContext = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    audioContextRef.current = new AudioContextCtor();
    return audioContextRef.current;
  };

  const resumeAudioContext = async () => {
    const audioContext = getAudioContext();

    if (!audioContext) {
      return null;
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    return audioContext;
  };

  const playRingPattern = async () => {
    const audioContext = await resumeAudioContext();

    if (!audioContext) {
      return;
    }

    const emitBeep = (startOffset: number, duration: number, frequency: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const startAt = audioContext.currentTime + startOffset;
      const endAt = startAt + duration;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gainNode.gain.setValueAtTime(0.0001, startAt);
      gainNode.gain.exponentialRampToValueAtTime(0.12, startAt + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, endAt);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start(startAt);
      oscillator.stop(endAt + 0.03);
    };

    [760, 980, 760].forEach((frequency, index) => {
      emitBeep(index * 0.32, 0.18, frequency);
    });
  };

  const startRingLoop = () => {
    if (ringLoopRef.current !== null) {
      return;
    }

    void playRingPattern();
    ringLoopRef.current = window.setInterval(() => {
      void playRingPattern();
    }, 1800);

    if ('vibrate' in navigator) {
      navigator.vibrate?.([180, 100, 180, 120, 180]);
    }
  };

  const stopRingLoop = () => {
    if (ringLoopRef.current !== null) {
      window.clearInterval(ringLoopRef.current);
      ringLoopRef.current = null;
    }

    if ('vibrate' in navigator) {
      navigator.vibrate?.(0);
    }
  };

  const cleanupRtcConnection = async () => {
    stopRingLoop();

    try {
      if (localTrackRef.current) {
        localTrackRef.current.stop?.();
        localTrackRef.current.close?.();
      }
    } catch (error) {
      console.error('Error closing local delivery call track:', error);
    } finally {
      localTrackRef.current = null;
    }

    try {
      if (rtcClientRef.current?.remoteUsers) {
        rtcClientRef.current.remoteUsers.forEach((user: any) => {
          user.audioTrack?.stop?.();
        });
      }

      rtcClientRef.current?.removeAllListeners?.();
      await rtcClientRef.current?.leave?.();
    } catch (error) {
      console.error('Error leaving Agora voice channel:', error);
    } finally {
      rtcClientRef.current = null;
      joinedSessionIdRef.current = null;
      setMuted(false);
    }
  };

  const ensureMicrophoneAccess = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicrophonePermission('unsupported');
      throw new Error('This device/browser does not support microphone access for in-app calling.');
    }

    setMicrophonePermission('checking');
    await resumeAudioContext();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      stream.getTracks().forEach((track) => track.stop());
      setMicrophonePermission('granted');
      return true;
    } catch (error) {
      const maybeError = error as DOMException & { name?: string };
      const errorName = maybeError?.name || '';

      if (
        errorName === 'NotAllowedError' ||
        errorName === 'PermissionDeniedError' ||
        errorName === 'SecurityError'
      ) {
        setMicrophonePermission('denied');
        throw new Error(
          'Microphone permission allow karo. Tabhi in-app call laptop ya phone dono par chalegi.'
        );
      }

      if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setMicrophonePermission('unsupported');
        throw new Error('Is device par microphone detect nahi hua. Headset ya phone mic check karo.');
      }

      setMicrophonePermission('prompt');
      throw new Error(
        'Microphone open nahi ho saka. Browser mic access ya device audio settings check karo.'
      );
    }
  };

  const resetCallUi = async (nextNotice?: CallNotice) => {
    await cleanupRtcConnection();
    syncSessionState(null);
    setBusy(false);
    setErrorMessage(null);
    setPhase('idle');
    setSheetMinimized(false);

    if (nextNotice) {
      setNotice(nextNotice);
    }
  };

  const endSession = async (
    nextStatus: DeliveryCallSessionStatus,
    endedReason: string,
    sessionOverride?: DeliveryCallSession | null,
    nextNotice?: CallNotice
  ) => {
    const session = sessionOverride ?? activeSessionRef.current;

    if (!session) {
      await resetCallUi(nextNotice);
      return;
    }

    setBusy(true);
    setPhase('ending');

    try {
      if (isLiveDeliveryCallStatus(session.status)) {
        const { error } = await supabase
          .from('delivery_call_sessions')
          .update({
            status: nextStatus,
            ended_at: new Date().toISOString(),
            ended_reason: endedReason,
          })
          .eq('id', session.id);

        if (error && !isDeliveryCallSchemaMissing(error)) {
          console.error('Error ending delivery call session:', error);
        }
      }
    } finally {
      await resetCallUi(nextNotice);
    }
  };

  const loadAgoraRtc = async () => {
    if (agoraModuleRef.current) {
      return agoraModuleRef.current;
    }

    const module = await import('agora-rtc-sdk-ng');
    const moduleValue = (module as any).default || module;
    agoraModuleRef.current = moduleValue;
    return moduleValue;
  };

  const requestVoiceToken = async (session: DeliveryCallSession) => {
    const response = await fetch('/api/agora/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelName: session.channel_name,
        orderId: session.order_id,
        userAccount: userId,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          appId?: string;
          expiresAt?: number;
          token?: string;
          uid?: string;
          error?: string;
        }
      | null;

    if (!response.ok || !payload?.appId || !payload?.token || !payload?.uid) {
      throw new Error(
        payload?.error ||
          'Voice calling is not configured yet. Add Agora credentials on the server and try again.'
      );
    }

    return payload as {
      appId: string;
      expiresAt: number;
      token: string;
      uid: string;
    };
  };

  const joinAcceptedSession = async (session: DeliveryCallSession) => {
    if (joinedSessionIdRef.current === session.id) {
      setPhase('connected');
      return;
    }

    setBusy(true);
    setErrorMessage(null);
    setPhase('connecting');
    stopRingLoop();
    setSheetMinimized(false);

    try {
      await cleanupRtcConnection();

      const AgoraRTC = await loadAgoraRtc();
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      rtcClientRef.current = client;

      client.on('user-published', async (user: any, mediaType: string) => {
        if (mediaType !== 'audio') {
          return;
        }

        await client.subscribe(user, mediaType);
        user.audioTrack?.play?.();
      });

      client.on('user-unpublished', (user: any, mediaType: string) => {
        if (mediaType === 'audio') {
          user.audioTrack?.stop?.();
        }
      });

      client.on('user-left', () => {
        void endSession('ended', 'participant-left', session, {
          tone: 'info',
          text: 'The other person left the voice call.',
        });
      });

      const tokenPayload = await requestVoiceToken(session);
      await client.join(tokenPayload.appId, session.channel_name, tokenPayload.token, tokenPayload.uid);

      const localTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localTrackRef.current = localTrack;
      await client.publish([localTrack]);

      client.remoteUsers?.forEach((user: any) => {
        user.audioTrack?.play?.();
      });

      joinedSessionIdRef.current = session.id;
      setPhase('connected');
    } catch (error) {
      console.error('Error connecting delivery voice call:', error);

      const nextMessage =
        error instanceof Error
          ? error.message
          : 'Voice call could not be connected right now. Use the phone button once if you need an immediate fallback.';

      setErrorMessage(nextMessage);

      await endSession('failed', 'connection-error', session, {
        tone: 'error',
        text: nextMessage,
      });
    } finally {
      setBusy(false);
    }
  };

  const fetchLatestLiveSession = async () => {
    const { data, error } = await supabase
      .from('delivery_call_sessions')
      .select('*')
      .or(`caller_user_id.eq.${userId},receiver_user_id.eq.${userId}`)
      .in('status', LIVE_DELIVERY_CALL_STATUSES)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    return ((data || [])[0] as DeliveryCallSession | undefined) ?? null;
  };

  const syncLiveSession = async () => {
    try {
      const nextSession = await fetchLatestLiveSession();
      const currentSession = activeSessionRef.current;

      if (!nextSession) {
        if (currentSession && isLiveDeliveryCallStatus(currentSession.status)) {
          missingLiveSessionPollsRef.current += 1;

          if (missingLiveSessionPollsRef.current < 3) {
            return;
          }

          await resetCallUi({
            tone: 'info',
            text:
              currentSession.status === 'ringing'
                ? 'The voice call request was closed.'
                : 'Voice call finished successfully.',
          });
        }

        return;
      }

      missingLiveSessionPollsRef.current = 0;
      syncSessionState(nextSession);

      if (nextSession.status === 'ringing') {
        const ringingTooLong =
          nextSession.caller_user_id === userId &&
          Date.now() - new Date(nextSession.initiated_at).getTime() >= DELIVERY_CALL_RING_TIMEOUT_MS;

        if (ringingTooLong) {
          await endSession('missed', 'no-answer', nextSession, {
            tone: 'info',
            text: 'Call was not answered in time.',
          });
          return;
        }

        setPhase(nextSession.receiver_user_id === userId ? 'incoming' : 'dialing');
        startRingLoop();

        if (!currentSession || currentSession.id !== nextSession.id) {
          setErrorMessage(null);
          setSheetMinimized(false);
        }

        return;
      }

      stopRingLoop();

      if (nextSession.status === 'accepted') {
        if (joinedSessionIdRef.current !== nextSession.id) {
          await joinAcceptedSession(nextSession);
        } else {
          setPhase('connected');
        }
      }
    } catch (error) {
      if (!isDeliveryCallSchemaMissing(error)) {
        console.error('Unexpected delivery voice call sync error:', error);
      }
    }
  };

  const createOutgoingSession = async ({
    callerLabel,
    callerRole,
    orderId,
    receiverLabel,
    receiverRole,
    receiverUserId,
  }: CreateCallSessionArgs) => {
    if (activeSessionRef.current && isLiveDeliveryCallStatus(activeSessionRef.current.status)) {
      pushNotice('info', 'Finish the current voice call before starting a new one.');
      return;
    }

    setBusy(true);
    setErrorMessage(null);
    setSheetMinimized(false);

    try {
      const { data, error } = await supabase
        .from('delivery_call_sessions')
        .insert([
          {
            order_id: orderId,
            channel_name: buildDeliveryCallChannelName(orderId),
            caller_user_id: userId,
            caller_role: callerRole,
            caller_label: callerLabel || null,
            receiver_user_id: receiverUserId,
            receiver_role: receiverRole,
            receiver_label: receiverLabel || null,
            status: 'ringing',
            initiated_at: new Date().toISOString(),
          },
        ])
        .select('*')
        .single();

      if (error) {
        if (isDeliveryCallSchemaMissing(error)) {
          throw new Error('Voice call database setup is not ready yet. Run the latest SQL once and refresh.');
        }

        throw error;
      }

      syncSessionState(data as DeliveryCallSession);
      setPhase('dialing');
      startRingLoop();
    } catch (error) {
      console.error('Error creating outgoing delivery call session:', error);

      pushNotice(
        'error',
        error instanceof Error
          ? error.message
          : 'Voice call could not be started right now. Use the phone button once if needed.'
      );
    } finally {
      setBusy(false);
    }
  };

  const acceptIncomingCall = async () => {
    const session = activeSessionRef.current;

    if (!session || session.receiver_user_id !== userId || session.status !== 'ringing') {
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      await ensureMicrophoneAccess();

      const { data, error } = await supabase
        .from('delivery_call_sessions')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          ended_at: null,
          ended_reason: null,
        })
        .eq('id', session.id)
        .eq('receiver_user_id', userId)
        .eq('status', 'ringing')
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      const nextSession = data as DeliveryCallSession;
      syncSessionState(nextSession);
      await joinAcceptedSession(nextSession);
    } catch (error) {
      console.error('Error accepting incoming delivery call:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Incoming call could not be accepted right now. Please try again.'
      );

      pushNotice(
        'error',
        error instanceof Error
          ? error.message
          : 'Incoming call could not be accepted right now. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleMute = async () => {
    if (!localTrackRef.current) {
      return;
    }

    try {
      const nextMuted = !muted;
      await localTrackRef.current.setEnabled?.(!nextMuted);
      setMuted(nextMuted);
    } catch (error) {
      console.error('Error toggling microphone state:', error);
      pushNotice('error', 'Microphone state could not be changed right now.');
    }
  };

  const startCustomerCall = async (order: Order) => {
    if (!order.delivery_partner_user_id) {
      pushNotice('info', 'Delivery partner is not assigned yet, so in-app calling is not ready for this order.');
      return;
    }

    if (!['assigned', 'picked_up'].includes(order.delivery_assignment_status)) {
      pushNotice('info', 'In-app calling unlocks once the delivery partner has accepted the order.');
      return;
    }

    try {
      await ensureMicrophoneAccess();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Microphone permission is required for calling.');
      pushNotice(
        'error',
        error instanceof Error ? error.message : 'Microphone permission is required for calling.'
      );
      return;
    }

    await createOutgoingSession({
      callerLabel: userDisplayName || order.customer_name || 'Customer',
      callerRole: 'customer',
      orderId: order.id,
      receiverLabel: order.delivery_partner_name || 'Delivery partner',
      receiverRole: 'delivery_partner',
      receiverUserId: order.delivery_partner_user_id,
    });
  };

  const startDeliveryPartnerCall = async (order: Order, callerLabel?: string) => {
    if (!order.user_id) {
      pushNotice(
        'info',
        'This order is not linked to a signed-in user account yet. Use the regular phone call button for this one.'
      );
      return;
    }

    if (order.delivery_partner_user_id !== userId) {
      pushNotice('info', 'Accept this order first, then the in-app voice call button will work here.');
      return;
    }

    if (!['assigned', 'picked_up'].includes(order.delivery_assignment_status)) {
      pushNotice('info', 'In-app call is available while the delivery trip is active.');
      return;
    }

    try {
      await ensureMicrophoneAccess();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Microphone permission is required for calling.');
      pushNotice(
        'error',
        error instanceof Error ? error.message : 'Microphone permission is required for calling.'
      );
      return;
    }

    await createOutgoingSession({
      callerLabel: callerLabel || userDisplayName || 'Delivery partner',
      callerRole: 'delivery_partner',
      orderId: order.id,
      receiverLabel: order.customer_name || 'Customer',
      receiverRole: 'customer',
      receiverUserId: order.user_id,
    });
  };

  useEffect(() => {
    const unlockAudio = () => {
      void resumeAudioContext();
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    void syncMicrophonePermission();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncMicrophonePermission();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    void syncLiveSession();

    const interval = window.setInterval(() => {
      if (isMounted) {
        void syncLiveSession();
      }
    }, DELIVERY_CALL_POLL_INTERVAL);

    const realtimeChannel = supabase
      .channel(`delivery-voice-calls-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_call_sessions',
          filter: `caller_user_id=eq.${userId}`,
        },
        () => {
          if (isMounted) {
            void syncLiveSession();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_call_sessions',
          filter: `receiver_user_id=eq.${userId}`,
        },
        () => {
          if (isMounted) {
            void syncLiveSession();
          }
        }
      )
      .subscribe();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncLiveSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void supabase.removeChannel(realtimeChannel);
      void cleanupRtcConnection();
    };
  }, [userId]);

  const counterpartData = activeSession ? getCounterpartSessionData(activeSession, userId) : null;
  const modalSession =
    activeSession && phase !== 'idle' ? activeSession : null;

  return (
    <DeliveryVoiceCallContext.Provider
      value={{
        activeOrderId: activeSession?.order_id ?? null,
        callBusy: busy || phase !== 'idle',
        startCustomerCall,
        startDeliveryPartnerCall,
      }}
    >
      {children}

      {notice && (
        <div className="pointer-events-none fixed bottom-5 right-4 z-[125] w-full max-w-sm px-2 sm:right-6 sm:px-0">
          <div
            className={`rounded-[24px] border px-4 py-4 text-sm shadow-xl shadow-black/30 ${
              notice.tone === 'error'
                ? 'border-red-400/20 bg-red-500/12 text-red-100'
                : notice.tone === 'success'
                  ? 'border-emerald-400/20 bg-emerald-500/12 text-emerald-100'
                  : 'border-sky-400/20 bg-sky-500/12 text-sky-100'
            }`}
          >
            {notice.text}
          </div>
        </div>
      )}

      {modalSession && counterpartData && sheetMinimized && (
        <button
          type="button"
          onClick={() => setSheetMinimized(false)}
          className="fixed bottom-24 right-4 z-[130] inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-slate-950/90 px-4 py-3 text-left text-white shadow-2xl shadow-black/35 backdrop-blur sm:right-6"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-100">
            <PhoneCall className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{counterpartData.label}</span>
            <span className="block text-xs text-slate-400">
              {phase === 'connected' ? 'Voice call live' : phase === 'incoming' ? 'Incoming call' : 'Calling...'}
            </span>
          </span>
        </button>
      )}

      {modalSession && counterpartData && !sheetMinimized && phase !== 'idle' && (
        <DeliveryVoiceCallModal
          busy={busy}
          canMinimize={phase === 'connected'}
          counterpartLabel={counterpartData.label}
          counterpartRole={counterpartData.role}
          elapsedSeconds={elapsedSeconds}
          errorMessage={errorMessage}
          microphonePermission={microphonePermission}
          muted={muted}
          onAccept={() => void acceptIncomingCall()}
          onClose={() => setSheetMinimized(true)}
          onDecline={() =>
            void endSession('declined', 'declined-by-receiver', modalSession, {
              tone: 'info',
              text: 'Incoming call was declined.',
            })
          }
          onEnd={() =>
            void endSession(
              phase === 'dialing' ? 'cancelled' : 'ended',
              phase === 'dialing' ? 'cancelled-by-caller' : 'ended-by-user',
              modalSession,
              {
                tone: 'info',
                text: phase === 'dialing' ? 'Voice call request cancelled.' : 'Voice call ended.',
              }
            )
          }
          onToggleMute={() => void toggleMute()}
          phase={phase as Exclude<CallPhase, 'idle'>}
          session={modalSession}
        />
      )}
    </DeliveryVoiceCallContext.Provider>
  );
}

export const useDeliveryVoiceCall = () => {
  const context = useContext(DeliveryVoiceCallContext);

  if (!context) {
    throw new Error('useDeliveryVoiceCall must be used within DeliveryVoiceCallProvider');
  }

  return context;
};
