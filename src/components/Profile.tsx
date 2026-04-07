import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Home,
  ImagePlus,
  MapPin,
  Moon,
  PencilLine,
  Phone,
  Save,
  Sun,
  Trash2,
  User,
  X,
} from 'lucide-react';
import BrandedLoader from './BrandedLoader';
import VajraWalletPanel from './VajraWalletPanel';
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
  avatar_url: string;
  gender: string;
  user_role: 'student' | 'teacher';
  location_type: string;
  hostel_name: string;
  block: string;
  room_number: string;
  building_number: string;
  cabin_number: string;
  exact_location: string;
  uid: string;
};

type ProfileTheme = 'dark' | 'light';

const PROFILE_THEME_STORAGE_KEY = 'vajra-profile-theme';
const MAX_PROFILE_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const PROFILE_IMAGE_MAX_DIMENSION = 720;
const PROFILE_IMAGE_QUALITY = 0.82;

const emptyProfileForm: EditableProfile = {
  name: '',
  phone: '',
  avatar_url: '',
  gender: '',
  user_role: 'student',
  location_type: '',
  hostel_name: '',
  block: '',
  room_number: '',
  building_number: '',
  cabin_number: '',
  exact_location: '',
  uid: '',
};

const profileRoles = [
  { label: 'Student', value: 'student' as const },
  { label: 'Teacher', value: 'teacher' as const },
];
const locationOptions = ['Hostel', 'Class', 'Studio Apartment', 'Apartment', 'Other'];
const genders = ['Male', 'Female'];
const boyHostels = ['BH1', 'BH2', 'BH3', 'BH4', 'BH5', 'BH6', 'BH7', 'BH8', 'BH9', 'BH10'];
const girlHostels = ['GH1', 'GH2', 'GH3', 'GH4', 'GH5', 'GH6', 'GH7', 'GH8', 'GH9'];

const hasValue = (value: string) => value.trim().length > 0;

const isStudentLocationComplete = (profile: EditableProfile) => {
  switch (profile.location_type) {
    case 'Hostel':
      return hasValue(profile.hostel_name) && hasValue(profile.block) && hasValue(profile.room_number);
    case 'Class':
      return hasValue(profile.building_number) && hasValue(profile.room_number);
    case 'Studio Apartment':
    case 'Apartment':
      return hasValue(profile.block) && hasValue(profile.room_number);
    case 'Other':
      return hasValue(profile.building_number) && hasValue(profile.exact_location);
    default:
      return false;
  }
};

const mapProfileToForm = (profile?: Partial<UserProfile> | null): EditableProfile => ({
  name: profile?.name ?? '',
  phone: profile?.phone ?? '',
  avatar_url: profile?.avatar_url ?? '',
  gender: profile?.gender ?? '',
  user_role: profile?.user_role === 'teacher' ? 'teacher' : 'student',
  location_type: profile?.location_type ?? '',
  hostel_name: profile?.hostel_name ?? '',
  block: profile?.block ?? '',
  room_number: profile?.room_number ?? '',
  building_number: profile?.building_number ?? '',
  cabin_number: profile?.cabin_number ?? '',
  exact_location: profile?.exact_location ?? '',
  uid: profile?.uid ?? '',
});

const getLocationSummary = (profile: EditableProfile) => {
  if (profile.user_role === 'teacher') {
    return [
      profile.building_number && `Building ${profile.building_number}`,
      profile.cabin_number && `Cabin ${profile.cabin_number}`,
    ]
      .filter(Boolean)
      .join(', ');
  }

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

const getLocationTypeLabel = (profile: EditableProfile) =>
  profile.user_role === 'teacher' ? 'Faculty Cabin' : profile.location_type;

const getExtraReference = (profile: EditableProfile) => {
  if (profile.user_role === 'teacher') {
    return '';
  }

  return [profile.building_number, profile.exact_location].filter(Boolean).join(', ');
};

const getSelectableChipClasses = (isSelected: boolean, isLightTheme: boolean) =>
  `rounded-full border px-4 py-2 text-sm font-medium transition-all ${
    isSelected
      ? isLightTheme
        ? 'border-orange-300 bg-orange-100 text-orange-700 shadow-sm shadow-orange-100/70'
        : 'border-orange-500/35 bg-orange-500/15 text-orange-200'
      : isLightTheme
        ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
  }`;

const getInputClasses = (isLightTheme: boolean) =>
  `w-full rounded-2xl border px-4 py-3 outline-none transition-colors ${
    isLightTheme
      ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-400/60'
      : 'border-white/10 bg-gray-800 text-white focus:border-orange-500/40'
  }`;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Unable to read the selected image.'));
    };

    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.readAsDataURL(file);
  });

const optimizeProfileImage = async (file: File) => {
  const source = await readFileAsDataUrl(file);

  return new Promise<string>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const largestSide = Math.max(image.width, image.height);
      const scale = largestSide > PROFILE_IMAGE_MAX_DIMENSION
        ? PROFILE_IMAGE_MAX_DIMENSION / largestSide
        : 1;
      const targetWidth = Math.max(1, Math.round(image.width * scale));
      const targetHeight = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Unable to process the selected image.'));
        return;
      }

      context.drawImage(image, 0, 0, targetWidth, targetHeight);
      resolve(canvas.toDataURL('image/jpeg', PROFILE_IMAGE_QUALITY));
    };

    image.onerror = () => reject(new Error('Unable to process the selected image.'));
    image.src = source;
  });
};

export default function Profile({ userId, onBack, onProfileUpdated }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<EditableProfile>(emptyProfileForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [processingProfileImage, setProcessingProfileImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [theme, setTheme] = useState<ProfileTheme>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    return window.localStorage.getItem(PROFILE_THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(PROFILE_THEME_STORAGE_KEY, theme);
  }, [theme]);

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
    setErrorMessage('');
    setSuccessMessage('');
  };

  const updateRole = (role: EditableProfile['user_role']) => {
    setForm((current) => ({
      ...current,
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
    setSuccessMessage('');
  };

  const isTeacher = form.user_role === 'teacher';
  const isSaveDisabled =
    saving ||
    processingProfileImage ||
    !form.name.trim() ||
    !form.phone.trim() ||
    !form.gender ||
    (isTeacher
      ? !form.building_number.trim() || !form.cabin_number.trim()
      : !isStudentLocationComplete(form)) ||
    !form.uid.trim();

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSaveDisabled) {
      setErrorMessage('Please fill all required fields before saving.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const sanitizedName = sanitizeName(form.name);
      const sanitizedPhone = sanitizePhone(form.phone);
      const sanitizedUid = sanitizeText(form.uid, 'UID', 1, 50);
      const sanitizedHostelName = sanitizeText(form.hostel_name, 'Hostel Name', 0, 100);
      const sanitizedBlock = sanitizeText(form.block, 'Block', 0, 50);
      const sanitizedRoomNumber = sanitizeText(form.room_number, 'Room Number', 0, 50);
      const sanitizedBuildingNumber = sanitizeText(form.building_number, 'Building Number', 0, 50);
      const sanitizedCabinNumber = sanitizeText(form.cabin_number, 'Cabin Number', 0, 50);
      const sanitizedExactLocation = sanitizeText(form.exact_location, 'Exact Location', 0, 200);
      const sanitizedUserRole = form.user_role === 'teacher' ? 'teacher' : 'student';
      const locationType =
        sanitizedUserRole === 'teacher' ? 'Faculty Cabin' : form.location_type;
      const shouldIncludeAvatarField = Boolean(form.avatar_url.trim() || profile?.avatar_url);
      const profilePayload = {
        user_id: userId,
        name: sanitizedName,
        phone: sanitizedPhone,
        ...(shouldIncludeAvatarField
          ? { avatar_url: form.avatar_url.trim() || null }
          : {}),
        gender: form.gender,
        user_role: sanitizedUserRole,
        location_type: locationType,
        hostel_name: sanitizedUserRole === 'student' ? sanitizedHostelName || null : null,
        block: sanitizedUserRole === 'student' ? sanitizedBlock || null : null,
        room_number: sanitizedUserRole === 'student' ? sanitizedRoomNumber || null : null,
        building_number: sanitizedBuildingNumber || null,
        cabin_number:
          sanitizedUserRole === 'teacher' ? sanitizedCabinNumber || null : null,
        exact_location:
          sanitizedUserRole === 'student' ? sanitizedExactLocation || null : null,
        uid: sanitizedUid,
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(
          [profilePayload],
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
      const message =
        error instanceof Error && error.message.toLowerCase().includes('avatar_url')
          ? 'Profile photo support needs one SQL update first. Run the avatar SQL, then try saving again.'
          : error instanceof Error
            ? error.message
            : 'We could not save your changes. Please try again.';
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    event.target.value = '';

    if (!nextFile) {
      return;
    }

    if (!nextFile.type.startsWith('image/')) {
      setErrorMessage('Please choose a valid image file.');
      setSuccessMessage('');
      return;
    }

    if (nextFile.size > MAX_PROFILE_IMAGE_FILE_SIZE) {
      setErrorMessage('Please choose an image smaller than 5 MB.');
      setSuccessMessage('');
      return;
    }

    setProcessingProfileImage(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const optimizedImage = await optimizeProfileImage(nextFile);

      setForm((current) => ({
        ...current,
        avatar_url: optimizedImage,
      }));
      setSuccessMessage('Profile photo is ready. Save changes to update it.');
    } catch (error) {
      console.error('Error preparing profile image:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'We could not process that photo. Please try another image.'
      );
    } finally {
      setProcessingProfileImage(false);
    }
  };

  const locationSummary = getLocationSummary(form) || 'Location details not added yet';
  const locationTypeLabel = getLocationTypeLabel(form) || 'Not added yet';
  const extraReference = getExtraReference(form);
  const userRoleLabel = form.user_role === 'teacher' ? 'Teacher' : 'Student';
  const profileInitial = (form.name.trim().charAt(0) || 'P').toUpperCase();
  const isLightTheme = theme === 'light';
  const backButtonClassName = `mb-6 flex items-center gap-2 transition-colors ${
    isLightTheme ? 'text-slate-500 hover:text-slate-900' : 'text-gray-400 hover:text-white'
  }`;
  const heroCardClassName = `mb-8 overflow-hidden rounded-[28px] border shadow-xl ${
    isLightTheme
      ? 'border-orange-200/80 bg-gradient-to-br from-white via-orange-50/80 to-slate-50 shadow-orange-100/70'
      : 'border-white/5 bg-gradient-to-br from-white/5 via-gray-900 to-gray-900 shadow-black/20'
  }`;
  const surfaceCardClassName = `rounded-[28px] border p-6 shadow-xl ${
    isLightTheme
      ? 'border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-slate-200/70'
      : 'border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 shadow-black/20'
  }`;
  const detailCardClassName = `rounded-2xl border px-4 py-4 ${
    isLightTheme
      ? 'border-slate-200 bg-white/90 shadow-sm shadow-slate-100/80'
      : 'border-white/5 bg-white/5'
  }`;
  const infoLabelClassName = `mb-1 text-xs uppercase tracking-[0.16em] ${
    isLightTheme ? 'text-slate-500' : 'text-gray-500'
  }`;
  const valueTextClassName = isLightTheme ? 'font-semibold text-slate-900' : 'font-semibold text-white';
  const bodyTextClassName = isLightTheme ? 'text-slate-600' : 'text-gray-400';
  const labelClassName = `mb-2 block text-sm font-medium ${
    isLightTheme ? 'text-slate-700' : 'text-gray-300'
  }`;
  const inputClassName = getInputClasses(isLightTheme);
  const secondaryButtonClassName = `inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors ${
    isLightTheme
      ? 'border-slate-200 bg-white text-slate-800 shadow-sm shadow-slate-100/80 hover:bg-slate-50'
      : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
  }`;
  const primaryButtonClassName = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-colors ${
    isLightTheme
      ? 'bg-orange-500 shadow-lg shadow-orange-200/70 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-500'
      : 'bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700'
  } disabled:cursor-not-allowed`;
  const themeToggleClassName = `inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors ${
    isLightTheme
      ? 'border-slate-200 bg-white text-slate-800 shadow-sm shadow-slate-100/80 hover:bg-slate-50'
      : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
  }`;
  const alertErrorClassName = `mb-6 rounded-2xl border px-4 py-3 text-sm ${
    isLightTheme
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-red-500/30 bg-red-500/10 text-red-100'
  }`;
  const alertSuccessClassName = `mb-6 rounded-2xl border px-4 py-3 text-sm ${
    isLightTheme
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
  }`;
  const avatarClassName = `flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border text-2xl font-bold ${
    isLightTheme
      ? 'border-orange-200 bg-orange-100 text-orange-700'
      : 'border-orange-500/25 bg-orange-500/15 text-orange-200'
  }`;
  const avatarPreviewClassName = `relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border text-3xl font-bold ${
    isLightTheme
      ? 'border-orange-200 bg-orange-100 text-orange-700'
      : 'border-orange-500/25 bg-orange-500/15 text-orange-200'
  }`;
  const iconBadgeClassName = `rounded-full border p-3 ${
    isLightTheme
      ? 'border-orange-200 bg-orange-100 text-orange-600'
      : 'border-white/10 bg-white/5 text-orange-300'
  }`;
  const mutedIconClassName = isLightTheme ? 'text-slate-400' : 'text-gray-500';
  const heroOverlineClassName = `mb-2 text-xs font-semibold uppercase tracking-[0.2em] ${
    isLightTheme ? 'text-orange-600' : 'text-orange-300'
  }`;
  const heroTitleClassName = `mb-2 text-3xl font-bold sm:text-4xl ${
    isLightTheme ? 'text-slate-900' : 'text-white'
  }`;
  const sectionTitleClassName = `mb-2 text-2xl font-bold ${
    isLightTheme ? 'text-slate-900' : 'text-white'
  }`;
  const sectionSubtitleClassName = `text-sm ${bodyTextClassName}`;
  const detailListClassName = `space-y-4 text-sm ${isLightTheme ? 'text-slate-700' : 'text-gray-300'}`;
  const noteCardClassName = `rounded-[28px] border p-6 shadow-xl ${
    isLightTheme
      ? 'border-orange-200 bg-gradient-to-br from-orange-50 via-white to-slate-50 shadow-orange-100/70'
      : 'border-orange-500/20 bg-orange-500/10 shadow-black/20'
  }`;
  const noteBodyClassName = `mb-4 text-sm leading-6 ${
    isLightTheme ? 'text-orange-700/90' : 'text-orange-100/85'
  }`;
  const shellClassName = `mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 ${isLightTheme ? 'text-slate-900' : ''}`;

  if (loading) {
    return <BrandedLoader message="Loading your profile..." />;
  }

  return (
    <div className={shellClassName}>
      <button onClick={onBack} className={backButtonClassName}>
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Restaurants</span>
      </button>

      <div className={heroCardClassName}>
        <div className="flex flex-col gap-5 px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className={`${avatarClassName} overflow-hidden`}>
              {form.avatar_url ? (
                <img
                  src={form.avatar_url}
                  alt={form.name ? `${form.name}'s profile` : 'Profile'}
                  className="h-full w-full object-cover"
                />
              ) : (
                profileInitial
              )}
            </div>
            <div>
              <p className={heroOverlineClassName}>Your profile</p>
              <h1 className={heroTitleClassName}>{form.name || 'Campus user'}</h1>
              <p className={`max-w-2xl text-sm leading-6 sm:text-base ${bodyTextClassName}`}>
                Review and update your saved delivery details here. Changes will be used the next
                time you place an order.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
              className={themeToggleClassName}
            >
              {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>{isLightTheme ? 'Dark theme' : 'Light theme'}</span>
            </button>

            {!editing && (
              <button
                onClick={() => {
                  setEditing(true);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={primaryButtonClassName}
              >
                <PencilLine className="h-4 w-4" />
                <span>Edit details</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {errorMessage && <div className={alertErrorClassName}>{errorMessage}</div>}

      {successMessage && <div className={alertSuccessClassName}>{successMessage}</div>}

      {editing ? (
        <div className="space-y-6">
          <form onSubmit={handleSave} className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
            <div className={surfaceCardClassName}>
              <div className="mb-6">
                <h2 className={sectionTitleClassName}>Basic Details</h2>
                <p className={sectionSubtitleClassName}>
                  Keep your saved identity and contact details up to date.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div
                  className={`sm:col-span-2 rounded-[24px] border p-5 ${
                    isLightTheme
                      ? 'border-slate-200 bg-slate-50/80'
                      : 'border-white/5 bg-white/5'
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className={avatarPreviewClassName}>
                      {form.avatar_url ? (
                        <img
                          src={form.avatar_url}
                          alt={form.name ? `${form.name}'s profile` : 'Profile'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        profileInitial
                      )}
                    </div>

                    <div className="flex-1">
                      <span className={labelClassName}>Profile Photo</span>
                      <p className={`text-sm leading-6 ${bodyTextClassName}`}>
                        Add a clear photo from your device. It will appear on your profile header.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <label
                          className={`${secondaryButtonClassName} cursor-pointer ${
                            processingProfileImage || saving
                              ? 'pointer-events-none opacity-60'
                              : ''
                          }`}
                        >
                          <ImagePlus className="h-4 w-4" />
                          <span>{form.avatar_url ? 'Change photo' : 'Upload photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            className="hidden"
                          />
                        </label>

                        {form.avatar_url && (
                          <button
                            type="button"
                            onClick={() => {
                              updateField('avatar_url', '');
                              setSuccessMessage('Profile photo removed. Save changes to update it.');
                            }}
                            className={secondaryButtonClassName}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove photo</span>
                          </button>
                        )}
                      </div>

                      <p className={`mt-3 text-xs ${bodyTextClassName}`}>
                        {processingProfileImage
                          ? 'Preparing your image...'
                          : 'JPG, PNG, and WEBP are supported. We optimize it automatically before saving.'}
                      </p>
                    </div>
                  </div>
                </div>

                <label className="block">
                  <span className={labelClassName}>Full Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    className={inputClassName}
                    placeholder="Your name"
                  />
                </label>

                <label className="block">
                  <span className={labelClassName}>Phone Number</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    className={inputClassName}
                    placeholder="10-digit mobile number"
                  />
                </label>

                <div className="sm:col-span-2">
                  <span className={labelClassName}>Gender</span>
                  <div className="flex flex-wrap gap-2">
                    {genders.map((gender) => {
                      const isSelected = form.gender === gender;

                      return (
                        <button
                          key={gender}
                          type="button"
                          onClick={() => updateField('gender', gender)}
                          className={getSelectableChipClasses(isSelected, isLightTheme)}
                        >
                          {gender}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <span className={labelClassName}>Profile Type</span>
                  <div className="flex flex-wrap gap-2">
                    {profileRoles.map((role) => {
                      const isSelected = form.user_role === role.value;

                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => updateRole(role.value)}
                          className={getSelectableChipClasses(isSelected, isLightTheme)}
                        >
                          {role.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block sm:col-span-2">
                  <span className={labelClassName}>University ID (UID)</span>
                  <input
                    type="text"
                    value={form.uid}
                    onChange={(event) => updateField('uid', event.target.value)}
                    className={inputClassName}
                    placeholder="e.g. 12345678"
                  />
                </label>
              </div>
            </div>

            <div className={surfaceCardClassName}>
              <div className="mb-6">
                <h2 className={sectionTitleClassName}>
                  {isTeacher ? 'Teacher Location' : 'Delivery Location'}
                </h2>
                <p className={sectionSubtitleClassName}>
                  {isTeacher
                    ? 'Save the building and cabin number so teacher orders reach the right place.'
                    : 'These details help with quicker and more accurate deliveries.'}
                </p>
              </div>

              <div className="space-y-5">
                {isTeacher ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className={labelClassName}>Building Number</span>
                      <input
                        type="text"
                        value={form.building_number}
                        onChange={(event) => updateField('building_number', event.target.value)}
                        className={inputClassName}
                        placeholder="e.g. Block 32"
                      />
                    </label>

                    <label className="block">
                      <span className={labelClassName}>Cabin Number</span>
                      <input
                        type="text"
                        value={form.cabin_number}
                        onChange={(event) => updateField('cabin_number', event.target.value)}
                        className={inputClassName}
                        placeholder="e.g. Cabin 204"
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className={labelClassName}>Location Type</span>
                      <div className="flex flex-wrap gap-2">
                        {locationOptions.map((locationType) => {
                          const isSelected = form.location_type === locationType;

                          return (
                            <button
                              key={locationType}
                              type="button"
                              onClick={() => updateField('location_type', locationType)}
                              className={getSelectableChipClasses(isSelected, isLightTheme)}
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
                          <span className={labelClassName}>Hostel Name</span>
                          <div className="flex flex-wrap gap-2">
                            {(form.gender === 'Male' ? boyHostels : girlHostels).map((hostel) => {
                              const isSelected = form.hostel_name === hostel;

                              return (
                                <button
                                  key={hostel}
                                  type="button"
                                  onClick={() => updateField('hostel_name', hostel)}
                                  className={getSelectableChipClasses(isSelected, isLightTheme)}
                                >
                                  {hostel}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                          <label className="block">
                            <span className={labelClassName}>Block</span>
                            <input
                              type="text"
                              value={form.block}
                              onChange={(event) => updateField('block', event.target.value)}
                              className={inputClassName}
                              placeholder="e.g. A, B, C"
                            />
                          </label>

                          <label className="block">
                            <span className={labelClassName}>Room Number</span>
                            <input
                              type="text"
                              value={form.room_number}
                              onChange={(event) => updateField('room_number', event.target.value)}
                              className={inputClassName}
                              placeholder="e.g. 101"
                            />
                          </label>
                        </div>
                      </>
                    )}

                    {form.location_type === 'Class' && (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <label className="block">
                          <span className={labelClassName}>Building Number</span>
                          <input
                            type="text"
                            value={form.building_number}
                            onChange={(event) => updateField('building_number', event.target.value)}
                            className={inputClassName}
                            placeholder="e.g. Block 32"
                          />
                        </label>

                        <label className="block">
                          <span className={labelClassName}>Room/Class Number</span>
                          <input
                            type="text"
                            value={form.room_number}
                            onChange={(event) => updateField('room_number', event.target.value)}
                            className={inputClassName}
                            placeholder="e.g. 101"
                          />
                        </label>
                      </div>
                    )}

                    {(form.location_type === 'Studio Apartment' ||
                      form.location_type === 'Apartment') && (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <label className="block">
                          <span className={labelClassName}>Block</span>
                          <input
                            type="text"
                            value={form.block}
                            onChange={(event) => updateField('block', event.target.value)}
                            className={inputClassName}
                            placeholder="Block name/number"
                          />
                        </label>

                        <label className="block">
                          <span className={labelClassName}>Room Number</span>
                          <input
                            type="text"
                            value={form.room_number}
                            onChange={(event) => updateField('room_number', event.target.value)}
                            className={inputClassName}
                            placeholder="e.g. 201"
                          />
                        </label>
                      </div>
                    )}

                    {form.location_type === 'Other' && (
                      <div className="space-y-5">
                        <label className="block">
                          <span className={labelClassName}>Nearest Building</span>
                          <input
                            type="text"
                            value={form.building_number}
                            onChange={(event) => updateField('building_number', event.target.value)}
                            className={inputClassName}
                            placeholder="e.g. Block 34"
                          />
                        </label>

                        <label className="block">
                          <span className={labelClassName}>Exact Location</span>
                          <input
                            type="text"
                            value={form.exact_location}
                            onChange={(event) => updateField('exact_location', event.target.value)}
                            className={inputClassName}
                            placeholder="Describe your location"
                          />
                        </label>
                      </div>
                    )}
                  </>
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
                    className={secondaryButtonClassName}
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>

                  <button type="submit" disabled={isSaveDisabled} className={primaryButtonClassName}>
                    <Save className="h-4 w-4" />
                    <span>
                      {processingProfileImage
                        ? 'Preparing photo...'
                        : saving
                          ? 'Saving changes...'
                          : 'Save changes'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          <VajraWalletPanel userId={userId} theme={theme} />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <div className={surfaceCardClassName}>
            <div className="mb-5 flex items-center gap-3">
              <div className={iconBadgeClassName}>
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
                  Profile Details
                </h2>
                <p className={`text-sm ${bodyTextClassName}`}>
                  Your saved identity and contact information.
                </p>
              </div>
            </div>

            <div className={detailListClassName}>
              <div className={detailCardClassName}>
                <p className={infoLabelClassName}>Full Name</p>
                <p className={valueTextClassName}>{form.name || 'Not added yet'}</p>
              </div>

              <div className={detailCardClassName}>
                <p className={infoLabelClassName}>Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className={`h-4 w-4 ${mutedIconClassName}`} />
                  <p className={valueTextClassName}>{form.phone || 'Not added yet'}</p>
                </div>
              </div>

              <div className={detailCardClassName}>
                <p className={infoLabelClassName}>Gender</p>
                <p className={valueTextClassName}>{form.gender || 'Not added yet'}</p>
              </div>

              <div className={detailCardClassName}>
                <p className={infoLabelClassName}>Profile Type</p>
                <p className={valueTextClassName}>{userRoleLabel}</p>
              </div>

              <div className={detailCardClassName}>
                <p className={infoLabelClassName}>UID</p>
                <div className="flex items-center gap-2">
                  <CreditCard className={`h-4 w-4 ${mutedIconClassName}`} />
                  <p className={valueTextClassName}>{form.uid || 'Not added yet'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={surfaceCardClassName}>
              <div className="mb-5 flex items-center gap-3">
                <div className={iconBadgeClassName}>
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
                    {form.user_role === 'teacher' ? 'Teacher Location' : 'Delivery Location'}
                  </h2>
                  <p className={`text-sm ${bodyTextClassName}`}>
                    {form.user_role === 'teacher'
                      ? 'Where teacher orders should reach you on campus.'
                      : 'Where your orders should reach you.'}
                  </p>
                </div>
              </div>

              <div className={detailListClassName}>
                <div className={detailCardClassName}>
                  <p className={infoLabelClassName}>Location Type</p>
                  <div className="flex items-center gap-2">
                    <Home className={`h-4 w-4 ${mutedIconClassName}`} />
                    <p className={valueTextClassName}>{locationTypeLabel}</p>
                  </div>
                </div>

                <div className={detailCardClassName}>
                  <p className={infoLabelClassName}>Saved Details</p>
                  <p className={isLightTheme ? 'leading-6 text-slate-900' : 'leading-6 text-white'}>
                    {locationSummary}
                  </p>
                </div>

                {!!extraReference && (
                  <div className={detailCardClassName}>
                    <p className={infoLabelClassName}>Extra Reference</p>
                    <div className="flex items-start gap-2">
                      <Building2 className={`mt-0.5 h-4 w-4 ${mutedIconClassName}`} />
                      <p className={isLightTheme ? 'leading-6 text-slate-900' : 'leading-6 text-white'}>
                        {extraReference}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <VajraWalletPanel userId={userId} theme={theme} />

            <div className={noteCardClassName}>
              <h3 className={`mb-2 text-lg font-bold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
                Need to update something?
              </h3>
              <p className={noteBodyClassName}>
                Edit your profile whenever your hostel, cabin, phone number, or saved campus
                location changes.
              </p>
              <button onClick={() => setEditing(true)} className={primaryButtonClassName}>
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
