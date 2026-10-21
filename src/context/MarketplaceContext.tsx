import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  isStaticGitHubPagesHost,
  OperationType,
} from '../lib/firebase';
import {
  PageType,
  Game,
  Listing,
  Review,
  ServiceVertical,
  ServiceCategoryItem,
  SiteConfig,
  LocalizationConfig,
  Order,
  ChatConversation,
  Seller,
  SellerApplication,
  SellerApplicationStatus,
} from '../types/marketplace';
import {
  TRENDING_GAMES,
  SERVICE_VERTICALS,
  createAvatarSvg,
  createProductSvg,
} from '../data/marketplaceData';
import { sanitizeListingPayload } from '../utils/marketplace';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isLocalSession?: boolean;
}

const LS_LISTINGS_KEY = 'beatrix_gl_listings_v1';
const LS_ORDERS_KEY = 'beatrix_gl_orders_v1';
const LS_CONVS_KEY = 'beatrix_gl_conversations_v1';
const LS_USER_KEY = 'beatrix_gl_user_v1';
const LS_VISITOR_ID_KEY = 'beatrix_gl_visitor_id_v1';
const LS_SELLER_APPS_KEY = 'beatrix_gl_seller_apps_v1';
const LS_SITE_CONFIG_KEY = 'beatrix_gl_site_config_v3';
const LS_GAMES_KEY = 'beatrix_gl_games_v3';
const LS_CATEGORIES_KEY = 'beatrix_gl_categories_v3';
const LS_LOCALIZATION_KEY = 'beatrix_gl_localization_v1';
const SS_ADMIN_AUTH_KEY = 'beatrix_gl_admin_unlocked_v1';

export const ADMIN_MASTER_PASSWORD = 'adminbeatrix8825priyam';

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteTitle: 'Beatrix.gl',
  faviconUrl: '',
  brandPrefix: 'Beatrix',
  brandHighlight: '.gl',
  brandLogoUrl: '',
  showBrandLogo: true,

  searchPlaceholder: 'Search games, coins, accounts...',
  sellButtonText: 'Sell',
  showHeaderCategories: true,
  showHeaderSearch: true,
  showHeaderLocalization: true,
  showHeaderSellButton: true,
  showHeaderNotifications: true,
  showCategoryIcons: true,

  showHomeHeroSection: true,
  heroKicker: 'Beatrix.gl Escrow Protected',
  heroTitlePrefix: 'Welcome to',
  heroTitleHighlight: 'Beatrix.gl',
  heroDescription: '',
  showHeroSellCta: true,
  heroSellCtaText: 'Sell',

  showHomeCategoriesSection: true,
  homeCategoriesTitle: 'Categories',
  homeCategoriesSubtitle: '',
  showHomeGamesSection: true,
  homeGamesTitle: 'Games',
  homeGamesSubtitle: '',
  showHomeListingsSection: true,
  homeListingsTitle: 'Marketplace Listings',
  homeListingsSubtitle: '',
  showHomeEscrowSection: false,
  escrowSectionTitle: 'Beatrix.gl Escrow Protection',
  escrowSectionSubtitle:
    'Funds are held safely in escrow and only disbursed after you verify delivery.',
  escrowSteps: [
    {
      step: 'STEP 01',
      title: 'Lock Payment',
      subtitle: 'Checkout via Wallet or Card',
    },
    {
      step: 'STEP 02',
      title: 'Receive in Game',
      subtitle: 'Chat & coordinate transfer',
    },
    {
      step: 'STEP 03',
      title: 'Confirm & Release',
      subtitle: 'Seller gets paid post-verification',
    },
  ],

  announcementEnabled: false,
  announcementBadge: 'UPDATE',
  announcementText: 'Welcome to Beatrix.gl official marketplace.',
  maintenanceMode: false,
  maintenanceTitle: 'Scheduled Platform Maintenance',
  maintenanceMessage:
    'Beatrix.gl is currently undergoing scheduled maintenance. Please check back shortly.',

  platformFeePercent: 2.9,
  minimumFeeUsd: 1.25,
  defaultEscrowSeconds: 3600,
  allowNewListings: true,
  allowCheckout: true,
  enableLiveChat: true,
  promoCodes: [
    {
      code: 'BEATRIX10',
      discountPercent: 10,
      description: 'Official 10% Beatrix.gl Discount',
      active: true,
    },
  ],
  walletBalanceOverride: null,
  pendingEscrowOverride: null,

  showFooter: true,
  showFooterTrustStrip: false,
  trustPillars: [
    {
      title: 'Beatrix.gl Escrow',
      description: 'Sellers are paid only after you inspect and confirm delivery.',
    },
    {
      title: '256-Bit SSL Security',
      description: 'Encrypted checkout with buyer protection.',
    },
  ],
  footerTagline: 'Payment Gateways:',
  paymentGateways: ['UPI', 'VISA', 'Mastercard', 'PayPal', 'Crypto'],

  customNotifications: [],
  accentColorHex: '#38BDF8',
  customCss: '',
};

function readLocalJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors
  }
}

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'visitor_default';
  try {
    const existing = localStorage.getItem(LS_VISITOR_ID_KEY);
    if (existing) return existing;
    const created = `buyer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    localStorage.setItem(LS_VISITOR_ID_KEY, created);
    return created;
  } catch {
    return 'visitor_default';
  }
}

function resolvePageFromHash(hashStr: string): PageType | null {
  const normalized = hashStr.replace(/^#\/?/, '').trim().toLowerCase();
  if (normalized === 'admin' || normalized.startsWith('admin/')) {
    return 'admin';
  }
  if (
    normalized === 'seller' ||
    normalized.startsWith('seller/') ||
    normalized === 'dashboard'
  ) {
    return 'dashboard';
  }
  if (
    normalized === 'profile' ||
    normalized === 'buyer' ||
    normalized === 'buyer_profile'
  ) {
    return 'buyer_profile';
  }
  if (normalized === 'marketplace') return 'marketplace';
  if (normalized === 'game_hub' || normalized === 'game') return 'game_hub';
  if (normalized === 'listing_detail' || normalized === 'listing') return 'listing_detail';
  if (normalized === 'checkout') return 'checkout';
  if (normalized === 'chat') return 'chat';
  if (normalized === '' || normalized === 'home') return 'home';
  return null;
}

function pageToHash(page: PageType): string {
  switch (page) {
    case 'admin':
      return '#/admin';
    case 'dashboard':
      return '#/seller';
    case 'buyer_profile':
      return '#/profile';
    case 'marketplace':
      return '#/marketplace';
    case 'game_hub':
      return '#/game';
    case 'listing_detail':
      return '#/listing';
    case 'checkout':
      return '#/checkout';
    case 'chat':
      return '#/chat';
    case 'home':
    default:
      return '#/';
  }
}

interface MarketplaceContextType {
  // Auth & Firebase
  currentUser: User | AppUser | null;
  visitorId: string;
  authReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearFirebaseData: () => Promise<number>;

  // Admin Password Protection
  isAdminAuthenticated: boolean;
  authenticateAdmin: (password: string) => boolean;
  logoutAdmin: () => void;

  // Seller KYC & Admin Authorization
  sellerApplications: SellerApplication[];
  currentSellerApplication: SellerApplication | null;
  isApprovedSeller: boolean;
  submitSellerApplication: (payload: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    aadhaarNumber: string;
    aadhaarImageUrl: string;
    payoutDetails: string;
  }) => void;
  adminUpdateSellerApplicationStatus: (
    appId: string,
    status: SellerApplicationStatus,
    adminNote?: string
  ) => void;
  adminDeleteSellerApplication: (appId: string) => void;

  // Navigation & Routing
  currentPage: PageType;
  navigateTo: (
    page: PageType,
    params?: { gameId?: string; listingId?: string; category?: ServiceVertical }
  ) => void;
  selectedGame: Game | null;
  selectedCategory: ServiceVertical | 'All';
  selectedListing: Listing | null;
  setSelectedCategory: (cat: ServiceVertical | 'All') => void;
  setSelectedGame: (game: Game | null) => void;

  // Dynamic Site Config, Games & Categories (Admin God-Mode controlled)
  siteConfig: SiteConfig;
  updateSiteConfig: (updates: Partial<SiteConfig>) => void;
  resetSiteConfig: () => void;
  games: Game[];
  addGame: (newGame: Game) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  reorderGame: (id: string, direction: 'up' | 'down') => void;
  resetGames: () => void;
  serviceCategories: ServiceCategoryItem[];
  addServiceCategory: (name: string, icon?: string, iconUrl?: string) => void;
  updateServiceCategory: (oldName: string, updates: Partial<ServiceCategoryItem>) => void;
  reorderServiceCategory: (name: string, direction: 'up' | 'down') => void;
  deleteServiceCategory: (name: string) => void;
  resetServiceCategories: () => void;

  // Search & Filters
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  searchDropdownOpen: boolean;
  setSearchDropdownOpen: (open: boolean) => void;
  megaMenuOpen: boolean;
  setMegaMenuOpen: (open: boolean) => void;

  // Theme & Localization
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  localization: LocalizationConfig;
  updateLocalization: (config: Partial<LocalizationConfig>) => void;
  localizationModalOpen: boolean;
  setLocalizationModalOpen: (open: boolean) => void;
  formatCurrency: (usdAmount: number) => string;

  // Listings & Marketplace state
  listings: Listing[];
  addListing: (
    newListing: Omit<Listing, 'id' | 'seller'>,
    customSeller?: Partial<Seller>
  ) => Promise<void>;
  updateListingInline: (id: string, updates: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  duplicateListing: (id: string) => void;
  bulkAdjustListingPrices: (percentDelta: number) => void;
  addListingReview: (listingId: string, review: Omit<Review, 'id'>) => void;
  deleteListingReview: (listingId: string, reviewId: string) => void;
  clearAllListings: () => Promise<void>;
  getCategoryCount: (category: ServiceVertical | string) => number;
  getGameCount: (gameId: string) => number;
  getGameServiceCount: (gameId: string, category: ServiceVertical | string) => number;

  // Orders, Wallet & Checkout
  orders: Order[];
  availableBalance: number;
  pendingEscrowBalance: number;
  activeCheckoutListing: Listing | null;
  checkoutQuantity: number;
  checkoutCharacterId: string;
  setCheckoutQuantity: (qty: number) => void;
  setCheckoutCharacterId: (id: string) => void;
  initiateCheckout: (listing: Listing, qty?: number, charId?: string) => void;
  completeCheckout: (paymentMethod: string) => Promise<Order>;
  confirmOrderReceived: (orderId: string) => void;
  raiseDispute: (orderId: string) => void;
  adminCreateOrder: (manualOrder: Omit<Order, 'id' | 'createdAt'>) => void;
  adminUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  adminDeleteOrder: (orderId: string) => void;
  clearAllOrders: () => void;

  // Chat Drawer & Workspace
  chatDrawerOpen: boolean;
  setChatDrawerOpen: (open: boolean) => void;
  activeChatConvId: string;
  setActiveChatConvId: (id: string) => void;
  conversations: ChatConversation[];
  unreadChatCount: number;
  sendChatMessage: (convId: string, text: string) => void;
  openChatForSeller: (sellerId: string, orderId?: string) => void;
  adminCreateConversation: (
    username: string,
    orderId?: string,
    initialMsg?: string
  ) => void;
  adminSendSystemMessage: (
    convId: string,
    text: string,
    milestoneTitle?: string,
    senderRole?: 'system' | 'seller' | 'buyer'
  ) => void;
  adminDeleteMessage: (convId: string, msgId: string) => void;
  adminDeleteConversation: (convId: string) => void;

  // Notifications
  unreadNotificationsCount: number;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;

  // Full Snapshot Export / Import
  exportSiteSnapshot: () => string;
  importSiteSnapshot: (jsonStr: string) => boolean;
}

const DEFAULT_LOCALIZATION: LocalizationConfig = {
  region: 'United States',
  regionCode: 'US',
  language: 'English',
  currency: 'USD',
  currencySymbol: '$',
  exchangeRate: 1.0,
};

function buildSellerFromUser(
  sellerId: string,
  sellerName: string,
  photoUrl?: string | null,
  overrides?: Partial<Seller>
): Seller {
  const initials = sellerName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return {
    id: sellerId,
    username: sellerName,
    avatar: photoUrl || createAvatarSvg(initials || 'BG', '#0284C7', '#38BDF8'),
    level: 1,
    tier: 'Bronze',
    ratingPercentage: 100,
    totalOrders: 0,
    isOnline: true,
    responseTime: 'Instant',
    memberSince: new Date().getFullYear().toString(),
    positiveRatingCount: 0,
    neutralRatingCount: 0,
    negativeRatingCount: 0,
    ...overrides,
  };
}

function mapFirestoreDocToListing(
  id: string,
  data: Record<string, any>,
  gamesCatalog: Game[]
): Listing {
  const gameTitle = String(data.game || 'General');
  const matchedGame = gamesCatalog.find(
    (g) => g.title.toLowerCase() === gameTitle.toLowerCase() || g.id === gameTitle.toLowerCase()
  );
  const resolvedGameId =
    matchedGame?.id || gameTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'general';
  const resolvedGameTitle = matchedGame?.title || gameTitle;

  const rawCategory = String(data.category || 'Game Accounts');
  const serviceType: ServiceVertical =
    rawCategory === 'In-Game Currency'
      ? 'Game Coins'
      : (rawCategory as ServiceVertical);

  const sellerId = String(data.sellerId || 'seller');
  const sellerName = String(data.sellerName || 'Verified Seller');
  const deliveryTime = String(data.deliveryTime || 'Instant');
  const deliverySpeed: Listing['deliverySpeed'] =
    deliveryTime === '15 mins' || deliveryTime === '1 hour' || deliveryTime === '24 hours'
      ? deliveryTime
      : 'Instant';

  const price = Number(data.price) || 0;
  const title = String(data.title || 'Gaming Offer');

  return {
    id,
    title,
    gameId: resolvedGameId,
    gameTitle: resolvedGameTitle,
    serviceType,
    price,
    currency: 'USD',
    stock: 1,
    minPurchase: 1,
    deliverySpeed,
    deliveryMethod: deliverySpeed === 'Instant' ? 'Automated' : 'Manual Transfer',
    isFungible:
      serviceType === 'Game Coins' ||
      serviceType === 'Top Up' ||
      serviceType === 'Gift Cards',
    seller: buildSellerFromUser(sellerId, sellerName),
    attributes: {
      region: 'Global',
      platform: matchedGame?.platforms?.[0] || 'PC',
    },
    media: [
      createProductSvg(
        resolvedGameTitle,
        title,
        `${serviceType} · ${deliverySpeed} Delivery`,
        '#FFFFFF',
        '#F0F9FF',
        '#0284C7',
        'VERIFIED OFFER'
      ),
    ],
    specifications: {
      Game: resolvedGameTitle,
      Category: serviceType,
      'Delivery Speed': deliverySpeed,
      Seller: sellerName,
    },
    description: `${title} — Listed by ${sellerName} under Beatrix.gl escrow.`,
    reviews: [],
  };
}

function mapFirestoreDocToOrder(id: string, data: Record<string, any>): Order {
  const price = Number(data.price) || 0;
  const fee = Math.max(1.25, Math.round(price * 0.029 * 100) / 100);
  const createdDate =
    data.createdAt && typeof data.createdAt.toDate === 'function'
      ? data.createdAt.toDate().toLocaleString()
      : new Date().toLocaleString();

  return {
    id,
    listingId: String(data.listingId || ''),
    listingTitle: String(data.listingTitle || 'Marketplace Order'),
    gameTitle: String(data.game || 'Game'),
    serviceType: 'Game Accounts',
    sellerUsername: String(data.sellerId || 'Seller'),
    sellerId: String(data.sellerId || ''),
    quantity: 1,
    unitPrice: price,
    subtotal: price,
    fee,
    total: price + fee,
    status: 'Completed',
    deliveryInstructions: 'Protected by Beatrix.gl Escrow.',
    characterOrUid: String(data.buyerId || ''),
    createdAt: createdDate,
    completedAt: createdDate,
    timerSecondsRemaining: 0,
  };
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitorId] = useState<string>(() => getOrCreateVisitorId());

  const [currentUser, setCurrentUser] = useState<User | AppUser | null>(() =>
    readLocalJson<AppUser | null>(LS_USER_KEY, null)
  );
  const [authReady, setAuthReady] = useState(false);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(SS_ADMIN_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [sellerApplications, setSellerApplications] = useState<SellerApplication[]>(() =>
    readLocalJson<SellerApplication[]>(LS_SELLER_APPS_KEY, [])
  );

  // Initialize currentPage directly from URL hash (#/admin -> admin, #/seller -> dashboard, #/profile -> buyer_profile)
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    if (typeof window !== 'undefined') {
      const fromHash = resolvePageFromHash(window.location.hash);
      if (fromHash) return fromHash;
    }
    return 'home';
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = readLocalJson<Partial<SiteConfig>>(LS_SITE_CONFIG_KEY, {});
    const merged: SiteConfig = {
      ...DEFAULT_SITE_CONFIG,
      ...saved,
    };
    // Ensure old Polarith Gamerz branding is migrated to Beatrix.gl
    if (
      merged.brandPrefix?.toLowerCase().includes('polarith') ||
      merged.brandPrefix?.toLowerCase().includes('poratith')
    ) {
      merged.brandPrefix = 'Beatrix';
      merged.brandHighlight = '.gl';
      merged.siteTitle = 'Beatrix.gl';
    }
    if (merged.sellButtonText) {
      merged.sellButtonText = merged.sellButtonText.replace(/^\+\s*/, '').trim() || 'Sell';
    }
    if (merged.heroSellCtaText) {
      merged.heroSellCtaText = merged.heroSellCtaText.replace(/^\+\s*/, '').trim() || 'Sell';
    }
    return merged;
  });

  const [games, setGames] = useState<Game[]>(() =>
    readLocalJson<Game[]>(LS_GAMES_KEY, TRENDING_GAMES)
  );

  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryItem[]>(() =>
    readLocalJson<ServiceCategoryItem[]>(
      LS_CATEGORIES_KEY,
      SERVICE_VERTICALS.map((v) => ({ name: v.name, icon: v.icon }))
    )
  );

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceVertical | 'All'>('All');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [localization, setLocalization] = useState<LocalizationConfig>(() =>
    readLocalJson<LocalizationConfig>(LS_LOCALIZATION_KEY, DEFAULT_LOCALIZATION)
  );
  const [localizationModalOpen, setLocalizationModalOpen] = useState(false);

  const [listings, setListings] = useState<Listing[]>(() =>
    readLocalJson<Listing[]>(LS_LISTINGS_KEY, [])
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    readLocalJson<Order[]>(LS_ORDERS_KEY, [])
  );
  const [conversations, setConversations] = useState<ChatConversation[]>(() =>
    readLocalJson<ChatConversation[]>(LS_CONVS_KEY, [])
  );

  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [activeChatConvId, setActiveChatConvId] = useState<string>('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Checkout flow state
  const [activeCheckoutListing, setActiveCheckoutListing] = useState<Listing | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [checkoutCharacterId, setCheckoutCharacterId] = useState('');

  // Listen to browser hashchange so /#/admin, /#/seller, and /#/profile always open their portals
  useEffect(() => {
    const handleHashChange = () => {
      const targetPage = resolvePageFromHash(window.location.hash);
      if (targetPage) {
        setCurrentPage(targetPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync sellerApplications across browser tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LS_SELLER_APPS_KEY && e.newValue) {
        try {
          setSellerApplications(JSON.parse(e.newValue));
        } catch {
          // Ignore parse error
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Dynamically apply siteTitle, faviconUrl, and customCss to the document
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (siteConfig.siteTitle) {
      document.title = siteConfig.siteTitle;
    }
    if (siteConfig.faviconUrl && siteConfig.faviconUrl.trim()) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = siteConfig.faviconUrl.trim();
    }

    let styleEl = document.getElementById('beatrix-god-css') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'beatrix-god-css';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = siteConfig.customCss || '';
  }, [
    siteConfig.siteTitle,
    siteConfig.faviconUrl,
    siteConfig.accentColorHex,
    siteConfig.customCss,
  ]);

  // Persist state to localStorage
  useEffect(() => {
    writeLocalJson(LS_LISTINGS_KEY, listings);
  }, [listings]);

  useEffect(() => {
    writeLocalJson(LS_ORDERS_KEY, orders);
  }, [orders]);

  useEffect(() => {
    writeLocalJson(LS_CONVS_KEY, conversations);
  }, [conversations]);

  useEffect(() => {
    writeLocalJson(LS_SELLER_APPS_KEY, sellerApplications);
  }, [sellerApplications]);

  useEffect(() => {
    writeLocalJson(LS_SITE_CONFIG_KEY, siteConfig);
  }, [siteConfig]);

  useEffect(() => {
    writeLocalJson(LS_GAMES_KEY, games);
  }, [games]);

  useEffect(() => {
    writeLocalJson(LS_CATEGORIES_KEY, serviceCategories);
  }, [serviceCategories]);

  useEffect(() => {
    writeLocalJson(LS_LOCALIZATION_KEY, localization);
  }, [localization]);

  // Strictly enforce light theme across document
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, [theme]);

  // Listen to Firebase Auth state alongside local static session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setCurrentUser(fbUser);
      } else {
        const storedLocal = readLocalJson<AppUser | null>(LS_USER_KEY, null);
        setCurrentUser(storedLocal);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Admin Password Authentication ("adminbeatrix8825priyam")
  const authenticateAdmin = (password: string): boolean => {
    if (password === ADMIN_MASTER_PASSWORD) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem(SS_ADMIN_AUTH_KEY, 'true');
      } catch {
        // Ignore storage error
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem(SS_ADMIN_AUTH_KEY);
    } catch {
      // Ignore storage error
    }
  };

  // Current user/visitor's seller application
  const activeIdentityUid = currentUser?.uid || visitorId;
  const currentSellerApplication =
    sellerApplications.find(
      (app) =>
        app.applicantUid === activeIdentityUid ||
        app.applicantUid === visitorId ||
        (currentUser?.email &&
          app.email.toLowerCase() === currentUser.email.toLowerCase())
    ) || null;

  const isApprovedSeller = currentSellerApplication?.status === 'approved';

  const submitSellerApplication = (payload: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    aadhaarNumber: string;
    aadhaarImageUrl: string;
    payoutDetails: string;
  }) => {
    const nowStr = new Date().toLocaleString();
    const newApp: SellerApplication = {
      id: `kyc_${Date.now()}`,
      applicantUid: activeIdentityUid,
      fullName: payload.fullName.trim(),
      username: payload.username.trim() || payload.fullName.trim().split(' ')[0] || 'Seller',
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      aadhaarNumber: payload.aadhaarNumber.trim(),
      aadhaarImageUrl: payload.aadhaarImageUrl,
      payoutDetails: payload.payoutDetails.trim(),
      status: 'pending',
      submittedAt: nowStr,
    };

    setSellerApplications((prev) => {
      const filtered = prev.filter(
        (a) =>
          a.applicantUid !== activeIdentityUid &&
          a.applicantUid !== visitorId
      );
      return [newApp, ...filtered];
    });
  };

  const adminUpdateSellerApplicationStatus = (
    appId: string,
    status: SellerApplicationStatus,
    adminNote?: string
  ) => {
    const reviewedAt = new Date().toLocaleString();
    setSellerApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              status,
              reviewedAt,
              adminNote: adminNote !== undefined ? adminNote : app.adminNote,
            }
          : app
      )
    );
  };

  const adminDeleteSellerApplication = (appId: string) => {
    setSellerApplications((prev) => prev.filter((app) => app.id !== appId));
  };

  const clearFirebaseData = useCallback(async (): Promise<number> => {
    let deletedCount = listings.length + orders.length;
    setListings([]);
    setOrders([]);
    setConversations([]);
    setSelectedListing(null);
    setActiveCheckoutListing(null);
    writeLocalJson(LS_LISTINGS_KEY, []);
    writeLocalJson(LS_ORDERS_KEY, []);
    writeLocalJson(LS_CONVS_KEY, []);

    if (!auth.currentUser || isStaticGitHubPagesHost()) {
      return deletedCount;
    }

    const uid = auth.currentUser.uid;

    try {
      const ownListingsQuery = query(
        collection(db, 'listings'),
        where('sellerId', '==', uid)
      );
      const listingSnap = await getDocs(ownListingsQuery);
      for (const docSnap of listingSnap.docs) {
        await deleteDoc(doc(db, 'listings', docSnap.id));
        deletedCount++;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'listings');
    }

    try {
      const buyerOrdersQuery = query(
        collection(db, 'orders'),
        where('buyerId', '==', uid)
      );
      const buyerSnap = await getDocs(buyerOrdersQuery);
      for (const docSnap of buyerSnap.docs) {
        await deleteDoc(doc(db, 'orders', docSnap.id));
        deletedCount++;
      }

      const sellerOrdersQuery = query(
        collection(db, 'orders'),
        where('sellerId', '==', uid)
      );
      const sellerSnap = await getDocs(sellerOrdersQuery);
      for (const docSnap of sellerSnap.docs) {
        await deleteDoc(doc(db, 'orders', docSnap.id));
        deletedCount++;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'orders');
    }

    return deletedCount;
  }, [listings.length, orders.length]);

  // Attach real-time Firestore listeners only when a real Firebase Auth user is active
  useEffect(() => {
    if (!authReady || !auth.currentUser || isStaticGitHubPagesHost()) {
      return;
    }

    const fbUid = auth.currentUser.uid;
    let unsubscribeListings: (() => void) | undefined;
    let unsubscribeBuyerOrders: (() => void) | undefined;
    let unsubscribeSellerOrders: (() => void) | undefined;
    let cancelled = false;

    const initFirestoreSync = async () => {
      const cleanupKey = `beatrix_firebase_cleaned_v1_${fbUid}`;
      if (!localStorage.getItem(cleanupKey)) {
        try {
          await clearFirebaseData();
          localStorage.setItem(cleanupKey, 'true');
        } catch {
          // Ignore if already clean
        }
      }

      if (cancelled) return;

      const listingsQuery = query(
        collection(db, 'listings'),
        where('status', '==', 'active')
      );

      unsubscribeListings = onSnapshot(
        listingsQuery,
        (snapshot) => {
          const loaded = snapshot.docs.map((docSnap) =>
            mapFirestoreDocToListing(docSnap.id, docSnap.data(), games)
          );
          setListings(loaded);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'listings');
        }
      );

      let buyerOrdersList: Order[] = [];
      let sellerOrdersList: Order[] = [];

      const mergeOrders = () => {
        const mergedMap = new Map<string, Order>();
        for (const o of [...buyerOrdersList, ...sellerOrdersList]) {
          mergedMap.set(o.id, o);
        }
        setOrders(Array.from(mergedMap.values()));
      };

      const buyerQuery = query(
        collection(db, 'orders'),
        where('buyerId', '==', fbUid)
      );

      unsubscribeBuyerOrders = onSnapshot(
        buyerQuery,
        (snapshot) => {
          buyerOrdersList = snapshot.docs.map((docSnap) =>
            mapFirestoreDocToOrder(docSnap.id, docSnap.data())
          );
          mergeOrders();
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'orders');
        }
      );

      const sellerQuery = query(
        collection(db, 'orders'),
        where('sellerId', '==', fbUid)
      );

      unsubscribeSellerOrders = onSnapshot(
        sellerQuery,
        (snapshot) => {
          sellerOrdersList = snapshot.docs.map((docSnap) =>
            mapFirestoreDocToOrder(docSnap.id, docSnap.data())
          );
          mergeOrders();
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'orders');
        }
      );
    };

    initFirestoreSync();

    return () => {
      cancelled = true;
      if (unsubscribeListings) unsubscribeListings();
      if (unsubscribeBuyerOrders) unsubscribeBuyerOrders();
      if (unsubscribeSellerOrders) unsubscribeSellerOrders();
    };
  }, [authReady, clearFirebaseData, games]);

  const signInWithGoogle = async () => {
    const activateLocalSession = () => {
      const localProfile: AppUser = {
        uid: visitorId,
        displayName: 'Beatrix Buyer',
        email: 'buyer@beatrix.gl',
        photoURL: createAvatarSvg('BB', '#0284C7', '#38BDF8'),
        isLocalSession: true,
      };
      setCurrentUser(localProfile);
      writeLocalJson(LS_USER_KEY, localProfile);
    };

    if (isStaticGitHubPagesHost()) {
      activateLocalSession();
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      activateLocalSession();
    }
  };

  const signOutUser = async () => {
    writeLocalJson(LS_USER_KEY, null);
    setCurrentUser(null);
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch {
      // Ignore sign-out errors on static hosts
    }
  };

  // Site Config & Catalog Admin Actions
  const updateSiteConfig = (updates: Partial<SiteConfig>) => {
    setSiteConfig((prev) => ({ ...prev, ...updates }));
  };

  const resetSiteConfig = () => {
    setSiteConfig(DEFAULT_SITE_CONFIG);
    writeLocalJson(LS_SITE_CONFIG_KEY, DEFAULT_SITE_CONFIG);
  };

  const addGame = (newGame: Game) => {
    setGames((prev) => {
      const exists = prev.some((g) => g.id === newGame.id);
      if (exists) {
        return prev.map((g) => (g.id === newGame.id ? newGame : g));
      }
      return [...prev, newGame];
    });
  };

  const updateGame = (id: string, updates: Partial<Game>) => {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGame = (id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
    if (selectedGame?.id === id) {
      setSelectedGame(null);
    }
  };

  const reorderGame = (id: string, direction: 'up' | 'down') => {
    setGames((prev) => {
      const idx = prev.findIndex((g) => g.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
  };

  const resetGames = () => {
    setGames(TRENDING_GAMES);
    writeLocalJson(LS_GAMES_KEY, TRENDING_GAMES);
  };

  const addServiceCategory = (name: string, icon = 'Shield', iconUrl?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setServiceCategories((prev) => {
      if (prev.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      return [...prev, { name: trimmed, icon, iconUrl }];
    });
  };

  const updateServiceCategory = (
    oldName: string,
    updates: Partial<ServiceCategoryItem>
  ) => {
    setServiceCategories((prev) =>
      prev.map((c) => (c.name === oldName ? { ...c, ...updates } : c))
    );
  };

  const reorderServiceCategory = (name: string, direction: 'up' | 'down') => {
    setServiceCategories((prev) => {
      const idx = prev.findIndex((c) => c.name === name);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
  };

  const deleteServiceCategory = (name: string) => {
    setServiceCategories((prev) => prev.filter((c) => c.name !== name));
    if (selectedCategory === name) {
      setSelectedCategory('All');
    }
  };

  const resetServiceCategories = () => {
    const def = SERVICE_VERTICALS.map((v) => ({ name: v.name, icon: v.icon }));
    setServiceCategories(def);
    writeLocalJson(LS_CATEGORIES_KEY, def);
  };

  const toggleTheme = () => {
    setTheme('light');
  };

  const updateLocalization = (config: Partial<LocalizationConfig>) => {
    setLocalization((prev) => ({ ...prev, ...config }));
  };

  const formatCurrency = (usdAmount: number): string => {
    const converted = usdAmount * localization.exchangeRate;
    return `${localization.currencySymbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Dynamic real-time counts
  const getCategoryCount = useCallback(
    (category: ServiceVertical | string): number => {
      return listings.filter((l) => l.serviceType === category).length;
    },
    [listings]
  );

  const getGameCount = useCallback(
    (gameId: string): number => {
      return listings.filter((l) => l.gameId === gameId).length;
    },
    [listings]
  );

  const getGameServiceCount = useCallback(
    (gameId: string, category: ServiceVertical | string): number => {
      return listings.filter(
        (l) => l.gameId === gameId && l.serviceType === category
      ).length;
    },
    [listings]
  );

  // Dynamic wallet balances with optional Admin God-Mode Override
  const computedAvailableBalance = orders
    .filter((o) => o.status === 'Completed')
    .reduce((sum, o) => sum + o.subtotal, 0);

  const computedPendingEscrowBalance = orders
    .filter((o) => o.status === 'Preparing' || o.status === 'Delivered')
    .reduce((sum, o) => sum + o.subtotal, 0);

  const availableBalance =
    siteConfig.walletBalanceOverride !== null &&
    siteConfig.walletBalanceOverride !== undefined
      ? siteConfig.walletBalanceOverride
      : computedAvailableBalance;

  const pendingEscrowBalance =
    siteConfig.pendingEscrowOverride !== null &&
    siteConfig.pendingEscrowOverride !== undefined
      ? siteConfig.pendingEscrowOverride
      : computedPendingEscrowBalance;

  const unreadChatCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const unreadNotificationsCount =
    orders.filter((o) => o.status === 'Preparing' || o.status === 'Delivered').length +
    (siteConfig.customNotifications?.length || 0);

  const navigateTo = (
    page: PageType,
    params?: { gameId?: string; listingId?: string; category?: ServiceVertical }
  ) => {
    if (params?.gameId) {
      const foundGame = games.find((g) => g.id === params.gameId) || null;
      setSelectedGame(foundGame);
    }
    if (params?.listingId) {
      const foundListing = listings.find((l) => l.id === params.listingId) || null;
      setSelectedListing(foundListing);
    }
    if (params?.category) {
      setSelectedCategory(params.category);
    }
    setCurrentPage(page);
    setMegaMenuOpen(false);
    setSearchDropdownOpen(false);

    if (typeof window !== 'undefined') {
      const targetHash = pageToHash(page);
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const addListing = async (
    newListingData: Omit<Listing, 'id' | 'seller'>,
    customSeller?: Partial<Seller>
  ) => {
    const sellerId = customSeller?.id || currentUser?.uid || visitorId;
    const sellerName =
      customSeller?.username ||
      currentSellerApplication?.username ||
      currentUser?.displayName ||
      currentUser?.email?.split('@')[0] ||
      'Verified Seller';

    const seller = buildSellerFromUser(
      sellerId,
      sellerName,
      currentUser?.photoURL,
      customSeller
    );
    const listingId = `lst_${Date.now()}`;

    const media =
      newListingData.media && newListingData.media.length > 0
        ? newListingData.media
        : [
            createProductSvg(
              newListingData.gameTitle,
              newListingData.title,
              `${newListingData.serviceType} · ${newListingData.deliverySpeed} Delivery`,
              '#FFFFFF',
              '#F0F9FF',
              '#0284C7',
              'VERIFIED OFFER'
            ),
          ];

    const createdListing: Listing = {
      ...newListingData,
      id: listingId,
      seller,
      media,
    };

    setListings((prev) => [createdListing, ...prev]);

    if (auth.currentUser && !isStaticGitHubPagesHost() && !customSeller) {
      const sanitized = sanitizeListingPayload(
        {
          title: newListingData.title,
          game: newListingData.gameTitle,
          category: newListingData.serviceType,
          price: newListingData.price,
          deliveryTime: newListingData.deliverySpeed,
        },
        auth.currentUser.uid,
        sellerName,
        true
      );

      try {
        await setDoc(doc(db, 'listings', listingId), {
          ...sanitized,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `listings/${listingId}`);
      }
    }
  };

  const updateListingInline = async (id: string, updates: Partial<Listing>) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...updates };
        if (
          !updates.media &&
          (updates.title || updates.gameTitle || updates.serviceType || updates.deliverySpeed) &&
          item.media[0]?.startsWith('data:image/svg+xml')
        ) {
          merged.media = [
            createProductSvg(
              merged.gameTitle,
              merged.title,
              `${merged.serviceType} · ${merged.deliverySpeed} Delivery`,
              '#FFFFFF',
              '#F0F9FF',
              '#0284C7',
              'VERIFIED OFFER'
            ),
          ];
        }
        return merged;
      })
    );

    if (auth.currentUser && !isStaticGitHubPagesHost()) {
      const firestoreUpdates: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };
      if (typeof updates.price === 'number' && updates.price > 0) {
        firestoreUpdates.price = Math.min(10000, Math.round(updates.price * 100) / 100);
      }
      if (typeof updates.title === 'string' && updates.title.trim().length >= 3) {
        firestoreUpdates.title = updates.title.trim().slice(0, 120);
      }
      try {
        await updateDoc(doc(db, 'listings', id), firestoreUpdates);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `listings/${id}`);
      }
    }
  };

  const deleteListing = async (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    if (selectedListing?.id === id) {
      setSelectedListing(null);
    }
    if (auth.currentUser && !isStaticGitHubPagesHost()) {
      try {
        await deleteDoc(doc(db, 'listings', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `listings/${id}`);
      }
    }
  };

  const duplicateListing = (id: string) => {
    const found = listings.find((l) => l.id === id);
    if (!found) return;
    const copy: Listing = {
      ...found,
      id: `lst_${Date.now()}`,
      title: `${found.title} (Copy)`,
    };
    setListings((prev) => [copy, ...prev]);
  };

  const bulkAdjustListingPrices = (percentDelta: number) => {
    const multiplier = 1 + percentDelta / 100;
    setListings((prev) =>
      prev.map((item) => ({
        ...item,
        price: Math.max(0.5, Math.round(item.price * multiplier * 100) / 100),
      }))
    );
  };

  const addListingReview = (listingId: string, review: Omit<Review, 'id'>) => {
    const newRev: Review = {
      ...review,
      id: `rev_${Date.now()}`,
    };
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, reviews: [newRev, ...(l.reviews || [])] } : l
      )
    );
  };

  const deleteListingReview = (listingId: string, reviewId: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId
          ? { ...l, reviews: (l.reviews || []).filter((r) => r.id !== reviewId) }
          : l
      )
    );
  };

  const clearAllListings = async () => {
    setListings([]);
    setSelectedListing(null);
    writeLocalJson(LS_LISTINGS_KEY, []);
  };

  const initiateCheckout = (listing: Listing, qty = 1, charId = '') => {
    if (!siteConfig.allowCheckout) return;
    setActiveCheckoutListing(listing);
    setCheckoutQuantity(qty);
    setCheckoutCharacterId(charId);
    navigateTo('checkout');
  };

  const completeCheckout = async (paymentMethod: string): Promise<Order> => {
    if (!activeCheckoutListing) {
      throw new Error('No listing in checkout');
    }
    const unitPrice = activeCheckoutListing.price;
    const subtotal = unitPrice * checkoutQuantity;
    const feeRate = siteConfig.platformFeePercent / 100;
    const fee = Math.max(
      siteConfig.minimumFeeUsd,
      Math.round(subtotal * feeRate * 100) / 100
    );
    const total = subtotal + fee;
    const orderId = `ord_${Date.now()}`;

    const newOrder: Order = {
      id: orderId,
      listingId: activeCheckoutListing.id,
      listingTitle: activeCheckoutListing.title,
      gameTitle: activeCheckoutListing.gameTitle,
      serviceType: activeCheckoutListing.serviceType,
      sellerUsername: activeCheckoutListing.seller.username,
      sellerId: activeCheckoutListing.seller.id,
      quantity: checkoutQuantity,
      unitPrice,
      subtotal,
      fee,
      total,
      status: 'Preparing',
      deliveryInstructions: `Paid via ${paymentMethod}. Beatrix.gl escrow active.`,
      characterOrUid: checkoutCharacterId || currentUser?.email || 'Buyer_Account',
      createdAt: new Date().toLocaleString(),
      timerSecondsRemaining: siteConfig.defaultEscrowSeconds || 3600,
    };

    setOrders((prev) => [newOrder, ...prev]);

    if (
      auth.currentUser &&
      !isStaticGitHubPagesHost() &&
      activeCheckoutListing.seller.id &&
      activeCheckoutListing.seller.id !== auth.currentUser.uid
    ) {
      try {
        await setDoc(doc(db, 'orders', orderId), {
          listingId: activeCheckoutListing.id,
          listingTitle: activeCheckoutListing.title.slice(0, 120),
          game: activeCheckoutListing.gameTitle.slice(0, 60),
          price: unitPrice,
          buyerId: auth.currentUser.uid,
          sellerId: activeCheckoutListing.seller.id,
          status: 'completed',
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
      }
    }

    const newConv: ChatConversation = {
      id: `chat-conv-${Date.now()}`,
      orderId: newOrder.id,
      withUser: {
        id: activeCheckoutListing.seller.id,
        username: activeCheckoutListing.seller.username,
        avatar: activeCheckoutListing.seller.avatar,
        isOnline: activeCheckoutListing.seller.isOnline,
        role: 'Seller',
      },
      status: 'Preparing',
      lastMessage: `Order #${newOrder.id} confirmed. Waiting for seller delivery.`,
      lastTimestamp: 'Just now',
      unreadCount: 1,
      messages: [
        {
          id: `msg-sys-${Date.now()}`,
          senderId: 'system',
          senderName: 'Beatrix.gl Escrow',
          avatar: '',
          text: `Order #${newOrder.id} Paid (${formatCurrency(newOrder.total)}) — Funds held securely in escrow.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystemMilestone: true,
          orderId: newOrder.id,
          milestoneTitle: 'Escrow Activated',
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveChatConvId(newConv.id);

    return newOrder;
  };

  const confirmOrderReceived = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: 'Completed', completedAt: new Date().toLocaleString() }
          : ord
      )
    );
    setConversations((prev) =>
      prev.map((c) => {
        if (c.orderId === orderId) {
          return {
            ...c,
            status: 'Completed',
            messages: [
              ...c.messages,
              {
                id: `msg-sys-${Date.now()}`,
                senderId: 'system',
                senderName: 'Beatrix.gl Escrow',
                avatar: '',
                text: `Buyer has confirmed delivery! Escrow payment released to seller. Order #${orderId} marked Completed.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystemMilestone: true,
                orderId,
                milestoneTitle: 'Order Completed & Escrow Released',
              },
            ],
          };
        }
        return c;
      })
    );
  };

  const raiseDispute = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId ? { ...ord, status: 'Disputed' } : ord
      )
    );
    setConversations((prev) =>
      prev.map((c) => {
        if (c.orderId === orderId) {
          return {
            ...c,
            messages: [
              ...c.messages,
              {
                id: `msg-sys-${Date.now()}`,
                senderId: 'system',
                senderName: 'Beatrix.gl Dispute Resolution',
                avatar: '',
                text: `Dispute raised on Order #${orderId}. A Beatrix.gl mediator has been assigned to review trade proofs. Escrow remains locked.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystemMilestone: true,
                orderId,
                milestoneTitle: 'Dispute Investigation Opened',
              },
            ],
          };
        }
        return c;
      })
    );
  };

  const adminCreateOrder = (manualOrder: Omit<Order, 'id' | 'createdAt'>) => {
    const created: Order = {
      ...manualOrder,
      id: `ord_${Date.now()}`,
      createdAt: new Date().toLocaleString(),
    };
    setOrders((prev) => [created, ...prev]);
  };

  const adminUpdateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, ...updates } : ord))
    );
  };

  const adminDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
  };

  const clearAllOrders = () => {
    setOrders([]);
    writeLocalJson(LS_ORDERS_KEY, []);
  };

  const sendChatMessage = (convId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: 'buyer',
      senderName: currentUser?.displayName || 'You',
      avatar: currentUser?.photoURL || '',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            unreadCount: 0,
            lastMessage: text.trim(),
            lastTimestamp: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );
  };

  const adminCreateConversation = (
    username: string,
    orderId?: string,
    initialMsg = 'Encrypted trade room initialized by Admin.'
  ) => {
    const cleanUser = username.trim() || 'Verified Trader';
    const newConv: ChatConversation = {
      id: `chat-conv-${Date.now()}`,
      orderId: orderId?.trim() || undefined,
      withUser: {
        id: `user_${Date.now()}`,
        username: cleanUser,
        avatar: createAvatarSvg(cleanUser.slice(0, 2), '#0284C7', '#38BDF8'),
        isOnline: true,
        role: 'Seller',
      },
      status: 'Preparing',
      lastMessage: initialMsg,
      lastTimestamp: 'Just now',
      unreadCount: 1,
      messages: [
        {
          id: `msg-sys-${Date.now()}`,
          senderId: 'system',
          senderName: 'Beatrix.gl Admin',
          avatar: '',
          text: initialMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystemMilestone: true,
          milestoneTitle: 'Admin Trade Channel',
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveChatConvId(newConv.id);
  };

  const adminSendSystemMessage = (
    convId: string,
    text: string,
    milestoneTitle = 'Admin Escrow Notice',
    senderRole: 'system' | 'seller' | 'buyer' = 'system'
  ) => {
    if (!text.trim()) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const senderName =
          senderRole === 'system'
            ? 'Beatrix.gl Admin'
            : senderRole === 'seller'
            ? c.withUser.username
            : 'Buyer';
        const sysMsg = {
          id: `msg-admin-${Date.now()}`,
          senderId: senderRole,
          senderName,
          avatar: senderRole === 'seller' ? c.withUser.avatar : '',
          text: text.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystemMilestone: senderRole === 'system',
          milestoneTitle: senderRole === 'system' ? milestoneTitle : undefined,
        };
        return {
          ...c,
          lastMessage:
            senderRole === 'system' ? `[Admin] ${text.trim()}` : text.trim(),
          lastTimestamp: 'Just now',
          messages: [...c.messages, sysMsg],
        };
      })
    );
  };

  const adminDeleteMessage = (convId: string, msgId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: c.messages.filter((m) => m.id !== msgId) }
          : c
      )
    );
  };

  const adminDeleteConversation = (convId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeChatConvId === convId) {
      setActiveChatConvId('');
    }
  };

  const openChatForSeller = (sellerId: string, orderId?: string) => {
    if (!siteConfig.enableLiveChat) return;
    const existingConv = conversations.find((c) => c.withUser.id === sellerId);
    if (!existingConv) {
      const matchedListing = listings.find((l) => l.seller.id === sellerId);
      const seller =
        matchedListing?.seller ||
        buildSellerFromUser(sellerId, 'Verified Seller');

      const newConv: ChatConversation = {
        id: `chat-conv-${Date.now()}`,
        orderId,
        withUser: {
          id: seller.id,
          username: seller.username,
          avatar: seller.avatar,
          isOnline: seller.isOnline,
          role: 'Seller',
        },
        status: orderId ? 'Preparing' : 'Inquiry',
        lastMessage: 'Chat opened with seller.',
        lastTimestamp: 'Just now',
        unreadCount: 0,
        messages: [
          {
            id: `msg-sys-${Date.now()}`,
            senderId: 'system',
            senderName: 'Beatrix.gl Chat Security',
            avatar: '',
            text: 'Safety Advisory: Never share personal login credentials or complete payments outside Beatrix.gl Chat.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystemMilestone: true,
            milestoneTitle: 'Encrypted Chat Session Active',
          },
        ],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveChatConvId(newConv.id);
    } else {
      setActiveChatConvId(existingConv.id);
    }
    setChatDrawerOpen(true);
  };

  const exportSiteSnapshot = (): string => {
    return JSON.stringify(
      {
        version: 3,
        exportedAt: new Date().toISOString(),
        siteConfig,
        localization,
        games,
        serviceCategories,
        sellerApplications,
        listings,
        orders,
        conversations,
      },
      null,
      2
    );
  };

  const importSiteSnapshot = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.siteConfig) {
        setSiteConfig({ ...DEFAULT_SITE_CONFIG, ...parsed.siteConfig });
      }
      if (parsed.localization) {
        setLocalization(parsed.localization);
      }
      if (Array.isArray(parsed.games)) {
        setGames(parsed.games);
      }
      if (Array.isArray(parsed.serviceCategories)) {
        setServiceCategories(parsed.serviceCategories);
      }
      if (Array.isArray(parsed.sellerApplications)) {
        setSellerApplications(parsed.sellerApplications);
      }
      if (Array.isArray(parsed.listings)) {
        setListings(parsed.listings);
      }
      if (Array.isArray(parsed.orders)) {
        setOrders(parsed.orders);
      }
      if (Array.isArray(parsed.conversations)) {
        setConversations(parsed.conversations);
      }
      return true;
    } catch {
      return false;
    }
  };

  return (
    <MarketplaceContext.Provider
      value={{
        currentUser,
        visitorId,
        authReady,
        signInWithGoogle,
        signOutUser,
        clearFirebaseData,
        isAdminAuthenticated,
        authenticateAdmin,
        logoutAdmin,
        sellerApplications,
        currentSellerApplication,
        isApprovedSeller,
        submitSellerApplication,
        adminUpdateSellerApplicationStatus,
        adminDeleteSellerApplication,
        currentPage,
        navigateTo,
        selectedGame,
        selectedCategory,
        selectedListing,
        setSelectedCategory,
        setSelectedGame,
        siteConfig,
        updateSiteConfig,
        resetSiteConfig,
        games,
        addGame,
        updateGame,
        deleteGame,
        reorderGame,
        resetGames,
        serviceCategories,
        addServiceCategory,
        updateServiceCategory,
        reorderServiceCategory,
        deleteServiceCategory,
        resetServiceCategories,
        globalSearchQuery,
        setGlobalSearchQuery,
        searchDropdownOpen,
        setSearchDropdownOpen,
        megaMenuOpen,
        setMegaMenuOpen,
        theme,
        toggleTheme,
        localization,
        updateLocalization,
        localizationModalOpen,
        setLocalizationModalOpen,
        formatCurrency,
        listings,
        addListing,
        updateListingInline,
        deleteListing,
        duplicateListing,
        bulkAdjustListingPrices,
        addListingReview,
        deleteListingReview,
        clearAllListings,
        getCategoryCount,
        getGameCount,
        getGameServiceCount,
        orders,
        availableBalance,
        pendingEscrowBalance,
        activeCheckoutListing,
        checkoutQuantity,
        checkoutCharacterId,
        setCheckoutQuantity,
        setCheckoutCharacterId,
        initiateCheckout,
        completeCheckout,
        confirmOrderReceived,
        raiseDispute,
        adminCreateOrder,
        adminUpdateOrder,
        adminDeleteOrder,
        clearAllOrders,
        chatDrawerOpen,
        setChatDrawerOpen,
        activeChatConvId,
        setActiveChatConvId,
        conversations,
        unreadChatCount,
        sendChatMessage,
        openChatForSeller,
        adminCreateConversation,
        adminSendSystemMessage,
        adminDeleteMessage,
        adminDeleteConversation,
        unreadNotificationsCount,
        notificationsOpen,
        setNotificationsOpen,
        exportSiteSnapshot,
        importSiteSnapshot,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
