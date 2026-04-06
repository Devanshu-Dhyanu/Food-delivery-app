import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Home,
  MapPin,
  PencilLine,
  Phone,
  Save,
  User,
  X,
} from 'lucide-react';
import BrandedLoader from './BrandedLoader';
import { sanitizeName, sanitizePhone, sanitizeText } from '../lib/inputSanitization';
import { supabase, type UserProfile } from '../lib/supabase';

interface ProfileProps {
  userId: string;
  onBack: () => void;
  onProfileUpdated: (name: string) => void;
}

type EditableProfile = {
  name: string;
  phone: string;
  gender: string;
  location_type: string;
  hostel_name: string;
  block: string;
  room_number: string;
  building_number: string;
  exact_location: string;
  uid: string;
};

const emptyProfileForm: EditableProfile = {
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
};

const locationOptions = ['Hostel', 'Class', 'Studio Apartment', 'Apartment', 'Other'];
const genders = ['Male', 'Female'];
const boyHostels = ['BH1', 'BH2', 'BH3', 'BH4', 'BH5', 'BH6', 'BH7', 'BH8', 'BH9', 'BH10'];
const girlHostels = ['GH1', 'GH2', 'GH3', 'GH4', 'GH5', 'GH6', 'GH7', 'GH8', 'GH9'];

const mapProfileToForm = (profile?: Partial<UserProfile> | null): EditableProfile => ({
  name: profile?.name ?? '',
  phone: profile?.phone ?? '',
  gender: profile?.gender ?? '',
  location_type: profile?.location_type ?? '',
  hostel_name: profile?.hostel_name ?? '',
  block: profile?.block ?? '',
  room_number: profile?.room_number ?? '',
  building_number: profile?.building_number ?? '',
  exact_location: profile?.exact_location ?? '',
  uid: profile?.uid ?? '',
});

const getLocationSummary = (profile: EditableProfile) => {
  switch (profile.location_type) {
    case 'Hostel':
      return [profile.hostel_name, profile.block && `Block ${profile.block}`, profile.room_number && `Room ${profile.room_number}`]
        .filter(Boolean)
        .join(', ');
    case 'Class':
      return [profile.building_number && `Building ${profile.building_number}`, profile.room_number && `Room ${profile.room_number}`]
        .filter(Boolean)
        .join(', ');
    case 'Studio Apartment':
    case 'Apartment':
      return [profile.block && `Block ${profile.block}`, profile.room_number && `Room ${profile.room_number}`]
        .filter(Boolean)
        .join(', ');
    case 'Other':
      return [profile.building_number, profile.exact_location].filter(Boolean).join(', ');
    default:
      return '';
  }
};

export default function Profile({ userId, onBack, onProfileUpdated }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<EditableProfile>(emptyProfileForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;

        if (!isMounted) {
          return;
        }

        setProfile((data as UserProfile | null) ?? null);
        setForm(mapProfileToForm(data as UserProfile | null));
      } catch (error) {
        console.error('Error loading user profile:', error);

        if (isMounted) {
          setErrorMessage('We could not load your profile right now. Please try again.');
          setProfile(null);
          setForm(emptyProfileForm);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const updateField = (field: keyof EditableProfile, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccessMessage('');
  };

  const isSaveDisabled =
    saving ||
    !form.name.trim() ||
    !form.phone.trim() ||
    !form.gender ||
    !form.location_type ||
    !form.uid.trim();

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Sanitize input
      const sanitizedName = sanitizeName(form.name);
      const sanitizedPhone = sanitizePhone(form.phone);
      const sanitizedUid = sanitizeText(form.uid, 'UID', 1, 50);
      const sanitizedHostelName = sanitizeText(form.hostel_name, 'Hostel Name', 0, 100);
      const sanitizedBlock = sanitizeText(form.block, 'Block', 0, 50);
      const sanitizedRoomNumber = sanitizeText(form.room_number, 'Room Number', 0, 50);
      const sanitizedBuildingNumber = sanitizeText(form.building_number, 'Building Number', 0, 50);
      const sanitizedExactLocation = sanitizeText(form.exact_location, 'Exact Location', 0, 200);

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(
          [
            {
              user_id: userId,
              name: sanitizedName,
              phone: sanitizedPhone,
              gender: form.gender,
              location_type: form.location_type,
              hostel_name: sanitizedHostelName || null,
              block: sanitizedBlock || null,
              room_number: sanitizedRoomNumber || null,
              building_number: sanitizedBuildingNumber || null,
              exact_location: sanitizedExactLocation || null,
              uid: sanitizedUid,
            },
          ],
          { onConflict: 'user_id' }
        )
        .select('*')
        .single();

      if (error) throw error;

      const nextProfile = data as UserProfile;
      setProfile(nextProfile);
      setForm(mapProfileToForm(nextProfile));
      setEditing(false);
      setSuccessMessage('Profile updated successfully.');
      onProfileUpdated(nextProfile.name);
    } catch (error) {
      console.error('Error updating user profile:', error);
      const message = error instanceof Error ? error.message : 'We could not save your changes. Please try again.';
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const locationSummary = getLocationSummary(form) || 'Location details not added yet';
  const profileInitial = (form.name.trim().charAt(0) || 'P').toUpperCase();

  if (loading) {
    return <BrandedLoader message="Loading your profile..." />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Restaurants</span>
      </button>

      <div className="mb-8 overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-white/5 via-gray-900 to-gray-900 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-5 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-orange-500/25 bg-orange-500/15 text-2xl font-bold text-orange-200">
              {profileInitial}
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
                Your profile
              </p>
              <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">{form.name || 'Campus user'}</h1>
              <p className="max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                Review and update your saved delivery details here. Changes will be used the next time you place an order.
              </p>
            </div>
          </div>

          {!editing && (
            <button
              onClick={() => {
                setEditing(true);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              <PencilLine className="h-4 w-4" />
              <span>Edit details</span>
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {successMessage}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSave} className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 p-6 shadow-xl shadow-black/20">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold text-white">Basic Details</h2>
              <p className="text-sm text-gray-400">Keep your saved identity and contact details up to date.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-300">Full Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500/40"
                  placeholder="Your name"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-300">Phone Number</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500/40"
                  placeholder="10-digit mobile number"
                />
              </label>

              <div className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-gray-300">Gender</span>
                <div className="flex flex-wrap gap-2">
                  {genders.map((gender) => {
                    const isSelected = form.gender === gender;

                    return (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => updateField('gender', gender)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-orange-500/35 bg-orange-500/15 text-orange-200'
                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {gender}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-gray-300">University ID (UID)</span>
                <input
                  type="text"
                  value={form.uid}
                  onChange={(event) => updateField('uid', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500/40"
                  placeholder="e.g. 12345678"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 p-6 shadow-xl shadow-black/20">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold text-white">Delivery Location</h2>
              <p className="text-sm text-gray-400">These details help with quicker and more accurate deliveries.</p>
            </div>

            <div className="space-y-5">
              <div>
                <span className="mb-2 block text-sm font-medium text-gray-300">Location Type</span>
                <div className="flex flex-wrap gap-2">
                  {locationOptions.map((locationType) => {
                    const isSelected = form.location_type === locationType;

                    return (
                      <button
                        key={locationType}
                        type="button"
                        onClick={() => updateField('location_type', locationType)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-orange-500/35 bg-orange-500/15 text-orange-200'
                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {locationType}
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.location_type === 'Hostel' && (
                <>
                  <div>
                    <span className="mb-2 block text-sm font-medium text-gray-300">Hostel Name</span>
                    <div className="flex flex-wrap gap-2">
                      {(form.gender === 'Male' ? boyHostels : girlHostels).map((hostel) => {
                        const isSelected = form.hostel_name === hostel;

                        return (
                          <button
                            key={hostel}
                            type="button"
                            onClick={() => updateField('hostel_name', hostel)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                              isSelected
                                ? 'border-orange-500/35 bg-orange-500/15 text-orange-200'
                                : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {hostel}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-gray-300">Block</span>
                      <input
                        type="text"
                        value={form.block}
                        onChange={(event) => updateField('block', event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500/40"
                        placeholder="e.g. A, B, C"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-gray-300">Room Number</span>
                      <input
                        type="text"
                        value={form.room_number}
                        onChange={(event) => updateField('room_number', event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500/40"
                        placeholder="e.g. 101"
                      />
                    </label>
                  </div>
                </>
              )}

              {form.location_type === 'Class' && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Building Number</span>
                    <input
                      type="text"
                      value={form.building_number}
                      onChange={(event) => updateField('building_number', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500/40"
                      placeholder="e.g. Block 32"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Room/Class Number</span>
                    <input
                      type="text"
                      value={form.room_number}
                      onChange={(event) => updateField('room_number', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500/40"
                      placeholder="e.g. 101"
                    />
                  </label>
                </div>
              )}

              {(form.location_type === 'Studio Apartment' || form.location_type === 'Apartment') && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Block</span>
                    <input
                      type="text"
                      value={form.block}
                      onChange={(event) => updateField('block', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500/40"
                      placeholder="Block name/number"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Room Number</span>
                    <input
                      type="text"
                      value={form.room_number}
                      onChange={(event) => updateField('room_number', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500/40"
                      placeholder="e.g. 201"
                    />
                  </label>
                </div>
              )}

              {form.location_type === 'Other' && (
                <div className="space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Nearest Building</span>
                    <input
                      type="text"
                      value={form.building_number}
                      onChange={(event) => updateField('building_number', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500/40"
                      placeholder="e.g. Block 34"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Exact Location</span>
                    <input
                      type="text"
                      value={form.exact_location}
                      onChange={(event) => updateField('exact_location', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-gray-800 px-4 py-3 text-white outline-none transition-colors focus:border-orange-500/40"
                      placeholder="Describe your location"
                    />
                  </label>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setErrorMessage('');
                    setSuccessMessage('');
                    setForm(mapProfileToForm(profile));
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaveDisabled}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-700"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving changes...' : 'Save changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 p-6 shadow-xl shadow-black/20">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 p-3 text-orange-300">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Profile Details</h2>
                <p className="text-sm text-gray-400">Your saved identity and contact information.</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Full Name</p>
                <p className="font-semibold text-white">{form.name || 'Not added yet'}</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <p className="font-semibold text-white">{form.phone || 'Not added yet'}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Gender</p>
                <p className="font-semibold text-white">{form.gender || 'Not added yet'}</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">UID</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <p className="font-semibold text-white">{form.uid || 'Not added yet'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 p-6 shadow-xl shadow-black/20">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-full border border-white/10 bg-white/5 p-3 text-orange-300">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Delivery Location</h2>
                  <p className="text-sm text-gray-400">Where your orders should reach you.</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-gray-300">
                <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Location Type</p>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-500" />
                    <p className="font-semibold text-white">{form.location_type || 'Not added yet'}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Saved Details</p>
                  <p className="leading-6 text-white">{locationSummary}</p>
                </div>

                {(form.building_number || form.exact_location) && (
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4">
                    <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Extra Reference</p>
                    <div className="flex items-start gap-2">
                      <Building2 className="mt-0.5 h-4 w-4 text-gray-500" />
                      <p className="leading-6 text-white">
                        {[form.building_number, form.exact_location].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-orange-500/20 bg-orange-500/10 p-6 shadow-xl shadow-black/20">
              <h3 className="mb-2 text-lg font-bold text-white">Need to update something?</h3>
              <p className="mb-4 text-sm leading-6 text-orange-100/85">
                Edit your profile whenever your hostel, room, phone number, or saved delivery location changes.
              </p>
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                <PencilLine className="h-4 w-4" />
                <span>Edit details</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
