import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const [message, setMessage] = useState('Logging you in...');

  useEffect(() => {
    let cancelled = false;

    const finishSignIn = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const authCode = searchParams.get('code');
      const authError = searchParams.get('error_description') ?? searchParams.get('error');

      if (authError) {
        if (!cancelled) {
          setMessage(`Google sign-in failed: ${authError}`);
        }
        return;
      }

      if (authCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(authCode);

        if (error) {
          if (!cancelled) {
            setMessage(`Google sign-in failed: ${error.message}`);
          }
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        if (!cancelled) {
          setMessage(`Google sign-in failed: ${error.message}`);
        }
        return;
      }

      if (!data.session) {
        if (!cancelled) {
          setMessage('Google sign-in did not return a session. Please try again.');
        }
        return;
      }

      window.location.replace('/');
    };

    void finishSignIn();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#1a1a1a', fontSize: 16 }}>{message}</p>
    </div>
  );
}
