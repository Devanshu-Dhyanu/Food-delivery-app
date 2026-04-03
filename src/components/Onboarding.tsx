import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

export default function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    gender: '',
    location_type: '',
    hostel_name: '',
    block: '',
    room_number: '',
    building_number: '',
    exact_location: '',
    uid: '',
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const boyHostels = ['BH1', 'BH2', 'BH3', 'BH4', 'BH5', 'BH6', 'BH7', 'BH8', 'BH9', 'BH10'];
  const girlHostels = ['GH1', 'GH2', 'GH3', 'GH4', 'GH5', 'GH6', 'GH7', 'GH8', 'GH9'];

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from('user_profiles').upsert(
      [
        {
          user_id: userId,
          name: form.name,
          phone: form.phone,
          gender: form.gender,
          location_type: form.location_type,
          hostel_name: form.hostel_name || null,
          block: form.block || null,
          room_number: form.room_number || null,
          building_number: form.building_number || null,
          exact_location: form.exact_location || null,
          uid: form.uid,
        },
      ],
      { onConflict: 'user_id' }
    );
    setLoading(false);
    if (!error) {
      onComplete();
    } else {
      alert('Error saving profile. Try again.');
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>Complete Your Profile</h2>
        <p style={s.sub}>Step {step} of {form.gender === '' ? '3' : form.location_type === '' ? '3' : '3'}</p>

        {step === 1 && (
          <div style={s.section}>
            <label style={s.label}>Full Name</label>
            <input style={s.input} placeholder="Your name" value={form.name} onChange={(e) => update('name', e.target.value)} />

            <label style={s.label}>Phone Number</label>
            <input
              style={s.input}
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />

            <label style={s.label}>Gender</label>
            <div style={s.row}>
              {['Male', 'Female'].map((g) => (
                <button
                  key={g}
                  style={{ ...s.chip, ...(form.gender === g ? s.chipActive : {}) }}
                  onClick={() => update('gender', g)}
                >
                  {g}
                </button>
              ))}
            </div>

            <button style={s.btn} disabled={!form.name || !form.phone || !form.gender} onClick={() => setStep(2)}>
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={s.section}>
            <label style={s.label}>Where are you ordering from?</label>
            <div style={s.col}>
              {['Hostel', 'Class', 'Studio Apartment', 'Apartment', 'Other'].map((loc) => (
                <button
                  key={loc}
                  style={{ ...s.chip, ...(form.location_type === loc ? s.chipActive : {}) }}
                  onClick={() => update('location_type', loc)}
                >
                  {loc}
                </button>
              ))}
            </div>

            {form.location_type === 'Hostel' && (
              <>
                <label style={s.label}>Hostel Name</label>
                <div style={s.grid}>
                  {(form.gender === 'Male' ? boyHostels : girlHostels).map((h) => (
                    <button
                      key={h}
                      style={{ ...s.chip, ...(form.hostel_name === h ? s.chipActive : {}) }}
                      onClick={() => update('hostel_name', h)}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                <label style={s.label}>Block</label>
                <input style={s.input} placeholder="e.g. A, B, C" value={form.block} onChange={(e) => update('block', e.target.value)} />
                <label style={s.label}>Room Number</label>
                <input
                  style={s.input}
                  placeholder="e.g. 101"
                  value={form.room_number}
                  onChange={(e) => update('room_number', e.target.value)}
                />
              </>
            )}

            {form.location_type === 'Class' && (
              <>
                <label style={s.label}>Building Number</label>
                <input
                  style={s.input}
                  placeholder="e.g. Block 32"
                  value={form.building_number}
                  onChange={(e) => update('building_number', e.target.value)}
                />
                <label style={s.label}>Room/Class Number</label>
                <input
                  style={s.input}
                  placeholder="e.g. 101"
                  value={form.room_number}
                  onChange={(e) => update('room_number', e.target.value)}
                />
              </>
            )}

            {(form.location_type === 'Studio Apartment' || form.location_type === 'Apartment') && (
              <>
                <label style={s.label}>Block</label>
                <input style={s.input} placeholder="Block name/number" value={form.block} onChange={(e) => update('block', e.target.value)} />
                <label style={s.label}>Room Number</label>
                <input
                  style={s.input}
                  placeholder="e.g. 201"
                  value={form.room_number}
                  onChange={(e) => update('room_number', e.target.value)}
                />
              </>
            )}

            {form.location_type === 'Other' && (
              <>
                <label style={s.label}>Nearest Building</label>
                <input
                  style={s.input}
                  placeholder="e.g. Block 34"
                  value={form.building_number}
                  onChange={(e) => update('building_number', e.target.value)}
                />
                <label style={s.label}>Exact Location</label>
                <input
                  style={s.input}
                  placeholder="Describe your location"
                  value={form.exact_location}
                  onChange={(e) => update('exact_location', e.target.value)}
                />
              </>
            )}

            <div style={s.row}>
              <button style={s.btnOutline} onClick={() => setStep(1)}>
                ← Back
              </button>
              <button style={s.btn} disabled={!form.location_type} onClick={() => setStep(3)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={s.section}>
            <label style={s.label}>University ID (UID)</label>
            <input style={s.input} placeholder="e.g. 12345678" value={form.uid} onChange={(e) => update('uid', e.target.value)} />

            <div style={s.row}>
              <button style={s.btnOutline} onClick={() => setStep(2)}>
                ← Back
              </button>
              <button style={s.btn} disabled={!form.uid || loading} onClick={handleSave}>
                {loading ? 'Saving...' : 'Save & Continue →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#060d1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    background: '#0f1c2e',
    borderRadius: 16,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 480,
    border: '1px solid #1e3a5f',
  },
  title: { color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 4, fontFamily: 'DM Sans, sans-serif' },
  sub: { color: '#ff6124', fontSize: 13, marginBottom: 28 },
  section: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { color: '#a0b4c8', fontSize: 13, fontWeight: 500 },
  input: {
    background: '#1a2d45',
    border: '1px solid #1e3a5f',
    borderRadius: 8,
    padding: '12px 16px',
    color: '#fff',
    fontSize: 15,
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
  },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  col: { display: 'flex', flexDirection: 'column', gap: 8 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  chip: {
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid #1e3a5f',
    background: '#1a2d45',
    color: '#a0b4c8',
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  chipActive: { background: '#ff6124', border: '1px solid #ff6124', color: '#fff' },
  btn: {
    padding: '13px 24px',
    background: '#ff6124',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
    fontWeight: 600,
  },
  btnOutline: {
    padding: '13px 24px',
    background: 'transparent',
    color: '#ff6124',
    border: '1px solid #ff6124',
    borderRadius: 8,
    fontSize: 15,
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
  },
};
