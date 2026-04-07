import type {
  MarketplaceListing,
  MarketplaceListingCategory,
  MarketplaceListingCondition,
  MarketplaceListingStatus,
} from './supabase';

export const marketplaceCategories = [
  'electronics',
  'furniture',
  'books',
  'fashion',
  'appliances',
  'cycles',
  'gaming',
  'study',
  'hostel-essentials',
  'other',
] as const satisfies readonly MarketplaceListingCategory[];

export const marketplaceCategoryLabels: Record<MarketplaceListingCategory, string> = {
  electronics: 'Electronics',
  furniture: 'Furniture',
  books: 'Books',
  fashion: 'Fashion',
  appliances: 'Appliances',
  cycles: 'Cycles',
  gaming: 'Gaming',
  study: 'Study',
  'hostel-essentials': 'Hostel Essentials',
  other: 'Other',
};

export const marketplaceConditions = [
  'new',
  'like_new',
  'good',
  'fair',
] as const satisfies readonly MarketplaceListingCondition[];

export const marketplaceConditionLabels: Record<MarketplaceListingCondition, string> = {
  new: 'New',
  like_new: 'Like new',
  good: 'Good',
  fair: 'Fair',
};

export const marketplaceStatuses = [
  'active',
  'reserved',
  'sold',
  'archived',
] as const satisfies readonly MarketplaceListingStatus[];

export const marketplaceStatusLabels: Record<MarketplaceListingStatus, string> = {
  active: 'Active',
  reserved: 'Reserved',
  sold: 'Sold',
  archived: 'Archived',
};

export const marketplaceStatusClasses: Record<MarketplaceListingStatus, string> = {
  active: 'border-emerald-400/25 bg-emerald-500/15 text-emerald-200',
  reserved: 'border-amber-400/25 bg-amber-500/15 text-amber-200',
  sold: 'border-sky-400/25 bg-sky-500/15 text-sky-200',
  archived: 'border-white/10 bg-white/5 text-gray-300',
};

export const MAX_MARKETPLACE_IMAGES = 4;
const MAX_MARKETPLACE_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const MARKETPLACE_IMAGE_MAX_DIMENSION = 1280;
const MARKETPLACE_IMAGE_QUALITY = 0.84;

export const formatMarketplacePrice = (amount: number) => {
  if (amount <= 0) {
    return 'Free';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatMarketplaceTimeAgo = (value: string) => {
  const now = Date.now();
  const createdAt = new Date(value).getTime();

  if (Number.isNaN(createdAt)) {
    return 'Recently added';
  }

  const seconds = Math.max(1, Math.floor((now - createdAt) / 1000));

  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(value));
};

export const normalizeMarketplaceImages = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
};

export const normalizeMarketplaceListing = (listing: MarketplaceListing): MarketplaceListing => ({
  ...listing,
  image_urls: normalizeMarketplaceImages(listing.image_urls),
});

export const getMarketplacePrimaryImage = (listing: MarketplaceListing) =>
  normalizeMarketplaceImages(listing.image_urls)[0] || '';

export const buildMarketplaceWhatsappLink = (phone: string, title: string) => {
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 10) {
    return '';
  }

  return `https://wa.me/${digits}?text=${encodeURIComponent(`Hi, I am interested in "${title}" on The Vajra marketplace.`)}`;
};

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

const optimizeMarketplaceImage = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be added to a listing.');
  }

  if (file.size > MAX_MARKETPLACE_IMAGE_FILE_SIZE) {
    throw new Error('Each image must be smaller than 5 MB.');
  }

  const source = await readFileAsDataUrl(file);

  return new Promise<string>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const largestSide = Math.max(image.width, image.height);
      const scale =
        largestSide > MARKETPLACE_IMAGE_MAX_DIMENSION
          ? MARKETPLACE_IMAGE_MAX_DIMENSION / largestSide
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
      resolve(canvas.toDataURL('image/jpeg', MARKETPLACE_IMAGE_QUALITY));
    };

    image.onerror = () => reject(new Error('Unable to process the selected image.'));
    image.src = source;
  });
};

export const optimizeMarketplaceImages = async (files: File[]) => {
  if (files.length > MAX_MARKETPLACE_IMAGES) {
    throw new Error(`Please add up to ${MAX_MARKETPLACE_IMAGES} images only.`);
  }

  return Promise.all(files.map((file) => optimizeMarketplaceImage(file)));
};

export const isMarketplaceSchemaMissing = (error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
      ? String(error.message ?? '')
      : String(error ?? '');

  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes('marketplace_listings') ||
    normalizedMessage.includes('image_urls') ||
    normalizedMessage.includes('seller_avatar_url') ||
    normalizedMessage.includes('does not exist') ||
    normalizedMessage.includes('could not find the table')
  );
};
