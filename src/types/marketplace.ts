export type PageType =
  | 'home'
  | 'game_hub'
  | 'marketplace'
  | 'listing_detail'
  | 'checkout'
  | 'chat'
  | 'buyer_profile'
  | 'dashboard'
  | 'admin';

export type ServiceVertical =
  | 'Game Accounts'
  | 'Game Coins'
  | 'Items & Skins'
  | 'Top Up'
  | 'Gift Cards'
  | 'Game Pal'
  | 'Coaching'
  | 'Boosting'
  | 'Software'
  | string;

export interface ServiceCategoryItem {
  name: string;
  icon: string;
  iconUrl?: string;
}

export interface PromoCodeConfig {
  code: string;
  discountPercent: number;
  description: string;
  active: boolean;
}

export interface CustomNotificationItem {
  id: string;
  title: string;
  message: string;
  badge: string;
  timestamp: string;
}

export interface EscrowStepItem {
  step: string;
  title: string;
  subtitle: string;
}

export interface TrustPillarItem {
  title: string;
  description: string;
}

export type SellerApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface SellerApplication {
  id: string;
  applicantUid: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  aadhaarNumber: string;
  aadhaarImageUrl: string;
  payoutDetails: string;
  status: SellerApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  adminNote?: string;
}

export interface SiteConfig {
  // Brand, SEO & Custom Logo
  siteTitle: string;
  faviconUrl: string;
  brandPrefix: string;
  brandHighlight: string;
  brandLogoUrl: string;
  showBrandLogo: boolean;

  // Header Controls
  searchPlaceholder: string;
  sellButtonText: string;
  showHeaderCategories: boolean;
  showHeaderSearch: boolean;
  showHeaderLocalization: boolean;
  showHeaderSellButton: boolean;
  showHeaderNotifications: boolean;
  showCategoryIcons: boolean;

  // Hero Section Copy & Controls
  showHomeHeroSection: boolean;
  heroKicker: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroDescription: string;
  showHeroSellCta: boolean;
  heroSellCtaText: string;

  // Homepage Section Titles & Visibility
  showHomeCategoriesSection: boolean;
  homeCategoriesTitle: string;
  homeCategoriesSubtitle: string;
  showHomeGamesSection: boolean;
  homeGamesTitle: string;
  homeGamesSubtitle: string;
  showHomeListingsSection: boolean;
  homeListingsTitle: string;
  homeListingsSubtitle: string;
  showHomeEscrowSection: boolean;
  escrowSectionTitle: string;
  escrowSectionSubtitle: string;
  escrowSteps: EscrowStepItem[];

  // Global Banner & Maintenance Lock
  announcementEnabled: boolean;
  announcementBadge: string;
  announcementText: string;
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;

  // Commerce, Escrow Fees, Promos & Wallet Override
  platformFeePercent: number;
  minimumFeeUsd: number;
  defaultEscrowSeconds: number;
  allowNewListings: boolean;
  allowCheckout: boolean;
  enableLiveChat: boolean;
  promoCodes: PromoCodeConfig[];
  walletBalanceOverride: number | null;
  pendingEscrowOverride: number | null;

  // Footer & Trust Pillars
  showFooter: boolean;
  showFooterTrustStrip: boolean;
  trustPillars: TrustPillarItem[];
  footerTagline: string;
  paymentGateways: string[];

  // Custom Alerts & Theme / CSS Injection
  customNotifications: CustomNotificationItem[];
  accentColorHex: string;
  customCss: string;
}

export type SellerTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';

export interface Seller {
  id: string;
  username: string;
  avatar: string;
  level: number;
  tier: SellerTier;
  ratingPercentage: number;
  totalOrders: number;
  isOnline: boolean;
  responseTime: string;
  memberSince: string;
  positiveRatingCount: number;
  neutralRatingCount: number;
  negativeRatingCount: number;
}

export interface Review {
  id: string;
  maskedBuyer: string;
  rating: number; // 1-5
  date: string;
  comment: string;
  servicePurchased: string;
}

export interface Game {
  id: string;
  title: string;
  category: string;
  iconUrl?: string;
  posterBg: string;
  iconBg: string;
  activeListingsCount: number;
  popularServices: {
    name: ServiceVertical;
    count: number;
  }[];
  servers: string[];
  platforms: string[];
}

export interface Listing {
  id: string;
  title: string;
  gameId: string;
  gameTitle: string;
  serviceType: ServiceVertical;
  price: number;
  currency: string;
  stock: number;
  minPurchase: number;
  deliverySpeed: 'Instant' | '15 mins' | '1 hour' | '24 hours';
  deliveryMethod: 'Automated' | 'Manual Transfer' | 'Direct Top-Up';
  isFungible: boolean;
  seller: Seller;
  attributes: {
    region?: string;
    server?: string;
    platform?: string;
    rank?: string;
    accessType?: string;
    level?: string;
    skinsCount?: number;
    amountUnit?: string;
  };
  media: string[];
  specifications: Record<string, string>;
  description: string;
  warnings?: string[];
  reviews: Review[];
  denominations?: {
    id: string;
    label: string;
    amount: number;
    price: number;
    bonus?: string;
  }[];
}

export interface Order {
  id: string;
  listingId: string;
  listingTitle: string;
  gameTitle: string;
  serviceType: ServiceVertical;
  sellerUsername: string;
  sellerId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  fee: number;
  total: number;
  status: 'Preparing' | 'Delivered' | 'Completed' | 'Disputed' | 'Cancelled';
  deliveryInstructions: string;
  characterOrUid: string;
  createdAt: string;
  completedAt?: string;
  timerSecondsRemaining: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  text: string;
  timestamp: string;
  isSystemMilestone?: boolean;
  orderId?: string;
  milestoneTitle?: string;
}

export interface ChatConversation {
  id: string;
  orderId?: string;
  orderStatus?: string;
  timerRemaining?: string;
  withUser: {
    id: string;
    username: string;
    avatar: string;
    isOnline: boolean;
    role?: 'Buyer' | 'Seller';
    level?: number;
  };
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  status?: 'Preparing' | 'Delivered' | 'Completed' | 'Inquiry';
  messages: ChatMessage[];
}

export interface LocalizationConfig {
  region: string;
  regionCode: string;
  language: string;
  langCode?: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number; // relative to USD
}
