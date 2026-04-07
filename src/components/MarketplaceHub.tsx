import { useEffect, useMemo, useState } from 'react';
import {
  BadgeIndianRupee,
  Layers3,
  MapPin,
  PackageSearch,
  Plus,
  RefreshCw,
  Search,
  Store,
  UserRound,
} from 'lucide-react';
import BrandedLoader from './BrandedLoader';
import MarketplaceListingComposer from './MarketplaceListingComposer';
import MarketplaceListingDetailModal from './MarketplaceListingDetailModal';
import {
  supabase,
  type MarketplaceListing,
  type MarketplaceListingCategory,
  type MarketplaceListingStatus,
  type UserProfile,
} from '../lib/supabase';
import {
  formatMarketplacePrice,
  formatMarketplaceTimeAgo,
  getMarketplacePrimaryImage,
  isMarketplaceSchemaMissing,
  marketplaceCategories,
  marketplaceCategoryLabels,
  marketplaceConditionLabels,
  marketplaceStatusClasses,
  marketplaceStatusLabels,
  normalizeMarketplaceListing,
} from '../lib/marketplace';

interface MarketplaceHubProps {
  userId: string;
  fallbackName?: string;
}

type MarketplaceView = 'browse' | 'mine';
type MarketplaceCategoryFilter = 'all' | MarketplaceListingCategory;

const marketplaceStatusOrder: Record<MarketplaceListingStatus, number> = {
  active: 0,
  reserved: 1,
  sold: 2,
  archived: 3,
};

const sortMarketplaceListings = (items: MarketplaceListing[]) =>
  [...items].sort((left, right) => {
    if (left.is_featured !== right.is_featured) {
      return Number(right.is_featured) - Number(left.is_featured);
    }

    const statusDifference =
      marketplaceStatusOrder[left.status] - marketplaceStatusOrder[right.status];

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });

const buildMarketplaceLocationLabel = (profile: UserProfile | null) => {
  if (!profile) {
    return 'Campus pickup';
  }

  if (profile.user_role === 'teacher') {
    return [
      profile.building_number && `Building ${profile.building_number}`,
      profile.cabin_number && `Cabin ${profile.cabin_number}`,
    ]
      .filter(Boolean)
      .join(', ') || 'Faculty cabin pickup';
  }

  switch (profile.location_type) {
    case 'Hostel':
      return [
        profile.hostel_name,
        profile.block && `Block ${profile.block}`,
        profile.room_number && `Room ${profile.room_number}`,
      ]
        .filter(Boolean)
        .join(', ') || 'Campus pickup';
    case 'Class':
      return [
        profile.building_number && `Building ${profile.building_number}`,
        profile.room_number && `Room ${profile.room_number}`,
      ]
        .filter(Boolean)
        .join(', ') || 'Campus pickup';
    case 'Studio Apartment':
    case 'Apartment':
      return [
        profile.block && `Block ${profile.block}`,
        profile.room_number && `Room ${profile.room_number}`,
      ]
        .filter(Boolean)
        .join(', ') || 'Campus pickup';
    case 'Other':
      return (
        [profile.building_number, profile.exact_location].filter(Boolean).join(', ') ||
        'Campus pickup'
      );
    default:
      return 'Campus pickup';
  }
};

const buildMarketplaceSearchText = (listing: MarketplaceListing) =>
  [
    listing.title,
    listing.description,
    listing.seller_name,
    listing.location_label,
    listing.pickup_details,
    marketplaceCategoryLabels[listing.category],
    marketplaceConditionLabels[listing.condition],
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export default function MarketplaceHub({ userId, fallbackName = '' }: MarketplaceHubProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  const [schemaReady, setSchemaReady] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);
  const [activeView, setActiveView] = useState<MarketplaceView>('browse');
  const [selectedCategory, setSelectedCategory] =
    useState<MarketplaceCategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<MarketplaceListing | null>(null);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoadingProfile(true);

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (isMounted) {
          setProfile((data as UserProfile | null) ?? null);
        }
      } catch (error) {
        console.error('Error loading marketplace profile context:', error);

        if (isMounted) {
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    void fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    let isMounted = true;

    const fetchListings = async () => {
      setLoadingListings(true);
      setErrorMessage('');

      try {
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        setSchemaReady(true);
        setListings(
          sortMarketplaceListings(
            ((data as MarketplaceListing[]) ?? []).map((listing) =>
              normalizeMarketplaceListing(listing)
            )
          )
        );
      } catch (error) {
        console.error('Error loading marketplace listings:', error);

        if (!isMounted) {
          return;
        }

        setListings([]);

        if (isMarketplaceSchemaMissing(error)) {
          setSchemaReady(false);
          setErrorMessage(
            'Marketplace tables are not live yet. Run the marketplace SQL migration first, then refresh this section.'
          );
        } else {
          setSchemaReady(true);
          setErrorMessage(
            'We could not load marketplace listings right now. Please try again in a moment.'
          );
        }
      } finally {
        if (isMounted) {
          setLoadingListings(false);
        }
      }
    };

    void fetchListings();

    return () => {
      isMounted = false;
    };
  }, [refreshTick, userId]);

  useEffect(() => {
    if (!selectedListing) {
      return;
    }

    const nextSelectedListing =
      listings.find((listing) => listing.id === selectedListing.id) ?? null;

    if (!nextSelectedListing) {
      setSelectedListing(null);
      return;
    }

    if (nextSelectedListing !== selectedListing) {
      setSelectedListing(nextSelectedListing);
    }
  }, [listings, selectedListing]);

  const initialSellerName = profile?.name?.trim() || fallbackName.trim();
  const initialSellerPhone = profile?.phone?.trim() || '';
  const initialSellerAvatarUrl = profile?.avatar_url ?? null;
  const defaultLocationLabel = buildMarketplaceLocationLabel(profile);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const myListings = useMemo(
    () => listings.filter((listing) => listing.user_id === userId),
    [listings, userId]
  );

  const visibleListings = useMemo(() => {
    const sourceListings =
      activeView === 'mine'
        ? myListings
        : listings.filter((listing) => listing.status !== 'archived');

    return sourceListings.filter((listing) => {
      const matchesCategory =
        selectedCategory === 'all' || listing.category === selectedCategory;
      const matchesSearch =
        normalizedSearchQuery.length === 0 ||
        buildMarketplaceSearchText(listing).includes(normalizedSearchQuery);

      return matchesCategory && matchesSearch;
    });
  }, [activeView, listings, myListings, normalizedSearchQuery, selectedCategory]);

  const activeListingsCount = useMemo(
    () => listings.filter((listing) => listing.status === 'active').length,
    [listings]
  );

  const myOpenListingsCount = useMemo(
    () =>
      myListings.filter(
        (listing) => listing.status === 'active' || listing.status === 'reserved'
      ).length,
    [myListings]
  );

  const featuredListingsCount = useMemo(
    () => listings.filter((listing) => listing.is_featured).length,
    [listings]
  );

  const handleRefresh = () => {
    setRefreshTick((current) => current + 1);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleComposerClose = () => {
    setComposerOpen(false);
    setEditingListing(null);
  };

  const handleOpenNewListing = () => {
    setSuccessMessage('');
    setErrorMessage('');
    setEditingListing(null);
    setComposerOpen(true);
    setActiveView('mine');
  };

  const handleSavedListing = (listing: MarketplaceListing) => {
    const normalizedListing = normalizeMarketplaceListing(listing);
    const wasEditing = Boolean(editingListing);

    setListings((current) =>
      sortMarketplaceListings([
        normalizedListing,
        ...current.filter((item) => item.id !== normalizedListing.id),
      ])
    );
    setSelectedListing(normalizedListing);
    setComposerOpen(false);
    setEditingListing(null);
    setActiveView('mine');
    setSuccessMessage(
      wasEditing
        ? 'Your marketplace listing has been updated.'
        : 'Your marketplace listing is now live.'
    );
    setErrorMessage('');
  };

  const handleEditListing = (listing: MarketplaceListing) => {
    setSelectedListing(null);
    setEditingListing(listing);
    setComposerOpen(true);
    setSuccessMessage('');
    setErrorMessage('');
    setActiveView('mine');
  };

  const handleChangeStatus = async (
    listing: MarketplaceListing,
    status: MarketplaceListingStatus
  ) => {
    if (processingAction || listing.status === status) {
      return;
    }

    setProcessingAction(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .update({ status })
        .eq('id', listing.id)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      const normalizedListing = normalizeMarketplaceListing(data as MarketplaceListing);

      setListings((current) =>
        sortMarketplaceListings(
          current.map((item) =>
            item.id === normalizedListing.id ? normalizedListing : item
          )
        )
      );
      setSelectedListing(normalizedListing);
      setSuccessMessage(
        status === 'sold'
          ? 'Listing marked as sold.'
          : status === 'reserved'
          ? 'Listing marked as reserved.'
          : status === 'archived'
          ? 'Listing archived.'
          : 'Listing moved back to active.'
      );
    } catch (error) {
      console.error('Error updating marketplace listing status:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'We could not update the listing status right now.'
      );
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteListing = async (listing: MarketplaceListing) => {
    if (processingAction) {
      return;
    }

    const shouldDelete = window.confirm(
      `Delete "${listing.title}" permanently from the marketplace?`
    );

    if (!shouldDelete) {
      return;
    }

    setProcessingAction(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', listing.id)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      setListings((current) =>
        current.filter((currentListing) => currentListing.id !== listing.id)
      );
      setSelectedListing(null);
      setSuccessMessage('Listing deleted from the marketplace.');
    } catch (error) {
      console.error('Error deleting marketplace listing:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'We could not delete the listing right now.'
      );
    } finally {
      setProcessingAction(false);
    }
  };

  if (loadingProfile || loadingListings) {
    return <BrandedLoader message="Loading second-hand marketplace..." />;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-gray-900 to-gray-900 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Second-hand Market
              </p>
              <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                Buy and sell useful campus items without leaving The Vajra.
              </h2>
              <p className="text-sm leading-7 text-gray-300 sm:text-base">
                Post your listing with photos, browse what other students are selling, and
                contact sellers directly for a quick campus handoff.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  'Direct buyer-seller contact',
                  'Campus pickup details',
                  'Owner controls for sold and archived items',
                ].map((point) => (
                  <span
                    key={point}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-100"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleOpenNewListing}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
                <span>Post Listing</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/5 bg-white/5 px-5 py-4">
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">
              Live listings
            </p>
            <p className="text-lg font-semibold text-white">{activeListingsCount}</p>
          </div>
          <div className="rounded-[24px] border border-white/5 bg-white/5 px-5 py-4">
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">
              Your open listings
            </p>
            <p className="text-lg font-semibold text-white">{myOpenListingsCount}</p>
          </div>
          <div className="rounded-[24px] border border-white/5 bg-white/5 px-5 py-4">
            <p className="mb-1 text-xs uppercase tracking-[0.16em] text-gray-500">
              Featured right now
            </p>
            <p className="text-lg font-semibold text-white">{featuredListingsCount}</p>
          </div>
        </div>

        {!initialSellerPhone && (
          <div className="rounded-[28px] border border-amber-500/25 bg-amber-500/10 px-5 py-5 text-sm text-amber-100 shadow-xl shadow-black/20">
            Add or confirm your phone number in Profile before posting so buyers can reach you.
          </div>
        )}

        {!schemaReady && (
          <div className="rounded-[28px] border border-amber-500/25 bg-amber-500/10 px-5 py-5 text-sm text-amber-100 shadow-xl shadow-black/20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
              Setup needed
            </p>
            <p className="leading-7">{errorMessage}</p>
          </div>
        )}

        {schemaReady && errorMessage && (
          <div className="rounded-[28px] border border-red-500/25 bg-red-500/10 px-5 py-5 text-sm text-red-100 shadow-xl shadow-black/20">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-[28px] border border-emerald-500/25 bg-emerald-500/10 px-5 py-5 text-sm text-emerald-100 shadow-xl shadow-black/20">
            {successMessage}
          </div>
        )}

        <div className="overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 shadow-xl shadow-black/20">
          <div className="flex flex-col gap-5 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                  Marketplace Controls
                </p>
                <h3 className="text-2xl font-bold text-white">
                  Browse the feed or manage your own listings
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('browse')}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                    activeView === 'browse'
                      ? 'border-orange-500/35 bg-orange-500/12 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Layers3 className="h-4 w-4" />
                  <span>Browse All</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('mine')}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                    activeView === 'mine'
                      ? 'border-orange-500/35 bg-orange-500/12 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Store className="h-4 w-4" />
                  <span>My Listings</span>
                </button>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by title, condition, seller, or pickup spot"
                  className="w-full rounded-full border border-white/10 bg-gray-900/90 py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-orange-500/40 focus:bg-gray-900"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`rounded-full border px-4 py-3 text-sm font-semibold transition-all ${
                    selectedCategory === 'all'
                      ? 'border-orange-500/35 bg-orange-500/12 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  All categories
                </button>
                {marketplaceCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full border px-4 py-3 text-sm font-semibold transition-all ${
                      selectedCategory === category
                        ? 'border-orange-500/35 bg-orange-500/12 text-white'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {marketplaceCategoryLabels[category]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {schemaReady && visibleListings.length === 0 && (
          <div className="rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 px-6 py-10 text-center shadow-xl shadow-black/20">
            <PackageSearch className="mx-auto mb-4 h-12 w-12 text-gray-500" />
            <h3 className="mb-2 text-2xl font-bold text-white">
              {activeView === 'mine'
                ? 'You have not posted any listings yet'
                : 'No marketplace listings match right now'}
            </h3>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-gray-400">
              {activeView === 'mine'
                ? 'Start with your first listing and it will appear here for you to manage.'
                : 'Try another search, switch the category filter, or refresh to check for newly posted items.'}
            </p>
          </div>
        )}

        {schemaReady && visibleListings.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {visibleListings.map((listing, index) => {
              const primaryImage = getMarketplacePrimaryImage(listing);
              const isOwner = listing.user_id === userId;

              return (
                <article
                  key={listing.id}
                  className="reveal-card overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800/95 shadow-xl shadow-black/20"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedListing(listing)}
                    className="block w-full text-left"
                  >
                    <div className="relative h-56 overflow-hidden bg-gray-800">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_60%),linear-gradient(135deg,rgba(15,23,42,1),rgba(17,24,39,0.92))]">
                          <Store className="h-16 w-16 text-emerald-200/85" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                            marketplaceStatusClasses[listing.status]
                          }`}
                        >
                          {marketplaceStatusLabels[listing.status]}
                        </span>
                        {listing.is_featured && (
                          <span className="inline-flex items-center rounded-full border border-amber-400/25 bg-amber-500/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100">
                            Featured
                          </span>
                        )}
                        {isOwner && (
                          <span className="inline-flex items-center rounded-full border border-white/15 bg-black/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                            Yours
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="mb-1 truncate text-sm font-semibold text-emerald-200">
                            {marketplaceCategoryLabels[listing.category]}
                          </p>
                          <h3 className="truncate text-2xl font-bold text-white">
                            {listing.title}
                          </h3>
                        </div>

                        <div className="rounded-full border border-white/10 bg-black/40 px-3 py-2 text-sm font-semibold text-white">
                          {listing.image_urls.length} photo
                          {listing.image_urls.length === 1 ? '' : 's'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 px-5 py-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 text-orange-200">
                          <BadgeIndianRupee className="h-4 w-4" />
                          <span className="text-xl font-bold text-white">
                            {formatMarketplacePrice(listing.price)}
                          </span>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200">
                          {marketplaceConditionLabels[listing.condition]}
                        </span>
                      </div>

                      <p className="line-clamp-3 text-sm leading-6 text-gray-400">
                        {listing.description}
                      </p>

                      <div className="grid gap-3">
                        <div className="flex items-start gap-2 text-sm text-gray-300">
                          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-300" />
                          <span className="line-clamp-2">{listing.location_label}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-sm">
                          <div className="inline-flex items-center gap-2 text-gray-300">
                            <UserRound className="h-4 w-4 text-gray-500" />
                            <span className="truncate">{listing.seller_name}</span>
                          </div>
                          <span className="text-gray-500">
                            {formatMarketplaceTimeAgo(listing.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <MarketplaceListingComposer
        userId={userId}
        open={composerOpen}
        listing={editingListing}
        initialSellerName={initialSellerName}
        initialSellerPhone={initialSellerPhone}
        initialSellerAvatarUrl={initialSellerAvatarUrl}
        defaultLocationLabel={defaultLocationLabel}
        onClose={handleComposerClose}
        onSaved={handleSavedListing}
      />

      <MarketplaceListingDetailModal
        open={Boolean(selectedListing)}
        listing={selectedListing}
        isOwner={selectedListing?.user_id === userId}
        onClose={() => setSelectedListing(null)}
        onEdit={handleEditListing}
        onChangeStatus={handleChangeStatus}
        onDelete={handleDeleteListing}
      />
    </>
  );
}
