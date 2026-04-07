import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, MapPin, ShieldCheck, Tag, Trash2, X } from 'lucide-react';
import { sanitizeName, sanitizePhone, sanitizeText } from '../lib/inputSanitization';
import {
  MAX_MARKETPLACE_IMAGES,
  formatMarketplacePrice,
  isMarketplaceSchemaMissing,
  marketplaceCategories,
  marketplaceCategoryLabels,
  marketplaceConditionLabels,
  marketplaceConditions,
  normalizeMarketplaceListing,
  optimizeMarketplaceImages,
} from '../lib/marketplace';
import {
  supabase,
  type MarketplaceListing,
  type MarketplaceListingCategory,
  type MarketplaceListingCondition,
} from '../lib/supabase';

interface MarketplaceListingComposerProps {
  userId: string;
  open: boolean;
  listing?: MarketplaceListing | null;
  initialSellerName: string;
  initialSellerPhone: string;
  initialSellerAvatarUrl?: string | null;
  defaultLocationLabel: string;
  onClose: () => void;
  onSaved: (listing: MarketplaceListing) => void;
}

type ListingComposerForm = {
  seller_name: string;
  seller_phone: string;
  title: string;
  description: string;
  category: MarketplaceListingCategory;
  condition: MarketplaceListingCondition;
  price: string;
  negotiable: boolean;
  location_label: string;
  pickup_details: string;
  image_urls: string[];
};

const createDefaultForm = (
  initialSellerName: string,
  initialSellerPhone: string,
  defaultLocationLabel: string,
  initialSellerAvatarUrl?: string | null,
  listing?: MarketplaceListing | null
): ListingComposerForm => ({
  seller_name: listing?.seller_name ?? initialSellerName,
  seller_phone: listing?.seller_phone ?? initialSellerPhone,
  title: listing?.title ?? '',
  description: listing?.description ?? '',
  category: listing?.category ?? 'electronics',
  condition: listing?.condition ?? 'good',
  price: listing ? String(listing.price) : '',
  negotiable: listing?.negotiable ?? false,
  location_label: listing?.location_label ?? defaultLocationLabel,
  pickup_details: listing?.pickup_details ?? '',
  image_urls: listing?.image_urls ?? [],
});

export default function MarketplaceListingComposer({
  userId,
  open,
  listing,
  initialSellerName,
  initialSellerPhone,
  initialSellerAvatarUrl,
  defaultLocationLabel,
  onClose,
  onSaved,
}: MarketplaceListingComposerProps) {
  const [form, setForm] = useState<ListingComposerForm>(() =>
    createDefaultForm(initialSellerName, initialSellerPhone, defaultLocationLabel, initialSellerAvatarUrl, listing)
  );
  const [processingImages, setProcessingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      createDefaultForm(
        initialSellerName,
        initialSellerPhone,
        defaultLocationLabel,
        initialSellerAvatarUrl,
        listing
      )
    );
    setProcessingImages(false);
    setSaving(false);
    setErrorMessage('');
    setSuccessMessage('');
  }, [defaultLocationLabel, initialSellerAvatarUrl, initialSellerName, initialSellerPhone, listing, open]);

  const numericPrice = useMemo(() => Number(form.price), [form.price]);
  const isEditing = Boolean(listing);
  const isSaveDisabled =
    saving ||
    processingImages ||
    !form.seller_name.trim() ||
    !form.seller_phone.trim() ||
    !form.title.trim() ||
    !form.description.trim() ||
    !form.location_label.trim() ||
    !Number.isFinite(numericPrice) ||
    numericPrice < 0 ||
    form.image_urls.length === 0;

  if (!open) {
    return null;
  }

  const updateField = <T extends keyof ListingComposerForm>(field: T, value: ListingComposerForm[T]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = MAX_MARKETPLACE_IMAGES - form.image_urls.length;

    if (remainingSlots <= 0) {
      setErrorMessage(`You can add up to ${MAX_MARKETPLACE_IMAGES} images per listing.`);
      return;
    }

    setProcessingImages(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const optimizedImages = await optimizeMarketplaceImages(selectedFiles.slice(0, remainingSlots));
      setForm((current) => ({
        ...current,
        image_urls: [...current.image_urls, ...optimizedImages],
      }));
      setSuccessMessage(
        selectedFiles.length > remainingSlots
          ? `Only the first ${remainingSlots} image(s) were added.`
          : 'Images are ready for your listing.'
      );
    } catch (error) {
      console.error('Error preparing marketplace images:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'We could not prepare those images. Please try again.'
      );
    } finally {
      setProcessingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setForm((current) => ({
      ...current,
      image_urls: current.image_urls.filter((_, currentIndex) => currentIndex !== index),
    }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSaveDisabled) {
      setErrorMessage('Please complete the listing details before saving.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        user_id: userId,
        seller_name: sanitizeName(form.seller_name),
        seller_phone: sanitizePhone(form.seller_phone),
        seller_avatar_url: initialSellerAvatarUrl?.trim() || null,
        title: sanitizeText(form.title, 'Title', 5, 120),
        description: sanitizeText(form.description, 'Description', 20, 1200),
        category: form.category,
        condition: form.condition,
        price: Math.max(0, Number(form.price)),
        negotiable: form.negotiable,
        location_label: sanitizeText(form.location_label, 'Location', 2, 160),
        pickup_details: sanitizeText(form.pickup_details, 'Pickup details', 0, 240) || null,
        image_urls: form.image_urls,
        ...(isEditing ? {} : { status: 'active' as const, is_featured: false }),
      };

      const query = isEditing
        ? supabase
            .from('marketplace_listings')
            .update(payload)
            .eq('id', listing.id)
            .eq('user_id', userId)
        : supabase.from('marketplace_listings').insert([payload]);

      const { data, error } = await query.select('*').single();

      if (error) {
        throw error;
      }

      onSaved(normalizeMarketplaceListing(data as MarketplaceListing));
    } catch (error) {
      console.error('Error saving marketplace listing:', error);
      setErrorMessage(
        isMarketplaceSchemaMissing(error)
          ? 'Marketplace tables are not live yet. Run the marketplace SQL first, then save the listing again.'
          : error instanceof Error
          ? error.message
          : 'We could not save the listing right now. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/10 bg-gray-950 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-5 sm:px-7">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
              {isEditing ? 'Update listing' : 'Post a listing'}
            </p>
            <h3 className="text-2xl font-bold text-white">
              {isEditing ? 'Edit your marketplace listing' : 'Sell something on campus'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Add product photos, set the price, and keep pickup details clear so interested buyers
              can reach you quickly.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving || processingImages}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-0 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6 px-6 py-6 sm:px-7">
            {errorMessage && (
              <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {successMessage}
              </div>
            )}

            <div className="rounded-[26px] border border-white/5 bg-white/5 p-5">
              <div className="mb-4 flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-orange-300" />
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
                  Listing Photos
                </h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {form.image_urls.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gray-900">
                    <img
                      src={imageUrl}
                      alt={`Listing preview ${index + 1}`}
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute right-2 top-2 rounded-full border border-black/10 bg-white/90 p-2 text-gray-700 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {form.image_urls.length < MAX_MARKETPLACE_IMAGES && (
                  <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-gray-900/60 text-center transition-colors hover:border-orange-400/30 hover:bg-gray-900">
                    <ImagePlus className="mb-2 h-5 w-5 text-orange-300" />
                    <span className="text-sm font-semibold text-white">Add images</span>
                    <span className="mt-1 text-xs text-gray-400">
                      Up to {MAX_MARKETPLACE_IMAGES} photos
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelection}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-300">Product title</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-orange-500/40"
                  placeholder="e.g. Study table with shelf"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-300">Expected price</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(event) => updateField('price', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-orange-500/40"
                  placeholder="0 for free"
                />
              </label>

              <div>
                <span className="mb-2 block text-sm font-medium text-gray-300">Category</span>
                <div className="flex flex-wrap gap-2">
                  {marketplaceCategories.map((category) => {
                    const isSelected = form.category === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => updateField('category', category)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-orange-500/35 bg-orange-500/15 text-orange-200'
                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {marketplaceCategoryLabels[category]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-gray-300">Condition</span>
                <div className="flex flex-wrap gap-2">
                  {marketplaceConditions.map((condition) => {
                    const isSelected = form.condition === condition;

                    return (
                      <button
                        key={condition}
                        type="button"
                        onClick={() => updateField('condition', condition)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-orange-500/35 bg-orange-500/15 text-orange-200'
                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {marketplaceConditionLabels[condition]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-gray-300">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-orange-500/40"
                  placeholder="Mention item age, working condition, reason for selling, and anything buyers should know."
                />
              </label>
            </div>
          </div>

          <div className="border-t border-white/5 bg-gradient-to-br from-gray-950 via-gray-950 to-gray-900 px-6 py-6 sm:px-7 xl:border-l xl:border-t-0">
            <div className="space-y-6">
              <div className="rounded-[26px] border border-white/5 bg-white/5 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-300" />
                  <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
                    Seller & Pickup
                  </h4>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Seller name</span>
                    <input
                      type="text"
                      value={form.seller_name}
                      onChange={(event) => updateField('seller_name', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-orange-500/40"
                      placeholder="Your name"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Seller phone</span>
                    <input
                      type="tel"
                      value={form.seller_phone}
                      onChange={(event) => updateField('seller_phone', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-orange-500/40"
                      placeholder="WhatsApp or call number"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Pickup location</span>
                    <input
                      type="text"
                      value={form.location_label}
                      onChange={(event) => updateField('location_label', event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-orange-500/40"
                      placeholder="e.g. BH4 Block A or Faculty Cabin 204"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">Extra pickup note</span>
                    <textarea
                      value={form.pickup_details}
                      onChange={(event) => updateField('pickup_details', event.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-white/10 bg-gray-900 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-500 focus:border-orange-500/40"
                      placeholder="Best pickup time, block gate note, or nearby landmark."
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[26px] border border-white/5 bg-white/5 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-orange-300" />
                  <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
                    Listing Summary
                  </h4>
                </div>

                <div className="space-y-3 text-sm text-gray-300">
                  <div className="rounded-2xl border border-white/5 bg-gray-950/60 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Price preview</p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {Number.isFinite(numericPrice) && numericPrice >= 0
                        ? formatMarketplacePrice(numericPrice)
                        : 'Enter a valid price'}
                    </p>
                  </div>

                  <label className="flex items-center gap-3 rounded-2xl border border-white/5 bg-gray-950/60 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={form.negotiable}
                      onChange={(event) => updateField('negotiable', event.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-gray-900 text-orange-500 focus:ring-orange-500/30"
                    />
                    <span>Mark this listing as negotiable</span>
                  </label>

                  <div className="rounded-2xl border border-white/5 bg-gray-950/60 px-4 py-4">
                    <div className="mb-2 flex items-center gap-2 text-orange-200">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-sm font-semibold">Marketplace tip</span>
                    </div>
                    <p className="leading-6 text-gray-400">
                      Clear photos, honest condition details, and an exact pickup spot usually get
                      faster responses from campus buyers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving || processingImages}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaveDisabled}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-700"
                >
                  {processingImages
                    ? 'Preparing images...'
                    : saving
                    ? isEditing
                      ? 'Updating listing...'
                      : 'Posting listing...'
                    : isEditing
                    ? 'Update listing'
                    : 'Post listing'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
