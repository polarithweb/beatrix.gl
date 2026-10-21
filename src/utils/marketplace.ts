export type ListingCategory =
  | 'Game Accounts'
  | 'Game Coins'
  | 'In-Game Currency'
  | 'Items & Skins'
  | 'Top Up'
  | 'Gift Cards'
  | 'Game Pal'
  | 'Coaching'
  | 'Boosting'
  | 'Software';

export type FilterCategory = 'All' | ListingCategory;

export interface MarketplaceListing {
  id: string;
  title: string;
  game: string;
  category: ListingCategory;
  price: number;
  sellerId: string;
  sellerName: string;
  verified: boolean;
  status: 'active' | 'sold';
  deliveryTime: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NewListingInput {
  title: string;
  game: string;
  category: string;
  price: string | number;
  deliveryTime?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: {
    title?: string;
    game?: string;
    category?: string;
    price?: string;
  };
}

// Validation constants synchronized verbatim with firebase-blueprint.json
export const LISTING_CONSTRAINTS = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 120,
  GAME_MIN_LENGTH: 2,
  GAME_MAX_LENGTH: 60,
  SELLER_ID_MIN_LENGTH: 1,
  SELLER_ID_MAX_LENGTH: 128,
  SELLER_ID_PATTERN: /^[a-zA-Z0-9_\-]+$/,
  SELLER_NAME_MIN_LENGTH: 2,
  SELLER_NAME_MAX_LENGTH: 50,
  DELIVERY_TIME_MIN_LENGTH: 2,
  DELIVERY_TIME_MAX_LENGTH: 30,
  PRICE_MIN_EXCLUSIVE: 0,
  PRICE_MAX: 10000,
} as const;

export const LISTING_CATEGORIES: readonly ListingCategory[] = [
  'Game Accounts',
  'Game Coins',
  'In-Game Currency',
  'Items & Skins',
  'Top Up',
  'Gift Cards',
  'Game Pal',
  'Coaching',
  'Boosting',
  'Software',
] as const;

export const FILTER_CATEGORIES: readonly FilterCategory[] = [
  'All',
  ...LISTING_CATEGORIES,
] as const;

export function formatPrice(price: number): string {
  const safePrice = Number.isFinite(price) ? price : 0;
  return `$${safePrice.toFixed(2)}`;
}

export function filterListings(
  listings: MarketplaceListing[],
  selectedCategory: FilterCategory,
  searchQuery: string
): MarketplaceListing[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return listings.filter((item) => {
    if (item.status !== 'active') {
      return false;
    }

    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const titleMatch = item.title.toLowerCase().includes(normalizedQuery);
    const gameMatch = item.game.toLowerCase().includes(normalizedQuery);
    const categoryMatch = item.category.toLowerCase().includes(normalizedQuery);
    const sellerMatch = item.sellerName.toLowerCase().includes(normalizedQuery);

    return titleMatch || gameMatch || categoryMatch || sellerMatch;
  });
}

export function validateNewListingInput(input: NewListingInput): ValidationResult {
  const errors: ValidationResult['errors'] = {};
  const trimmedTitle = (input.title ?? '').trim();
  const trimmedGame = (input.game ?? '').trim();
  const category = (input.category ?? '').trim();
  const numericPrice =
    typeof input.price === 'number' ? input.price : Number(input.price);

  if (trimmedTitle.length < LISTING_CONSTRAINTS.TITLE_MIN_LENGTH) {
    errors.title = `Title must be at least ${LISTING_CONSTRAINTS.TITLE_MIN_LENGTH} characters.`;
  } else if (trimmedTitle.length > LISTING_CONSTRAINTS.TITLE_MAX_LENGTH) {
    errors.title = `Title cannot exceed ${LISTING_CONSTRAINTS.TITLE_MAX_LENGTH} characters.`;
  }

  if (trimmedGame.length < LISTING_CONSTRAINTS.GAME_MIN_LENGTH) {
    errors.game = `Game name must be at least ${LISTING_CONSTRAINTS.GAME_MIN_LENGTH} characters.`;
  } else if (trimmedGame.length > LISTING_CONSTRAINTS.GAME_MAX_LENGTH) {
    errors.game = `Game name cannot exceed ${LISTING_CONSTRAINTS.GAME_MAX_LENGTH} characters.`;
  }

  if (!LISTING_CATEGORIES.includes(category as ListingCategory)) {
    errors.category = 'Please select a valid marketplace category.';
  }

  if (
    input.price === '' ||
    !Number.isFinite(numericPrice) ||
    numericPrice <= LISTING_CONSTRAINTS.PRICE_MIN_EXCLUSIVE
  ) {
    errors.price = 'Price must be a valid amount greater than $0.00.';
  } else if (numericPrice > LISTING_CONSTRAINTS.PRICE_MAX) {
    errors.price = `Price cannot exceed $${LISTING_CONSTRAINTS.PRICE_MAX.toLocaleString()}.`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function sanitizeListingPayload(
  input: NewListingInput,
  sellerId: string,
  sellerName: string,
  verified: boolean
): Omit<MarketplaceListing, 'id' | 'createdAt' | 'updatedAt'> {
  const cleanSellerId =
    sellerId
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .slice(0, LISTING_CONSTRAINTS.SELLER_ID_MAX_LENGTH) || 'verified_seller';

  const cleanSellerName = sellerName
    .trim()
    .slice(0, LISTING_CONSTRAINTS.SELLER_NAME_MAX_LENGTH);

  const safeSellerName =
    cleanSellerName.length >= LISTING_CONSTRAINTS.SELLER_NAME_MIN_LENGTH
      ? cleanSellerName
      : 'Seller';

  const rawPrice =
    typeof input.price === 'number' ? input.price : Number(input.price);
  const roundedPrice = Math.min(
    LISTING_CONSTRAINTS.PRICE_MAX,
    Math.max(0.01, Math.round(rawPrice * 100) / 100)
  );

  const validCategory: ListingCategory = LISTING_CATEGORIES.includes(
    input.category as ListingCategory
  )
    ? (input.category as ListingCategory)
    : 'Game Accounts';

  const cleanDeliveryTime = (input.deliveryTime ?? 'Instant')
    .trim()
    .slice(0, LISTING_CONSTRAINTS.DELIVERY_TIME_MAX_LENGTH);
  const safeDeliveryTime =
    cleanDeliveryTime.length >= LISTING_CONSTRAINTS.DELIVERY_TIME_MIN_LENGTH
      ? cleanDeliveryTime
      : 'Instant';

  return {
    title: input.title.trim().slice(0, LISTING_CONSTRAINTS.TITLE_MAX_LENGTH),
    game: input.game.trim().slice(0, LISTING_CONSTRAINTS.GAME_MAX_LENGTH),
    category: validCategory,
    price: roundedPrice,
    sellerId: cleanSellerId,
    sellerName: safeSellerName,
    verified: Boolean(verified),
    status: 'active',
    deliveryTime: safeDeliveryTime,
  };
}
