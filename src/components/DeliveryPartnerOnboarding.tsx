import { useEffect, useState } from 'react';
import {
  Bike,
  Building2,
  CheckCircle2,
  Home,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  DELIVERY_HOSTELS,
  DELIVERY_PARTNER_GENDERS,
  DELIVERY_PARTNER_TYPES,
  getDeliveryPartnerTypeLabel,
} from '../lib/deliveryPartner';
import type {
  DeliveryPartnerGender,
  DeliveryPartnerType,
} from '../lib/supabase';

export type DeliveryPartnerOnboardingForm = {
  name: string;
  phone: string;
  gender: DeliveryPartnerGender | '';
  partnerType: DeliveryPartnerType;
  hostelName: string;
  block: string;
  roomNumber: string;
  buildingNumber: string;
  cabinNumber: string;
  areaLabel: string;
};

interface DeliveryPartnerOnboardingProps {
  initialValues: DeliveryPartnerOnboardingForm;
  loading: boolean;
  errorMessage: string;
  userAvatarUrl?: string | null;
  onSubmit: (values: DeliveryPartnerOnboardingForm) => Promise<void> | void;
}

const sanitizePhoneValue = (value: string) => value.replace(/[^\d+]/g, '').slice(0, 13);

export default function DeliveryPartnerOnboarding({
  initialValues,
  loading,
  errorMessage,
  userAvatarUrl = null,
  onSubmit,
}: DeliveryPartnerOnboardingProps) {
  const [form, setForm] = useState<DeliveryPartnerOnboardingForm>(initialValues);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const updateForm = <K extends keyof DeliveryPartnerOnboardingForm>(
    key: K,
    value: DeliveryPartnerOnboardingForm[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const isLocationComplete =
    form.partnerType === 'hosteller'
      ? !!form.hostelName.trim() && !!form.block.trim() && !!form.roomNumber.trim()
      : form.partnerType === 'teacher'
        ? !!form.buildingNumber.trim() && !!form.cabinNumber.trim()
        : !!form.areaLabel.trim();

  const canSubmit =
    !!form.name.trim() &&
    !!form.phone.trim() &&
    !!form.gender &&
    !!form.partnerType &&
    isLocationComplete;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || loading) {
      return;
    }

    await onSubmit({
      ...form,
      name: form.name.trim(),
      phone: sanitizePhoneValue(form.phone),
      hostelName: form.hostelName.trim(),
      block: form.block.trim(),
      roomNumber: form.roomNumber.trim(),
      buildingNumber: form.buildingNumber.trim(),
      cabinNumber: form.cabinNumber.trim(),
      areaLabel: form.areaLabel.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),rgba(3,7,18,0.98)_45%),linear-gradient(135deg,#020617_0%,#08121f_45%,#03111c_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <section className="overflow-hidden rounded-[32px] border border-emerald-500/20 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur">
          <div className="border-b border-white/10 bg-gradient-to-br from-emerald-500/18 via-transparent to-sky-400/10 px-6 py-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
              <Bike className="h-4 w-4" />
              Delivery partner mode
            </div>
            <h1 className="max-w-xl text-3xl font-black tracking-tight text-white sm:text-4xl">
              Switch the whole app into a rider-first dashboard.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Register once and you will get a clean delivery console with incoming orders, accept actions,
              customer call access, and live online status.
            </p>
          </div>

          <div className="space-y-6 px-6 py-6">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                What unlocks
              </p>
              <div className="mt-4 space-y-3">
                {[
                  'Incoming orders appear in a dedicated partner queue.',
                  'You can accept, pick up, and mark orders delivered.',
                  'Customers can call the assigned partner directly from order tracking.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-sky-400/15 bg-sky-500/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {userAvatarUrl ? (
                    <img
                      src={userAvatarUrl}
                      alt="Delivery partner"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-7 w-7 text-sky-100" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Verified through your Vajra account</p>
                  <p className="text-sm text-slate-300">
                    We use this to keep delivery identity and customer call access clean.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Role preview
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {DELIVERY_PARTNER_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      form.partnerType === type.value
                        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-50'
                        : 'border-white/10 bg-white/[0.03] text-slate-300'
                    }`}
                  >
                    <p className="font-semibold">{type.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/75 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="border-b border-white/10 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Register for delivery
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">Complete your rider profile</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              This opens the delivery dashboard and lets orders route to you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
            {errorMessage && (
              <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <UserRound className="h-4 w-4 text-emerald-300" />
                  Full name
                </span>
                <input
                  value={form.name}
                  onChange={(event) => updateForm('name', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40 focus:bg-white/[0.07]"
                  placeholder="Your delivery partner name"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <Phone className="h-4 w-4 text-emerald-300" />
                  Phone number
                </span>
                <input
                  value={form.phone}
                  onChange={(event) => updateForm('phone', sanitizePhoneValue(event.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40 focus:bg-white/[0.07]"
                  placeholder="10-digit active mobile number"
                />
              </label>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-white">Gender</p>
              <div className="flex flex-wrap gap-3">
                {DELIVERY_PARTNER_GENDERS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => updateForm('gender', item.value)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      form.gender === item.value
                        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-50'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-white">You are registering as</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {DELIVERY_PARTNER_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateForm('partnerType', type.value)}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      form.partnerType === type.value
                        ? 'border-emerald-400/40 bg-emerald-500/15 text-white'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <p className="font-semibold">{type.label}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {form.partnerType === 'hosteller' && (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <Home className="h-4 w-4 text-emerald-300" />
                  Hostel base
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm text-slate-300">Hostel name</span>
                    <div className="flex flex-wrap gap-2">
                      {DELIVERY_HOSTELS.map((hostel) => (
                        <button
                          key={hostel}
                          type="button"
                          onClick={() => updateForm('hostelName', hostel)}
                          className={`rounded-full border px-3 py-2 text-sm transition ${
                            form.hostelName === hostel
                              ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-50'
                              : 'border-white/10 bg-slate-950/40 text-slate-300'
                          }`}
                        >
                          {hostel}
                        </button>
                      ))}
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Block</span>
                    <input
                      value={form.block}
                      onChange={(event) => updateForm('block', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40"
                      placeholder="A / B / C"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Room number</span>
                    <input
                      value={form.roomNumber}
                      onChange={(event) => updateForm('roomNumber', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40"
                      placeholder="617"
                    />
                  </label>
                </div>
              </div>
            )}

            {form.partnerType === 'teacher' && (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <Building2 className="h-4 w-4 text-emerald-300" />
                  Faculty base
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Building number</span>
                    <input
                      value={form.buildingNumber}
                      onChange={(event) => updateForm('buildingNumber', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40"
                      placeholder="Block 32"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Cabin number</span>
                    <input
                      value={form.cabinNumber}
                      onChange={(event) => updateForm('cabinNumber', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40"
                      placeholder="204"
                    />
                  </label>
                </div>
              </div>
            )}

            {form.partnerType === 'non_hosteller' && (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <Building2 className="h-4 w-4 text-emerald-300" />
                  Primary delivery zone
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Area / pickup base</span>
                  <input
                    value={form.areaLabel}
                    onChange={(event) => updateForm('areaLabel', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40"
                    placeholder="Apartment gate, studio lane, or off-campus base"
                  />
                </label>
              </div>
            )}

            <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/10 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-200" />
                <div>
                  <p className="font-semibold text-white">
                    {getDeliveryPartnerTypeLabel(form.partnerType)} profile will be created on this Vajra account.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-emerald-50/85">
                    After registration you can go online, receive new orders with sound alerts, and let customers call
                    you directly.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />
                  Creating delivery profile...
                </>
              ) : (
                <>
                  <Bike className="h-4 w-4" />
                  Start delivery mode
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
