import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeIndianRupee,
  MapPin,
  MessageCircle,
  PackageCheck,
  PencilLine,
  Phone,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  buildMarketplaceWhatsappLink,
  formatMarketplacePrice,
  formatMarketplaceTimeAgo,
  getMarketplacePrimaryImage,
  marketplaceCategoryLabels,
  marketplaceConditionLabels,
  marketplaceStatusClasses,
  marketplaceStatusLabels,
} from '../lib/marketplace';
import type { MarketplaceListing, MarketplaceListingStatus } from '../lib/supabase';

interface MarketplaceListingDetailModalProps {
  open: boolean;
  listing: MarketplaceListing | null;
  isOwner: boolean;
  onClose: () => void;
  onEdit: (listing: MarketplaceListing) => void;
  onChangeStatus: (listing: MarketplaceListing, status: MarketplaceListingStatus) => void;
  onDelete: (listing: MarketplaceListing) => void;
}

export default function MarketplaceListingDetailModal({
  open,
  listing,
  isOwner,
  onClose,
  onEdit,
  onChangeStatus,
  onDelete,
}: MarketplaceListingDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [listing?.id]);

  const images = useMemo(() => listing?.image_urls ?? [], [listing?.image_urls]);
  const activeImage = listing
    ? images[selectedImageIndex] || getMarketplacePrimaryImage(listing)
    : '';
  const whatsappLink = listing
    ? buildMarketplaceWhatsappLink(listing.seller_phone, listing.title)
    : '';
  const sellerInitial = (listing?.seller_name?.trim().charAt(0) || 'S').toUpperCase();

  if (!open || !listing) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-4 backdrop-blur-sm sm:py-8">
      <div className="flex min-h-full items-start justify-center sm:items-center">
        <div className="w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/10 bg-gray-950 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-5 sm:px-7">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
              Marketplace listing
            </p>
            <h3 className="text-2xl font-bold text-white">{listing.title}</h3>
            <p className="mt-2 text-sm text-gray-400">
              Posted {formatMarketplaceTimeAgo(listing.created_at)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-0 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-5 px-6 py-6 sm:px-7">
            <div className="overflow-hidden rounded-[28px] border border-white/5 bg-gray-900">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={listing.title}
                  className="h-[420px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.15),transparent_55%),linear-gradient(135deg,rgba(17,24,39,0.96),rgba(17,24,39,0.86))]">
                  <PackageCheck className="h-14 w-14 text-orange-200" />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((imageUrl, index) => (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`overflow-hidden rounded-2xl border transition-all ${
                      selectedImageIndex === index
                        ? 'border-orange-400/40 shadow-lg shadow-orange-500/10'
                        : 'border-white/5 opacity-80 hover:border-white/10 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${listing.title} ${index + 1}`}
                      className="h-20 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="rounded-[28px] border border-white/5 bg-white/5 p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${
                    marketplaceStatusClasses[listing.status]
                  }`}
                >
                  {marketplaceStatusLabels[listing.status]}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200">
                  {marketplaceCategoryLabels[listing.category]}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200">
                  {marketplaceConditionLabels[listing.condition]}
                </span>
                {listing.negotiable && (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                    Negotiable
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <BadgeIndianRupee className="h-5 w-5 text-orange-300" />
                <p className="text-3xl font-bold text-white">{formatMarketplacePrice(listing.price)}</p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-gray-950/60 px-4 py-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Pickup location</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-orange-300" />
                    <p className="leading-6 text-white">{listing.location_label}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-gray-950/60 px-4 py-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Listing age</p>
                  <p className="leading-6 text-white">{formatMarketplaceTimeAgo(listing.created_at)}</p>
                </div>
              </div>

              {listing.pickup_details && (
                <div className="mt-4 rounded-2xl border border-white/5 bg-gray-950/60 px-4 py-4">
                  <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Pickup note</p>
                  <p className="leading-7 text-gray-300">{listing.pickup_details}</p>
                </div>
              )}

              <div className="mt-4 rounded-2xl border border-white/5 bg-gray-950/60 px-4 py-4">
                <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">Description</p>
                <p className="leading-7 text-gray-300">{listing.description}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 bg-gradient-to-br from-gray-950 via-gray-950 to-gray-900 px-6 py-6 sm:px-7 xl:border-l xl:border-t-0">
            <div className="rounded-[28px] border border-white/5 bg-white/5 p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-orange-400/20 bg-orange-500/15 text-lg font-bold text-orange-200">
                  {listing.seller_avatar_url ? (
                    <img
                      src={listing.seller_avatar_url}
                      alt={listing.seller_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    sellerInitial
                  )}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">
                    Seller
                  </p>
                  <p className="text-lg font-bold text-white">{listing.seller_name}</p>
                  <p className="text-sm text-gray-400">{listing.seller_phone}</p>
                </div>
              </div>

              {!isOwner ? (
                <div className="space-y-3">
                  <a
                    href={`tel:${listing.seller_phone}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call seller</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (whatsappLink) {
                        window.open(whatsappLink, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    disabled={!whatsappLink}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{whatsappLink ? 'Open WhatsApp' : 'WhatsApp unavailable'}</span>
                  </button>

                  <div className="rounded-2xl border border-white/5 bg-gray-950/60 px-4 py-4 text-sm leading-6 text-gray-400">
                    Meet in a safe public campus spot and confirm the item condition before paying.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => onEdit(listing)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    <PencilLine className="h-4 w-4" />
                    <span>Edit listing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onChangeStatus(
                        listing,
                        listing.status === 'active' ? 'sold' : 'active'
                      )
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>{listing.status === 'active' ? 'Mark as sold' : 'Relist as active'}</span>
                  </button>

                  {listing.status !== 'reserved' && listing.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => onChangeStatus(listing, 'reserved')}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-500/15"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span>Mark as reserved</span>
                    </button>
                  )}

                  {listing.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() => onChangeStatus(listing, 'archived')}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      <PackageCheck className="h-4 w-4" />
                      <span>Archive listing</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDelete(listing)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-100 transition-colors hover:bg-red-500/15"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete listing</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
