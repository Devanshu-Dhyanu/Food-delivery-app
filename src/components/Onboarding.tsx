import { useState, type CSSProperties } from 'react';
import { supabase } from '../lib/supabase';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

type UserRole = 'student' | 'teacher' | '';

type OnboardingForm = {
  name: string;
  phone: string;
  gender: string;
  user_role: UserRole;
  location_type: string;
  hostel_name: string;
  block: string;
  room_number: string;
  building_number: string;
  cabin_number: string;
  exact_location: string;
  uid: string;
};

const initialForm: OnboardingForm = {
  name: '',
  phone: '',
  gender: '',
  user_role: '',
  location_type: '',
  hostel_name: '',
  block: '',
  room_number: '',
  building_number: '',
  cabin_number: '',
  exact_location: '',
  uid: '',
};

const boyHostels = ['BH1', 'BH2', 'BH3', 'BH4', 'BH5', 'BH6', 'BH7', 'BH8', 'BH9', 'BH10'];
const girlHostels = ['GH1', 'GH2', 'GH3', 'GH4', 'GH5', 'GH6', 'GH7', 'GH8', 'GH9'];
const locationOptions = ['Hostel', 'Class', 'Studio Apartment', 'Apartment', 'Other'];

export default function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState<OnboardingForm>(initialForm);

  const update = (key: keyof OnboardingForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrorMessage('');
  };

  const updateRole = (role: Exclude<UserRole, ''>) => {
    setForm((prev) => ({
      ...prev,
      user_role: role,
      location_type: role === 'teacher' ? 'Faculty Cabin' : '',
      hostel_name: '',
      block: '',
      room_number: '',
      building_number: '',
      cabin_number: '',
      exact_location: '',
    }));
    setErrorMessage('');
  };

  const isStepOneValid =
    !!form.name.trim() && !!form.phone.trim() && !!form.gender && !!form.user_role;

  const isStudentStepTwoValid = !!form.location_type;
  const isTeacherStepTwoValid =
    !!form.building_number.trim() && !!form.cabin_number.trim();
  const isStepTwoValid =
    form.user_role === 'teacher' ? isTeacherStepTwoValid : isStudentStepTwoValid;

  const handleSave = async () => {
    setLoading(true);
    setErrorMessage('');

    const payload = {
      user_id: userId,
      name: form.name.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      user_role: form.user_role || 'student',
      location_type: form.user_role === 'teacher' ? 'Faculty Cabin' : form.location_type,
      hostel_name: form.user_role === 'student' ? form.hostel_name || null : null,
      block: form.user_role === 'student' ? form.block || null : null,
      room_number: form.user_role === 'student' ? form.room_number || null : null,
      building_number:
        form.user_role === 'teacher'
          ? form.building_number.trim() || null
          : form.building_number || null,
      cabin_number:
        form.user_role === 'teacher' ? form.cabin_number.trim() || null : null,
      exact_location: form.user_role === 'student' ? form.exact_location || null : null,
      uid: form.uid.trim(),
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert([payload], { onConflict: 'user_id' });

    setLoading(false);

    if (!error) {
      onComplete();
      return;
    }

    console.error('Error saving onboarding profile:', error);
    setErrorMessage('Error saving profile. Try again.');
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>Complete Your Profile</h2>
        <p style={s.sub}>Step {step} of 3</p>

        {errorMessage && <div style={s.errorBox}>{errorMessage}</div>}

        {step === 1 && (
          <div style={s.section}>
            <label style={s.label}>Are you a student or teacher?</label>
            <div style={s.row}>
              {[
                { label: 'Student', value: 'student' },
                { label: 'Teacher', value: 'teacher' },
              ].map((role) => (
                <button
                  key={role.value}
                  type="button"
                  style={{
                    ...s.chip,
                    ...(form.user_role === role.value ? s.chipActive : {}),
                  }}
                  onClick={() => updateRole(role.value as Exclude<UserRole, ''>)}
                >
                  {role.label}
                </button>
              ))}
            </div>

            <label style={s.label}>Full Name</label>
            <input
              style={s.input}
              placeholder="Your name"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
            />

            <label style={s.label}>Phone Number</label>
            <input
              style={s.input}
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
            />

            <label style={s.label}>Gender</label>
            <div style={s.row}>
              {['Male', 'Female'].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  style={{ ...s.chip, ...(form.gender === gender ? s.chipActive : {}) }}
                  onClick={() => update('gender', gender)}
                >
                  {gender}
                </button>
              ))}
            </div>

            <button
              type="button"
              style={s.btn}
              disabled={!isStepOneValid}
              onClick={() => setStep(2)}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && form.user_role === 'teacher' && (
          <div style={s.section}>
            <label style={s.label}>Building Number</label>
            <input
              style={s.input}
              placeholder="e.g. Block 32"
              value={form.building_number}
              onChange={(event) => update('building_number', event.target.value)}
            />

            <label style={s.label}>Cabin Number</label>
            <input
              style={s.input}
              placeholder="e.g. Cabin 204"
              value={form.cabin_number}
              onChange={(event) => update('cabin_number', event.target.value)}
            />

            <div style={s.row}>
              <button type="button" style={s.btnOutline} onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                style={s.btn}
                disabled={!isStepTwoValid}
                onClick={() => setStep(3)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && form.user_role === 'student' && (
          <div style={s.section}>
            <label style={s.label}>Where are you ordering from?</label>
            <div style={s.col}>
              {locationOptions.map((locationType) => (
                <button
                  key={locationType}
                  type="button"
                  style={{
                    ...s.chip,
                    ...(form.location_type === locationType ? s.chipActive : {}),
                  }}
                  onClick={() => update('location_type', locationType)}
                >
                  {locationType}
                </button>
              ))}
            </div>

            {form.location_type === 'Hostel' && (
              <>
                <label style={s.label}>Hostel Name</label>
                <div style={s.grid}>
                  {(form.gender === 'Male' ? boyHostels : girlHostels).map((hostel) => (
                    <button
                      key={hostel}
                      type="button"
                      style={{
                        ...s.chip,
                        ...(form.hostel_name === hostel ? s.chipActive : {}),
                      }}
                      onClick={() => update('hostel_name', hostel)}
                    >
                      {hostel}
                    </button>
                  ))}
                </div>

                <label style={s.label}>Block</label>
                <input
                  style={s.input}
                  placeholder="e.g. A, B, C"
                  value={form.block}
                  onChange={(event) => update('block', event.target.value)}
                />

                <label style={s.label}>Room Number</label>
                <input
                  style={s.input}
                  placeholder="e.g. 101"
                  value={form.room_number}
                  onChange={(event) => update('room_number', event.target.value)}
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
                  onChange={(event) => update('building_number', event.target.value)}
                />

                <label style={s.label}>Room/Class Number</label>
                <input
                  style={s.input}
                  placeholder="e.g. 101"
                  value={form.room_number}
                  onChange={(event) => update('room_number', event.target.value)}
                />
              </>
            )}

            {(form.location_type === 'Studio Apartment' ||
              form.location_type === 'Apartment') && (
              <>
                <label style={s.label}>Block</label>
                <input
                  style={s.input}
                  placeholder="Block name/number"
                  value={form.block}
                  onChange={(event) => update('block', event.target.value)}
                />

                <label style={s.label}>Room Number</label>
                <input
                  style={s.input}
                  placeholder="e.g. 201"
                  value={form.room_number}
                  onChange={(event) => update('room_number', event.target.value)}
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
                  onChange={(event) => update('building_number', event.target.value)}
                />

                <label style={s.label}>Exact Location</label>
                <input
                  style={s.input}
                  placeholder="Describe your location"
                  value={form.exact_location}
                  onChange={(event) => update('exact_location', event.target.value)}
                />
              </>
            )}

            <div style={s.row}>
              <button type="button" style={s.btnOutline} onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                style={s.btn}
                disabled={!isStepTwoValid}
                onClick={() => setStep(3)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={s.section}>
            <label style={s.label}>University ID (UID)</label>
            <input
              style={s.input}
              placeholder="e.g. 12345678"
              value={form.uid}
              onChange={(event) => update('uid', event.target.value)}
            />

            <div style={s.row}>
              <button type="button" style={s.btnOutline} onClick={() => setStep(2)}>
                Back
              </button>
              <button
                type="button"
                style={s.btn}
                disabled={!form.uid.trim() || loading}
                onClick={handleSave}
              >
                {loading ? 'Saving...' : 'Save and Continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
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
    maxWidth: 520,
    border: '1px solid #1e3a5f',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
    fontFamily: 'DM Sans, sans-serif',
  },
  sub: { color: '#ff6124', fontSize: 13, marginBottom: 28 },
  errorBox: {
    marginBottom: 20,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(248, 113, 113, 0.35)',
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#fecaca',
    fontSize: 14,
  },
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
