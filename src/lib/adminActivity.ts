import { supabase } from './supabase';

type AdminActivityMetadata = Record<string, unknown>;

type AdminActivityInput = {
  actorUserId: string;
  eventType: string;
  title: string;
  detail?: string;
  metadata?: AdminActivityMetadata;
};

const SESSION_SIGNIN_KEY_PREFIX = 'vajra_admin_signin_logged';

const sanitizeText = (value: string | undefined) => value?.trim() || '';

const getSessionSignInKey = (userId: string) => `${SESSION_SIGNIN_KEY_PREFIX}:${userId}`;

export async function logAdminActivityEvent({
  actorUserId,
  eventType,
  title,
  detail,
  metadata = {},
}: AdminActivityInput) {
  const normalizedActorUserId = sanitizeText(actorUserId);
  const normalizedEventType = sanitizeText(eventType);
  const normalizedTitle = sanitizeText(title);
  const normalizedDetail = sanitizeText(detail);

  if (!normalizedActorUserId || !normalizedEventType || !normalizedTitle) {
    return;
  }

  const { error } = await supabase.from('admin_activity_events').insert([
    {
      actor_user_id: normalizedActorUserId,
      event_type: normalizedEventType,
      title: normalizedTitle,
      detail: normalizedDetail || null,
      metadata,
    },
  ]);

  if (error) {
    console.error('Error logging admin activity event:', error);
  }
}

export async function logAdminSignInEvent(user: {
  id: string;
  email?: string | null;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}) {
  const userId = sanitizeText(user.id);
  if (!userId) return;

  try {
    const sessionKey = getSessionSignInKey(userId);
    if (window.sessionStorage.getItem(sessionKey)) {
      return;
    }

    const provider =
      typeof user.app_metadata?.provider === 'string' ? user.app_metadata.provider : 'unknown';
    const displayName =
      typeof user.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name
        : typeof user.user_metadata?.name === 'string'
          ? user.user_metadata.name
          : typeof user.email === 'string'
            ? user.email.split('@')[0]
            : 'User';

    await logAdminActivityEvent({
      actorUserId: userId,
      eventType: 'user_signed_in',
      title: 'User signed in',
      detail: `${displayName} signed in to The Vajra.`,
      metadata: {
        email: user.email || null,
        provider,
        path: window.location.pathname,
      },
    });

    window.sessionStorage.setItem(sessionKey, new Date().toISOString());
  } catch (error) {
    console.error('Error logging admin sign-in event:', error);
  }
}
