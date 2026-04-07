import { useEffect, useRef, useState } from 'react';
import {
  BellRing,
  Building2,
  CheckCircle2,
  Clock3,
  MapPinned,
  PackageCheck,
  PackageSearch,
  PhoneCall,
  Power,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
  UserRound,
  Volume2,
  VolumeX,
} from 'lucide-react';
import BrandedLoader from './BrandedLoader';
import DeliveryPartnerOnboarding, {
  type DeliveryPartnerOnboardingForm,
} from './DeliveryPartnerOnboarding';
import {
  buildDeliveryPartnerBaseLabel,
  getDefaultDeliveryPartnerForm,
  getDeliveryAssignmentStatusLabel,
  getDeliveryPartnerTypeLabel,
} from '../lib/deliveryPartner';
import {
  formatScheduledDelivery,
  parseOrderDeliveryDetails,
} from '../lib/orderDeliveryDetails';
import {
  supabase,
  type DeliveryPartnerProfile,
  type Order,
  type OrderItem,
  type UserProfile,
} from '../lib/supabase';

interface DeliveryPartnerHubProps {
  userId: string;
  userDisplayName?: string;
  userAvatarUrl?: string | null;
}

type DeliveryOrderWithItems = Order & {
  items: OrderItem[];
};

type StatusMessage = {
  tone: 'success' | 'error' | 'info';
  text: string;
} | null;

type DeliveryTab = 'incoming' | 'assigned' | 'completed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type BrowserNotificationPermissionState =
  | NotificationPermission
  | 'unsupported';

const EMPTY_DELIVERY_FORM: DeliveryPartnerOnboardingForm = {
  name: '',
  phone: '',
  gender: '',
  partnerType: 'hosteller',
  hostelName: '',
  block: '',
  roomNumber: '',
  buildingNumber: '',
  cabinNumber: '',
  areaLabel: '',
};

const DELIVERY_POLL_INTERVAL = 10000;

const formatCurrency = (value: number | null | undefined) =>
  `Rs. ${Number(value ?? 0).toFixed(2)}`;

const isDeliverySchemaMissing = (error: unknown) => {
  const maybeError = error as { code?: string; message?: string; details?: string };
  const details = `${maybeError?.code ?? ''} ${maybeError?.message ?? ''} ${maybeError?.details ?? ''}`.toLowerCase();

  return (
    details.includes('delivery_partner_profiles') ||
    details.includes('delivery_partner_user_id') ||
    details.includes('delivery_assignment_status') ||
    details.includes('42p01') ||
    details.includes('42703') ||
    details.includes('pgrst')
  );
};

const getOrderStatusBadgeClasses = (status: string) => {
  switch (status) {
    case 'pending':
      return 'border-amber-400/25 bg-amber-500/15 text-amber-100';
    case 'confirmed':
      return 'border-sky-400/25 bg-sky-500/15 text-sky-100';
    case 'preparing':
      return 'border-violet-400/25 bg-violet-500/15 text-violet-100';
    case 'out_for_delivery':
      return 'border-emerald-400/25 bg-emerald-500/15 text-emerald-100';
    case 'delivered':
      return 'border-green-400/25 bg-green-500/15 text-green-100';
    case 'cancelled':
    case 'rejected':
      return 'border-red-400/25 bg-red-500/15 text-red-100';
    default:
      return 'border-white/10 bg-white/5 text-slate-200';
  }
};

const getAssignmentBadgeClasses = (status: Order['delivery_assignment_status']) => {
  switch (status) {
    case 'assigned':
      return 'border-sky-400/25 bg-sky-500/15 text-sky-100';
    case 'picked_up':
      return 'border-emerald-400/25 bg-emerald-500/15 text-emerald-100';
    case 'delivered':
      return 'border-green-400/25 bg-green-500/15 text-green-100';
    case 'unassigned':
    default:
      return 'border-white/10 bg-white/5 text-slate-200';
  }
};

export default function DeliveryPartnerHub({
  userId,
  userDisplayName = '',
  userAvatarUrl = null,
}: DeliveryPartnerHubProps) {
  const [profile, setProfile] = useState<DeliveryPartnerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);
  const [activeTab, setActiveTab] = useState<DeliveryTab>('incoming');
  const [availableOrders, setAvailableOrders] = useState<DeliveryOrderWithItems[]>([]);
  const [assignedOrders, setAssignedOrders] = useState<DeliveryOrderWithItems[]>([]);
  const [completedOrders, setCompletedOrders] = useState<DeliveryOrderWithItems[]>([]);
  const [initialFormValues, setInitialFormValues] =
    useState<DeliveryPartnerOnboardingForm>(EMPTY_DELIVERY_FORM);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installReady, setInstallReady] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<BrowserNotificationPermissionState>(() => {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'unsupported';
      }

      return window.Notification.permission;
    });
  const incomingOrderIdsRef = useRef<string[]>([]);
  const hasLoadedOrdersRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    document.title = 'Delivery partner mode | The Vajra';
  }, []);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setStatusMessage(null);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

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

  const primeAlertAudio = async () => {
    const audioContext = getAudioContext();

    if (!audioContext) {
      return;
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
  };

  const playIncomingOrderTone = async () => {
    if (!profile?.alert_sound_enabled) {
      return;
    }

    const audioContext = getAudioContext();

    if (!audioContext) {
      return;
    }

    if (audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch {
        return;
      }
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
      oscillator.stop(endAt + 0.02);
    };

    const tonePattern = [
      720, 980, 760, 1020, 740, 980, 760, 1040,
    ];

    tonePattern.forEach((frequency, index) => {
      emitBeep(index * 0.4, 0.24, frequency);
    });

    if ('vibrate' in navigator) {
      navigator.vibrate?.([220, 120, 220, 120, 220, 120, 220, 120, 220]);
    }
  };

  const syncNotificationPermission = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }

    setNotificationPermission(window.Notification.permission);
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported');
      setStatusMessage({
        tone: 'info',
        text: 'This browser does not support delivery notifications.',
      });
      return 'unsupported' as const;
    }

    const permission = await window.Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      setStatusMessage({
        tone: 'success',
        text: 'Notification permission granted. New orders will also trigger device notifications.',
      });
    } else if (permission === 'denied') {
      setStatusMessage({
        tone: 'info',
        text: 'Notification permission was denied. Sound alerts will still work while the app is open.',
      });
    }

    return permission;
  };

  const showIncomingOrderNotification = async (
    order: DeliveryOrderWithItems,
    totalNewOrders: number
  ) => {
    if (notificationPermission !== 'granted') {
      return;
    }

    const body =
      totalNewOrders > 1
        ? `${totalNewOrders} new orders are waiting. First: ${order.restaurant_name || 'Restaurant'} • ${formatCurrency(order.total_amount)}`
        : `${order.restaurant_name || 'Restaurant'} • ${formatCurrency(order.total_amount)} • Tap to open delivery dashboard`;

    try {
      const serviceWorkerRegistration =
        'serviceWorker' in navigator
          ? await navigator.serviceWorker.getRegistration()
          : null;

      if (serviceWorkerRegistration) {
        await serviceWorkerRegistration.showNotification('New delivery order', {
          body,
          icon: '/the-vajra-mark.svg',
          badge: '/the-vajra-mark.svg',
          tag: totalNewOrders > 1 ? 'delivery-order-batch' : `delivery-order-${order.id}`,
          renotify: true,
          requireInteraction: false,
          data: {
            orderId: order.id,
            scope: 'delivery-partner',
          },
        });
        return;
      }
    } catch (error) {
      console.error('Error showing service worker notification:', error);
    }

    try {
      const notification = new window.Notification('New delivery order', {
        body,
        icon: '/the-vajra-mark.svg',
        tag: totalNewOrders > 1 ? 'delivery-order-batch' : `delivery-order-${order.id}`,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  };

  const loadPartnerContext = async () => {
    setProfileLoading(true);
    setSetupMessage(null);

    try {
      const [{ data: userProfileData, error: userProfileError }, { data: partnerProfileData, error: partnerProfileError }] =
        await Promise.all([
          supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle(),
          supabase
            .from('delivery_partner_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle(),
        ]);

      if (userProfileError) {
        throw userProfileError;
      }

      if (partnerProfileError) {
        if (isDeliverySchemaMissing(partnerProfileError)) {
          setSetupMessage(
            'Delivery partner setup is waiting for the latest database migration. Run the new migration once and refresh this screen.'
          );
          setProfile(null);
          return;
        }

        throw partnerProfileError;
      }

      const userProfile = (userProfileData as UserProfile | null) ?? null;
      setInitialFormValues({
        ...EMPTY_DELIVERY_FORM,
        ...getDefaultDeliveryPartnerForm(userProfile),
      });
      setProfile((partnerProfileData as DeliveryPartnerProfile | null) ?? null);
    } catch (error) {
      console.error('Error loading delivery partner context:', error);
      setSetupMessage('We could not prepare delivery mode right now. Please refresh and try again.');
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadOrders = async (showLoader = false) => {
    if (!profile) {
      setAvailableOrders([]);
      setAssignedOrders([]);
      setCompletedOrders([]);
      setOrdersLoading(false);
      return;
    }

    if (showLoader) {
      setOrdersLoading(true);
    }

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(40);

      if (ordersError) {
        throw ordersError;
      }

      const orders = (ordersData || []) as Order[];
      const orderIds = orders.map((order) => order.id);
      const itemsByOrderId = new Map<string, OrderItem[]>();

      if (orderIds.length > 0) {
        const { data: orderItemsData, error: orderItemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);

        if (orderItemsError) {
          throw orderItemsError;
        }

        for (const item of (orderItemsData || []) as OrderItem[]) {
          const nextItems = itemsByOrderId.get(item.order_id) || [];
          nextItems.push(item);
          itemsByOrderId.set(item.order_id, nextItems);
        }
      }

      const ordersWithItems: DeliveryOrderWithItems[] = orders.map((order) => ({
        ...order,
        items: itemsByOrderId.get(order.id) || [],
      }));

      const nextAvailableOrders = ordersWithItems.filter(
        (order) =>
          order.delivery_partner_user_id === null &&
          order.delivery_assignment_status === 'unassigned' &&
          ['pending', 'confirmed', 'preparing'].includes(order.status)
      );
      const nextAssignedOrders = ordersWithItems.filter(
        (order) =>
          order.delivery_partner_user_id === userId &&
          !['cancelled', 'rejected', 'delivered'].includes(order.status) &&
          order.delivery_assignment_status !== 'delivered'
      );
      const nextCompletedOrders = ordersWithItems.filter(
        (order) =>
          order.delivery_partner_user_id === userId &&
          (order.delivery_assignment_status === 'delivered' || order.status === 'delivered')
      );

      const nextIncomingOrderIds = nextAvailableOrders.map((order) => order.id);
      const newIncomingOrders = nextAvailableOrders.filter(
        (order) => !incomingOrderIdsRef.current.includes(order.id)
      );
      const hasNewIncomingOrder =
        hasLoadedOrdersRef.current &&
        newIncomingOrders.length > 0;

      if (profile.is_online && profile.alert_sound_enabled && hasNewIncomingOrder) {
        void playIncomingOrderTone();
        void showIncomingOrderNotification(newIncomingOrders[0], newIncomingOrders.length);
        setStatusMessage({
          tone: 'info',
          text:
            newIncomingOrders.length > 1
              ? `${newIncomingOrders.length} new orders landed in your delivery queue.`
              : 'New incoming order landed in your delivery queue.',
        });
      }

      incomingOrderIdsRef.current = nextIncomingOrderIds;
      hasLoadedOrdersRef.current = true;

      setAvailableOrders(nextAvailableOrders);
      setAssignedOrders(nextAssignedOrders);
      setCompletedOrders(nextCompletedOrders);
    } catch (error) {
      console.error('Error loading delivery orders:', error);

      if (isDeliverySchemaMissing(error)) {
        setSetupMessage(
          'Delivery partner tables are not ready on the connected database yet. Apply the new migration and refresh.'
        );
      } else {
        setStatusMessage({
          tone: 'error',
          text: 'We could not refresh delivery orders right now.',
        });
      }
    } finally {
      if (showLoader) {
        setOrdersLoading(false);
      }
    }
  };

  const updatePartnerProfile = async (
    updates: Partial<DeliveryPartnerProfile>,
    successText: string
  ) => {
    if (!profile) {
      return;
    }

    const { data, error } = await supabase
      .from('delivery_partner_profiles')
      .update({
        ...updates,
        last_seen_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    setProfile(data as DeliveryPartnerProfile);
    setStatusMessage({ tone: 'success', text: successText });
  };

  useEffect(() => {
    void loadPartnerContext();
  }, [userId]);

  useEffect(() => {
    hasLoadedOrdersRef.current = false;
    incomingOrderIdsRef.current = [];
  }, [profile?.id]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    void loadOrders(true);
    const interval = window.setInterval(() => {
      void loadOrders(false);
    }, DELIVERY_POLL_INTERVAL);

    return () => window.clearInterval(interval);
  }, [profile?.id, profile?.is_online, profile?.alert_sound_enabled, userId]);

  useEffect(() => {
    const unlockAudio = () => {
      void primeAlertAudio();
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
      setInstallReady(true);
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setInstallReady(false);
      setStatusMessage({
        tone: 'success',
        text: 'Delivery app installed successfully on this device.',
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    syncNotificationPermission();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncNotificationPermission();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleRegisterPartner = async (values: DeliveryPartnerOnboardingForm) => {
    setSavingProfile(true);
    setStatusMessage(null);

    try {
      const payload = {
        user_id: userId,
        name: values.name,
        phone: values.phone,
        gender: values.gender,
        partner_type: values.partnerType,
        hostel_name: values.partnerType === 'hosteller' ? values.hostelName || null : null,
        block: values.partnerType === 'hosteller' ? values.block || null : null,
        room_number: values.partnerType === 'hosteller' ? values.roomNumber || null : null,
        building_number: values.partnerType === 'teacher' ? values.buildingNumber || null : null,
        cabin_number: values.partnerType === 'teacher' ? values.cabinNumber || null : null,
        area_label: values.partnerType === 'non_hosteller' ? values.areaLabel || null : null,
        account_mode: 'delivery',
        is_online: false,
        alert_sound_enabled: true,
        last_seen_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('delivery_partner_profiles')
        .upsert([payload], { onConflict: 'user_id' })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      setProfile(data as DeliveryPartnerProfile);
      setStatusMessage({
        tone: 'success',
        text: 'Delivery profile created. You can now go online and start taking orders.',
      });
    } catch (error) {
      console.error('Error creating delivery partner profile:', error);
      setStatusMessage({
        tone: 'error',
        text: 'Delivery profile could not be created right now. Please check the form and try again.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleOnline = async () => {
    if (!profile) {
      return;
    }

    try {
      if (!profile.is_online) {
        await primeAlertAudio();
        if (notificationPermission === 'default') {
          await requestNotificationPermission();
        }
      }

      await updatePartnerProfile(
        { is_online: !profile.is_online },
        profile.is_online
          ? 'You are now offline. New orders will stay muted.'
          : 'You are now online and ready for incoming orders.'
      );
    } catch (error) {
      console.error('Error updating online state:', error);
      setStatusMessage({
        tone: 'error',
        text: 'We could not update your delivery availability right now.',
      });
    }
  };

  const handleToggleAlertSound = async () => {
    if (!profile) {
      return;
    }

    try {
      if (!profile.alert_sound_enabled) {
        await primeAlertAudio();
      }

      await updatePartnerProfile(
        { alert_sound_enabled: !profile.alert_sound_enabled },
        profile.alert_sound_enabled
          ? 'Incoming order alert sound turned off.'
          : 'Incoming order alert sound turned on.'
      );
    } catch (error) {
      console.error('Error updating alert sound preference:', error);
      setStatusMessage({
        tone: 'error',
        text: 'We could not update the alert sound setting right now.',
      });
    }
  };

  const handleAcceptOrder = async (order: DeliveryOrderWithItems) => {
    if (!profile || processingOrderId) {
      return;
    }

    setProcessingOrderId(order.id);

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          delivery_partner_user_id: userId,
          delivery_partner_name: profile.name,
          delivery_partner_phone: profile.phone,
          delivery_assignment_status: 'assigned',
          delivery_partner_accepted_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .is('delivery_partner_user_id', null)
        .eq('delivery_assignment_status', 'unassigned')
        .select('*')
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setStatusMessage({
          tone: 'info',
          text: 'This order was already picked by another delivery partner.',
        });
      } else {
        setStatusMessage({
          tone: 'success',
          text: `Order ${order.id.slice(0, 8)} is now assigned to you.`,
        });
      }

      await loadOrders(false);
      setActiveTab('assigned');
    } catch (error) {
      console.error('Error accepting order:', error);
      setStatusMessage({
        tone: 'error',
        text: 'We could not accept this order right now.',
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleMarkPickedUp = async (order: DeliveryOrderWithItems) => {
    if (processingOrderId) {
      return;
    }

    setProcessingOrderId(order.id);

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'out_for_delivery',
          delivery_assignment_status: 'picked_up',
          delivery_picked_up_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .eq('delivery_partner_user_id', userId);

      if (error) {
        throw error;
      }

      setStatusMessage({
        tone: 'success',
        text: `Order ${order.id.slice(0, 8)} is now marked out for delivery.`,
      });
      await loadOrders(false);
    } catch (error) {
      console.error('Error marking order as picked up:', error);
      setStatusMessage({
        tone: 'error',
        text: 'We could not mark this order as picked up.',
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleMarkDelivered = async (order: DeliveryOrderWithItems) => {
    if (processingOrderId) {
      return;
    }

    setProcessingOrderId(order.id);

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          delivery_assignment_status: 'delivered',
          delivered_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .eq('delivery_partner_user_id', userId);

      if (error) {
        throw error;
      }

      setStatusMessage({
        tone: 'success',
        text: `Order ${order.id.slice(0, 8)} marked as delivered.`,
      });
      await loadOrders(false);
      setActiveTab('completed');
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      setStatusMessage({
        tone: 'error',
        text: 'We could not mark this order as delivered.',
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleInstallApp = async () => {
    if (!installPromptEvent) {
      setStatusMessage({
        tone: 'info',
        text: 'Use your browser menu and choose Add to Home Screen or Install App.',
      });
      return;
    }

    await installPromptEvent.prompt();
    const result = await installPromptEvent.userChoice;

    if (result.outcome === 'accepted') {
      setInstallReady(false);
      setInstallPromptEvent(null);
    }
  };

  const queueValue = availableOrders.length;
  const liveTripsValue = assignedOrders.length;
  const completedValue = completedOrders.length;
  const completedOrderWorth = completedOrders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0
  );
  const visibleOrders =
    activeTab === 'incoming'
      ? availableOrders
      : activeTab === 'assigned'
        ? assignedOrders
        : completedOrders;
  const notificationStatusLabel =
    notificationPermission === 'granted'
      ? 'Allowed'
      : notificationPermission === 'denied'
        ? 'Blocked'
        : notificationPermission === 'default'
          ? 'Ask me'
          : 'Unsupported';

  if (profileLoading) {
    return <BrandedLoader message="Preparing delivery partner mode..." />;
  }

  if (setupMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),rgba(3,7,18,0.98)_48%),linear-gradient(180deg,#020617_0%,#07111d_100%)] px-4 py-8">
        <div className="w-full max-w-2xl rounded-[32px] border border-amber-400/20 bg-slate-950/80 p-6 shadow-2xl shadow-black/30">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
            <ShieldCheck className="h-4 w-4" />
            Setup pending
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Delivery partner mode needs one database update first.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
            {setupMessage}
          </p>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-300">
            Apply the latest delivery migration, refresh the app, and this full rider dashboard will start working without disturbing the customer side.
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <DeliveryPartnerOnboarding
        initialValues={initialFormValues}
        loading={savingProfile}
        errorMessage={statusMessage?.tone === 'error' ? statusMessage.text : ''}
        userAvatarUrl={userAvatarUrl}
        onSubmit={handleRegisterPartner}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),rgba(2,6,23,0.98)_45%),linear-gradient(135deg,#020617_0%,#071421_48%,#03131e_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {statusMessage && (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
              statusMessage.tone === 'success'
                ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-50'
                : statusMessage.tone === 'info'
                  ? 'border-sky-400/20 bg-sky-500/10 text-sky-50'
                  : 'border-red-400/20 bg-red-500/10 text-red-50'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <section className="overflow-hidden rounded-[34px] border border-emerald-400/15 bg-slate-950/70 shadow-2xl shadow-black/35">
          <div className="grid gap-6 border-b border-white/10 px-6 py-6 xl:grid-cols-[1.1fr,0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                <Truck className="h-4 w-4" />
                Delivery mode live
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {userDisplayName.trim() || profile.name}, your rider dashboard is ready.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                The customer storefront stays hidden while delivery mode is on. Incoming food orders, accept actions,
                customer calls, and live trip status all run from this screen.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Incoming queue', value: queueValue, accent: 'text-emerald-100' },
                  { label: 'Live trips', value: liveTripsValue, accent: 'text-sky-100' },
                  { label: 'Completed', value: completedValue, accent: 'text-violet-100' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {item.label}
                    </p>
                    <p className={`mt-2 text-3xl font-black ${item.accent}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleToggleOnline}
                className={`rounded-[28px] border p-5 text-left transition ${
                  profile.is_online
                    ? 'border-emerald-400/30 bg-emerald-500/15 text-white'
                    : 'border-white/10 bg-white/[0.03] text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40">
                    <Power className="h-5 w-5 text-emerald-200" />
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      profile.is_online ? 'bg-emerald-300 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {profile.is_online ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="mt-4 text-lg font-bold">
                  {profile.is_online ? 'Pause new orders' : 'Start taking orders'}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {profile.is_online
                    ? 'You are visible for new delivery assignments right now.'
                    : 'Go online whenever you are ready to hear new order alerts.'}
                </p>
              </button>

              <button
                type="button"
                onClick={handleToggleAlertSound}
                className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 text-left text-slate-200 transition hover:border-white/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40">
                    {profile.alert_sound_enabled ? (
                      <Volume2 className="h-5 w-5 text-sky-200" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    {profile.alert_sound_enabled ? 'Sound on' : 'Muted'}
                  </span>
                </div>
                <p className="mt-4 text-lg font-bold text-white">Incoming order alert</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  A short rider tone plays when a new order hits your queue while you are online.
                </p>
              </button>

              <button
                type="button"
                onClick={() => void requestNotificationPermission()}
                disabled={notificationPermission === 'granted' || notificationPermission === 'unsupported'}
                className={`rounded-[28px] border p-5 text-left transition ${
                  notificationPermission === 'granted'
                    ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-50'
                    : 'border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/20'
                } ${
                  notificationPermission === 'granted' || notificationPermission === 'unsupported'
                    ? 'cursor-default'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40">
                    <BellRing className="h-5 w-5 text-emerald-200" />
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    {notificationStatusLabel}
                  </span>
                </div>
                <p className="mt-4 text-lg font-bold text-white">Order notifications</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {notificationPermission === 'granted'
                    ? 'Device notifications are enabled. New orders can alert even when the app is in the background.'
                    : notificationPermission === 'denied'
                      ? 'Notifications are blocked. Allow them from browser settings if you want popup alerts.'
                      : notificationPermission === 'unsupported'
                        ? 'This browser does not support system notifications.'
                        : 'Tap here once to allow notification permission for new incoming delivery orders.'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => void loadOrders(true)}
                className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 text-left text-slate-200 transition hover:border-white/20"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40">
                  <RefreshCcw className="h-5 w-5 text-violet-200" />
                </div>
                <p className="mt-4 text-lg font-bold text-white">Refresh delivery queue</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Pull the latest incoming, active, and completed order state instantly.
                </p>
              </button>

              <button
                type="button"
                onClick={handleInstallApp}
                className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 text-left text-slate-200 transition hover:border-white/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40">
                    <Smartphone className="h-5 w-5 text-emerald-200" />
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    {installReady ? 'Ready' : 'Browser install'}
                  </span>
                </div>
                <p className="mt-4 text-lg font-bold text-white">Install this delivery app</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Pin it on the home screen for a full-screen rider experience on mobile.
                </p>
              </button>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1.15fr,0.85fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'incoming', label: 'Incoming orders', count: availableOrders.length },
                  { id: 'assigned', label: 'My active trips', count: assignedOrders.length },
                  { id: 'completed', label: 'Completed', count: completedOrders.length },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as DeliveryTab)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      activeTab === item.id
                        ? 'border-emerald-400/35 bg-emerald-500/15 text-white'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">{item.count}</span>
                  </button>
                ))}
              </div>

              {ordersLoading ? (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8">
                  <BrandedLoader message="Loading delivery orders..." />
                </div>
              ) : visibleOrders.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
                  <PackageSearch className="mx-auto h-16 w-16 text-slate-600" />
                  <h2 className="mt-4 text-2xl font-bold text-white">
                    {activeTab === 'incoming'
                      ? 'No incoming orders right now'
                      : activeTab === 'assigned'
                        ? 'No active delivery trips'
                        : 'No completed deliveries yet'}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {activeTab === 'incoming'
                      ? 'Go online and keep this dashboard open. New food orders will show up here with sound alerts.'
                      : activeTab === 'assigned'
                        ? 'Accept an order from the incoming queue and it will move here instantly.'
                        : 'Delivered orders assigned to you will build a recent history here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {visibleOrders.map((order) => {
                    const deliveryDetails = parseOrderDeliveryDetails(order.delivery_address);
                    const canMarkPickedUp =
                      order.delivery_partner_user_id === userId &&
                      order.delivery_assignment_status === 'assigned';
                    const canMarkDelivered =
                      order.delivery_partner_user_id === userId &&
                      (order.delivery_assignment_status === 'assigned' ||
                        order.delivery_assignment_status === 'picked_up');

                    return (
                      <article
                        key={order.id}
                        className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.86)_0%,rgba(3,7,18,0.92)_100%)] shadow-xl shadow-black/20"
                      >
                        <div className="border-b border-white/10 px-5 py-5">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Order {order.id.slice(0, 8)}
                              </p>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                                  <Store className="h-3.5 w-3.5" />
                                  {order.restaurant_name || 'Restaurant'}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getOrderStatusBadgeClasses(
                                    order.status
                                  )}`}
                                >
                                  {order.status.replace(/_/g, ' ')}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getAssignmentBadgeClasses(
                                    order.delivery_assignment_status
                                  )}`}
                                >
                                  {getDeliveryAssignmentStatusLabel(order.delivery_assignment_status)}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              {activeTab === 'incoming' && (
                                <button
                                  type="button"
                                  onClick={() => void handleAcceptOrder(order)}
                                  disabled={processingOrderId === order.id}
                                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Truck className="h-4 w-4" />
                                  {processingOrderId === order.id ? 'Accepting...' : 'Accept order'}
                                </button>
                              )}

                              {canMarkPickedUp && (
                                <button
                                  type="button"
                                  onClick={() => void handleMarkPickedUp(order)}
                                  disabled={processingOrderId === order.id}
                                  className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <PackageCheck className="h-4 w-4" />
                                  {processingOrderId === order.id ? 'Updating...' : 'Mark picked up'}
                                </button>
                              )}

                              {canMarkDelivered && (
                                <button
                                  type="button"
                                  onClick={() => void handleMarkDelivered(order)}
                                  disabled={processingOrderId === order.id}
                                  className="inline-flex items-center justify-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-5 py-3 text-sm font-semibold text-green-100 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  {processingOrderId === order.id ? 'Saving...' : 'Mark delivered'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 px-5 py-5 xl:grid-cols-[1.15fr,0.85fr]">
                          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              <MapPinned className="h-4 w-4" />
                              Delivery destination
                            </div>
                            <p className="text-lg font-bold text-white">{order.customer_name}</p>
                            <p className="mt-1 text-sm text-slate-300">{order.customer_phone}</p>
                            <p className="mt-3 text-sm leading-7 text-slate-300">{deliveryDetails.address}</p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <a
                                href={`tel:${order.customer_phone}`}
                                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-500/20"
                              >
                                <PhoneCall className="h-4 w-4" />
                                Call customer
                              </a>
                              {deliveryDetails.preference && (
                                <span className="inline-flex rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-100">
                                  {deliveryDetails.preference}
                                </span>
                              )}
                              {deliveryDetails.scheduledDeliveryAt && (
                                <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-100">
                                  <Clock3 className="h-3.5 w-3.5" />
                                  {formatScheduledDelivery(deliveryDetails.scheduledDeliveryAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Order breakdown
                              </p>
                              <span className="rounded-full bg-black/20 px-3 py-1 text-xs text-slate-300">
                                {order.items.length} item{order.items.length === 1 ? '' : 's'}
                              </span>
                            </div>

                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                                  <div className="min-w-0">
                                    <p className="font-semibold text-white">{item.item_name}</p>
                                    <p className="text-slate-400">Qty {item.quantity}</p>
                                  </div>
                                  <span className="whitespace-nowrap text-slate-200">
                                    {formatCurrency(item.price * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                              <div className="flex items-center justify-between text-slate-300">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal_amount ?? 0)}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span>Delivery fee</span>
                                <span>{formatCurrency(order.delivery_fee ?? 0)}</span>
                              </div>
                              <div className="flex items-center justify-between pt-2">
                                <span className="font-semibold text-white">Total bill</span>
                                <span className="text-xl font-black text-emerald-100">
                                  {formatCurrency(order.total_amount)}
                                </span>
                              </div>
                              {order.payment_method && (
                                <div className="flex items-center justify-between text-slate-400">
                                  <span>Payment method</span>
                                  <span className="capitalize">{order.payment_method.replace(/_/g, ' ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50">
                    {userAvatarUrl ? (
                      <img src={userAvatarUrl} alt="Partner avatar" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound className="h-8 w-8 text-slate-200" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-black text-white">{profile.name}</p>
                    <p className="text-sm text-slate-300">{getDeliveryPartnerTypeLabel(profile.partner_type)}</p>
                    <p className="mt-1 text-sm text-slate-400">{buildDeliveryPartnerBaseLabel(profile)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Registered phone
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">{profile.phone}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-slate-950/55 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Completed order value
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">{formatCurrency(completedOrderWorth)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-emerald-400/15 bg-emerald-500/10 p-5">
                <div className="flex items-center gap-3">
                  <BellRing className="h-5 w-5 text-emerald-100" />
                  <p className="text-lg font-bold text-white">Incoming order alert flow</p>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-emerald-50/85">
                  <p>1. Go online when you are free.</p>
                  <p>2. Keep this page open or install it on mobile.</p>
                  <p>3. New orders appear in the queue and trigger a short rider sound.</p>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-sky-200" />
                  <p className="text-lg font-bold text-white">Install tip</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {installReady
                    ? 'Your browser is ready to install this as an app. Tap the install button above and pin the rider dashboard on the home screen.'
                    : 'If the install prompt is not visible, open the browser menu and choose Add to Home Screen or Install App.'}
                </p>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-violet-200" />
                  <p className="text-lg font-bold text-white">Delivery checklist</p>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  <p>Accept only the orders you can actually complete quickly.</p>
                  <p>Mark picked up when food is with you and the trip has started.</p>
                  <p>Use the customer call button for exact location or gate coordination.</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
