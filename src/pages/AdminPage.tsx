import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  CustomNotificationItem,
  Game,
  Order,
  PromoCodeConfig,
  SellerTier,
  ServiceVertical,
} from '../types/marketplace';
import { PolarithLogoSvg } from '../components/CustomIcons';

type AdminTab =
  | 'overview'
  | 'sellers_kyc'
  | 'site_config'
  | 'listings'
  | 'games'
  | 'categories'
  | 'orders'
  | 'chats'
  | 'system';

function normalizeIconInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('<svg')) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(trimmed)}`;
  }
  return trimmed;
}

export const AdminPage: React.FC = () => {
  const {
    isAdminAuthenticated,
    authenticateAdmin,
    logoutAdmin,
    sellerApplications,
    adminUpdateSellerApplicationStatus,
    adminDeleteSellerApplication,
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
    listings,
    addListing,
    updateListingInline,
    deleteListing,
    duplicateListing,
    bulkAdjustListingPrices,
    addListingReview,
    deleteListingReview,
    clearAllListings,
    orders,
    availableBalance,
    pendingEscrowBalance,
    adminCreateOrder,
    adminUpdateOrder,
    adminDeleteOrder,
    clearAllOrders,
    conversations,
    adminCreateConversation,
    adminSendSystemMessage,
    adminDeleteMessage,
    adminDeleteConversation,
    localization,
    updateLocalization,
    formatCurrency,
    navigateTo,
    clearFirebaseData,
    exportSiteSnapshot,
    importSiteSnapshot,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [notice, setNotice] = useState<string | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState<string | null>(null);
  const [enlargedAadhaarUrl, setEnlargedAadhaarUrl] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});

  // Admin Create Listing form state
  const [newListTitle, setNewListTitle] = useState('');
  const [newListGameId, setNewListGameId] = useState(games[0]?.id || '');
  const [newListCustomGame, setNewListCustomGame] = useState('');
  const [newListCategory, setNewListCategory] = useState<ServiceVertical>(
    serviceCategories[0]?.name || 'Game Accounts'
  );
  const [newListPrice, setNewListPrice] = useState('29.99');
  const [newListStock, setNewListStock] = useState('5');
  const [newListSpeed, setNewListSpeed] = useState<'Instant' | '15 mins' | '1 hour' | '24 hours'>('Instant');
  const [newListSellerName, setNewListSellerName] = useState('BeatrixOfficial');
  const [newListSellerTier, setNewListSellerTier] = useState<SellerTier>('Diamond');
  const [newListSellerRating, setNewListSellerRating] = useState('100');
  const [newListImageUrl, setNewListImageUrl] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  // Inline Listing Editor
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [editListingTitle, setEditListingTitle] = useState('');
  const [editListingPrice, setEditListingPrice] = useState('');
  const [editListingStock, setEditListingStock] = useState('');
  const [editListingSpeed, setEditListingSpeed] = useState<'Instant' | '15 mins' | '1 hour' | '24 hours'>('Instant');
  const [editListingImageUrl, setEditListingImageUrl] = useState('');
  const [editListingSellerName, setEditListingSellerName] = useState('');

  // Review Adder per Listing
  const [reviewListingId, setReviewListingId] = useState<string | null>(null);
  const [revBuyerName, setRevBuyerName] = useState('v***r');
  const [revRating, setRevRating] = useState('5');
  const [revComment, setRevComment] = useState('Instant delivery via escrow, 100% legit seller!');

  // Admin Add Game form state (including Game Icon / Logo URL or File Upload)
  const [newGameId, setNewGameId] = useState('');
  const [newGameTitle, setNewGameTitle] = useState('');
  const [newGameCategory, setNewGameCategory] = useState('Competitive / Multiplayer');
  const [newGameIconUrl, setNewGameIconUrl] = useState('');
  const [newGameServers, setNewGameServers] = useState('Global, North America, Europe, Asia');
  const [newGamePlatforms, setNewGamePlatforms] = useState('PC, Console, Mobile');

  // Inline Game Editor
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editGameTitle, setEditGameTitle] = useState('');
  const [editGameCategory, setEditGameCategory] = useState('');
  const [editGameIconUrl, setEditGameIconUrl] = useState('');
  const [editGameServers, setEditGameServers] = useState('');
  const [editGamePlatforms, setEditGamePlatforms] = useState('');

  // Admin Add/Edit Category form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIconUrl, setNewCategoryIconUrl] = useState('');
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editCatNewName, setEditCatNewName] = useState('');
  const [editCatIconUrl, setEditCatIconUrl] = useState('');

  // Payment gateway input
  const [gatewayInput, setGatewayInput] = useState(siteConfig.paymentGateways.join(', '));

  // Promo Code Adder
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState('15');
  const [newPromoDesc, setNewPromoDesc] = useState('VIP Discount');

  // Manual Order Creator
  const [manOrdTitle, setManOrdTitle] = useState('');
  const [manOrdGame, setManOrdGame] = useState('');
  const [manOrdSeller, setManOrdSeller] = useState('PolarithOfficial');
  const [manOrdBuyer, setManOrdBuyer] = useState('Buyer#9901');
  const [manOrdPrice, setManOrdPrice] = useState('49.99');
  const [manOrdStatus, setManOrdStatus] = useState<Order['status']>('Preparing');

  // Admin Chat & Notification Broadcast state
  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || '');
  const [adminChatText, setAdminChatText] = useState('');
  const [adminMilestoneTitle, setAdminMilestoneTitle] = useState('Admin Escrow Directive');
  const [adminSenderRole, setAdminSenderRole] = useState<'system' | 'seller' | 'buyer'>('system');
  const [newConvUsername, setNewConvUsername] = useState('');
  const [newConvOrderId, setNewConvOrderId] = useState('');

  // Custom Notification Broadcast
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertBadge, setAlertBadge] = useState('OFFICIAL');

  // Snapshot JSON import/export
  const [snapshotJson, setSnapshotJson] = useState('');

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleIconFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLoaded(reader.result);
        showNotice(`Loaded image/icon "${file.name}".`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const totalEscrowVolume = orders.reduce((sum, o) => sum + o.total, 0);
  const totalFeeRevenue = orders.reduce((sum, o) => sum + o.fee, 0);

  const handleAdminCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) {
      showNotice('Please enter a listing title.');
      return;
    }
    const targetGame = games.find((g) => g.id === newListGameId) || games[0] || null;
    const resolvedGameTitle =
      targetGame?.title || newListCustomGame.trim() || 'General Gaming';
    const resolvedGameId =
      targetGame?.id ||
      resolvedGameTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '') ||
      'general';

    const parsedPrice = Math.max(0.5, Number(newListPrice) || 10);
    const parsedStock = Math.max(1, Number(newListStock) || 1);
    const parsedRating = Math.min(100, Math.max(1, Number(newListSellerRating) || 100));
    const normalizedThumb = normalizeIconInput(newListImageUrl);

    await addListing(
      {
        title: newListTitle.trim(),
        gameId: resolvedGameId,
        gameTitle: resolvedGameTitle,
        serviceType: newListCategory,
        price: parsedPrice,
        currency: 'USD',
        stock: parsedStock,
        minPurchase: 1,
        deliverySpeed: newListSpeed,
        deliveryMethod: newListSpeed === 'Instant' ? 'Automated' : 'Manual Transfer',
        isFungible:
          newListCategory === 'Game Coins' ||
          newListCategory === 'Top Up' ||
          newListCategory === 'Gift Cards',
        attributes: {
          region: 'Global',
          server: targetGame?.servers[0] || 'Global',
          platform: targetGame?.platforms[0] || 'PC',
        },
        media: normalizedThumb ? [normalizedThumb] : [],
        specifications: {
          Game: resolvedGameTitle,
          Category: newListCategory,
          'Delivery Speed': newListSpeed,
          Verification: 'Admin Verified',
        },
        description:
          newListDesc.trim() ||
          `${newListTitle.trim()} — Official verified marketplace offer protected by GamerProtect Escrow.`,
        reviews: [],
      },
      {
        id: `seller_${newListSellerName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        username: newListSellerName.trim() || 'PolarithOfficial',
        tier: newListSellerTier,
        level: 50,
        ratingPercentage: parsedRating,
      }
    );

    setNewListTitle('');
    setNewListDesc('');
    setNewListImageUrl('');
    showNotice('Listing published to live marketplace.');
  };

  const handleSaveListingEdit = async (item: any) => {
    const normalizedThumb = normalizeIconInput(editListingImageUrl);
    await updateListingInline(item.id, {
      title: editListingTitle.trim() || item.title,
      price: Math.max(0.5, Number(editListingPrice) || item.price),
      stock: Math.max(0, Number(editListingStock) || 0),
      deliverySpeed: editListingSpeed,
      media: normalizedThumb ? [normalizedThumb] : item.media,
      seller: {
        ...item.seller,
        username: editListingSellerName.trim() || item.seller.username,
      },
    });
    setEditingListingId(null);
    showNotice('Listing updated.');
  };

  const handleAddGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameTitle.trim()) {
      showNotice('Enter a game title.');
      return;
    }
    const cleanId =
      newGameId
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '') ||
      newGameTitle
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const servers = newGameServers
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const platforms = newGamePlatforms
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const normalizedIcon = normalizeIconInput(newGameIconUrl);

    const newGame: Game = {
      id: cleanId || `game_${Date.now()}`,
      title: newGameTitle.trim(),
      category: newGameCategory.trim() || 'Multiplayer',
      iconUrl: normalizedIcon || undefined,
      posterBg: 'from-emerald-100/90 via-emerald-50/60 to-white',
      iconBg: 'bg-emerald-600',
      activeListingsCount: 0,
      popularServices: [
        { name: 'Game Accounts', count: 0 },
        { name: 'Game Coins', count: 0 },
        { name: 'Items & Skins', count: 0 },
      ],
      servers: servers.length > 0 ? servers : ['Global'],
      platforms: platforms.length > 0 ? platforms : ['PC'],
    };

    addGame(newGame);
    setNewGameId('');
    setNewGameTitle('');
    setNewGameIconUrl('');
    showNotice(`Added "${newGame.title}" to Supported Game Hubs.`);
  };

  const handleSaveGameEdit = (id: string) => {
    const servers = editGameServers
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const platforms = editGamePlatforms
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const normalizedIcon = normalizeIconInput(editGameIconUrl);

    updateGame(id, {
      title: editGameTitle.trim() || id,
      category: editGameCategory.trim() || 'Gaming',
      iconUrl: normalizedIcon || undefined,
      servers: servers.length > 0 ? servers : ['Global'],
      platforms: platforms.length > 0 ? platforms : ['PC'],
    });
    setEditingGameId(null);
    showNotice('Game hub updated.');
  };

  const handleDownloadSnapshotFile = () => {
    const data = exportSiteSnapshot();
    setSnapshotJson(data);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polarith-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Downloaded full website JSON snapshot.');
  };

  const handleUploadSnapshotFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSnapshotJson(reader.result);
        const ok = importSiteSnapshot(reader.result);
        showNotice(
          ok
            ? `Imported snapshot from "${file.name}"!`
            : 'Invalid JSON snapshot file.'
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const pendingSellerAppsCount = sellerApplications.filter(
    (a) => a.status === 'pending'
  ).length;

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = authenticateAdmin(adminPasswordInput);
    if (ok) {
      setAdminPasswordError(null);
      setAdminPasswordInput('');
    } else {
      setAdminPasswordError('Incorrect Admin Password. Access denied.');
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-white text-slate-900 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md surface-glass-card rounded-2xl p-6 sm:p-8 space-y-6 bg-white">
          <div className="flex items-center gap-3">
            <PolarithLogoSvg className="w-9 h-9 shrink-0" />
            <div>
              <div className="font-black text-lg tracking-tight text-slate-900">
                {siteConfig.brandPrefix}
                <span className="text-sky-600">{siteConfig.brandHighlight}</span> Admin
              </div>
              <p className="text-xs text-slate-500">
                Enter master password to unlock God Mode Control Center
              </p>
            </div>
          </div>

          {adminPasswordError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
              {adminPasswordError}
            </div>
          )}

          <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Admin Portal Password
              </label>
              <input
                type="password"
                required
                autoFocus
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-sky-300 text-sm text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => navigateTo('home')}
                className="btn-glass-light px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Back to Website
              </button>
              <button
                type="submit"
                className="btn-glass-primary px-6 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Unlock Admin Portal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-white text-slate-900 pb-24">
      {/* Enlarged Aadhaar Image Modal */}
      {enlargedAadhaarUrl && (
        <div
          onClick={() => setEnlargedAadhaarUrl(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-4 max-w-2xl w-full space-y-3 border border-sky-200 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900">
                Seller Aadhaar Card Document Inspection
              </span>
              <button
                onClick={() => setEnlargedAadhaarUrl(null)}
                className="btn-glass-light px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
            <img
              src={enlargedAadhaarUrl}
              alt="Aadhaar Document Full View"
              className="w-full max-h-[75vh] object-contain rounded-xl border border-sky-100"
            />
          </div>
        </div>
      )}

      {/* Dedicated Top Admin Control Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-sky-200 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <PolarithLogoSvg className="w-8 h-8 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-slate-900">
                  {siteConfig.brandPrefix}
                  <span className="text-sky-600">{siteConfig.brandHighlight}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 border border-sky-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                  GOD MODE /#/admin
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Supreme Website Control Center · Control 100% of Buyer &amp; Seller Portals in real time
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigateTo('home')}
              className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Open Buyer Website (#/)
            </button>
            <button
              onClick={() => navigateTo('marketplace')}
              className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Open Marketplace (#/marketplace)
            </button>
            <button
              onClick={() => navigateTo('dashboard')}
              className="btn-glass-primary px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Open Seller Portal (/#/seller)
            </button>
            <button
              onClick={logoutAdmin}
              className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Lock Admin
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {notice && (
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-300 text-sky-900 text-xs font-bold flex items-center justify-between">
            <span>{notice}</span>
            <button
              onClick={() => setNotice(null)}
              className="btn-glass-light px-2.5 py-1 rounded-lg font-mono text-[11px] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-sky-200 pb-3">
          {(
            [
              { id: 'overview', label: '1. God Mode & Switches' },
              {
                id: 'sellers_kyc',
                label: `2. Seller KYC & Aadhaar (${sellerApplications.length}${
                  pendingSellerAppsCount > 0 ? ` · ${pendingSellerAppsCount} Pending` : ''
                })`,
              },
              { id: 'site_config', label: '3. Brand, Logo & Copy' },
              { id: 'listings', label: `4. Listings (${listings.length})` },
              { id: 'games', label: `5. Games & Icons (${games.length})` },
              { id: 'categories', label: `6. Categories (${serviceCategories.length})` },
              { id: 'orders', label: `7. Orders & Wallet (${orders.length})` },
              { id: 'chats', label: `8. Chats & Alerts (${conversations.length})` },
              { id: 'system', label: '9. Currency & Backup' },
            ] as { id: AdminTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id ? 'btn-glass-primary' : 'btn-glass-light'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 2: SELLER KYC & AADHAAR AUTHORIZATION */}
        {activeTab === 'sellers_kyc' && (
          <div className="space-y-6">
            <div className="surface-glass-card p-6 rounded-2xl space-y-4 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Seller Account Applications &amp; Aadhaar Card Verification ({sellerApplications.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review visitor submissions from /#/seller, inspect their uploaded Aadhaar card picture, and Accept (Approve) or Reject their seller account.
                  </p>
                </div>
              </div>

              {sellerApplications.length === 0 ? (
                <div className="py-12 text-center space-y-2 border border-dashed border-sky-200 rounded-2xl bg-white">
                  <div className="text-sm font-bold text-slate-800">
                    No Seller Applications Submitted Yet
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    When a buyer clicks &quot;+ Sell&quot; and submits their details and Aadhaar card picture, their application will appear here for your approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sellerApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl border border-sky-200 bg-white grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
                    >
                      {/* Left: Applicant Details */}
                      <div className="lg:col-span-5 space-y-2.5 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold uppercase ${
                              app.status === 'approved'
                                ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                : app.status === 'rejected'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {app.status}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            Submitted: {app.submittedAt}
                          </span>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Full Legal Name (Aadhaar)
                          </div>
                          <div className="text-sm font-extrabold text-slate-900">
                            {app.fullName}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[10px] font-bold uppercase text-slate-400">
                              Seller Username
                            </div>
                            <div className="font-bold text-slate-800">{app.username}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase text-slate-400">
                              Aadhaar Number
                            </div>
                            <div className="font-mono font-bold text-slate-900">
                              {app.aadhaarNumber}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[10px] font-bold uppercase text-slate-400">
                              Email
                            </div>
                            <div className="font-semibold text-slate-700 break-all">
                              {app.email}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase text-slate-400">
                              Phone / WhatsApp
                            </div>
                            <div className="font-semibold text-slate-700">{app.phone}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Payout UPI / Bank Details
                          </div>
                          <div className="font-mono font-semibold text-sky-800">
                            {app.payoutDetails}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Uploaded Aadhaar Card Image */}
                      <div className="lg:col-span-4 space-y-2">
                        <div className="text-[10px] font-bold uppercase text-slate-400">
                          Uploaded Aadhaar Card Picture
                        </div>
                        {app.aadhaarImageUrl ? (
                          <div className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/30 space-y-2">
                            <img
                              src={app.aadhaarImageUrl}
                              alt={`Aadhaar of ${app.fullName}`}
                              onClick={() => setEnlargedAadhaarUrl(app.aadhaarImageUrl)}
                              className="w-full h-36 object-contain rounded-lg bg-white border border-sky-100 cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => setEnlargedAadhaarUrl(app.aadhaarImageUrl)}
                              className="w-full btn-glass-light py-1.5 rounded-lg text-[11px] font-bold cursor-pointer"
                            >
                              View Full Aadhaar Image
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400">No image attached</div>
                        )}
                      </div>

                      {/* Right: Accept / Reject Seller Controls */}
                      <div className="lg:col-span-3 space-y-2.5">
                        <div className="text-[10px] font-bold uppercase text-slate-400">
                          Admin Authorization Decision
                        </div>

                        <input
                          type="text"
                          value={rejectNotes[app.id] ?? app.adminNote ?? ''}
                          onChange={(e) =>
                            setRejectNotes((prev) => ({
                              ...prev,
                              [app.id]: e.target.value,
                            }))
                          }
                          placeholder="Optional Admin note / reason..."
                          className="w-full h-9 px-3 rounded-xl bg-white border border-sky-200 text-xs text-slate-900"
                        />

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              adminUpdateSellerApplicationStatus(
                                app.id,
                                'approved',
                                rejectNotes[app.id]
                              );
                              showNotice(`Approved seller account for "${app.fullName}".`);
                            }}
                            className="flex-1 btn-glass-primary px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer"
                          >
                            Accept Seller
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              adminUpdateSellerApplicationStatus(
                                app.id,
                                'rejected',
                                rejectNotes[app.id] || 'Verification details incomplete.'
                              );
                              showNotice(`Rejected seller application for "${app.fullName}".`);
                            }}
                            className="flex-1 btn-glass-light px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            adminDeleteSellerApplication(app.id);
                            showNotice('Removed seller application.');
                          }}
                          className="w-full btn-glass-light px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer"
                        >
                          Delete Application
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: GOD MODE & LAYOUT VISIBILITY SWITCHES */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {pendingSellerAppsCount > 0 && (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-300 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-bold text-slate-900">
                  {pendingSellerAppsCount} Seller Application(s) with Aadhaar Card Upload awaiting your authorization!
                </div>
                <button
                  onClick={() => setActiveTab('sellers_kyc')}
                  className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Review Seller KYC Applications
                </button>
              </div>
            )}
            {/* KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="surface-glass-card p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold uppercase text-slate-400">Listings</div>
                <div className="text-xl font-black font-mono text-slate-900 mt-1">
                  {listings.length}
                </div>
              </div>
              <div className="surface-glass-card p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold uppercase text-slate-400">Orders</div>
                <div className="text-xl font-black font-mono text-slate-900 mt-1">
                  {orders.length}
                </div>
              </div>
              <div className="surface-glass-card p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold uppercase text-slate-400">Escrow Vol</div>
                <div className="text-xl font-black font-mono text-emerald-700 mt-1">
                  {formatCurrency(totalEscrowVolume)}
                </div>
              </div>
              <div className="surface-glass-card p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold uppercase text-slate-400">Fee Rev</div>
                <div className="text-xl font-black font-mono text-emerald-700 mt-1">
                  {formatCurrency(totalFeeRevenue)}
                </div>
              </div>
              <div className="surface-glass-card p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold uppercase text-slate-400">Wallet Bal</div>
                <div className="text-xl font-black font-mono text-emerald-700 mt-1">
                  {formatCurrency(availableBalance)}
                </div>
              </div>
              <div className="surface-glass-card p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold uppercase text-slate-400">Escrow Hold</div>
                <div className="text-xl font-black font-mono text-slate-900 mt-1">
                  {formatCurrency(pendingEscrowBalance)}
                </div>
              </div>
              <div className="surface-glass-card p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold uppercase text-slate-400">Game Hubs</div>
                <div className="text-xl font-black font-mono text-slate-900 mt-1">
                  {games.length}
                </div>
              </div>
              <div className="surface-glass-card p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold uppercase text-slate-400">Categories</div>
                <div className="text-xl font-black font-mono text-slate-900 mt-1">
                  {serviceCategories.length}
                </div>
              </div>
            </div>

            {/* Global Website Feature & Section Visibility Switches */}
            <div className="surface-glass-card p-6 rounded-2xl space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Master Website Visibility &amp; Capability Switches (20 Live Toggles)
                </h2>
                <p className="text-xs text-slate-500">
                  Show, hide, lock, or unlock any section, header button, footer strip, or commerce flow across the entire website.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  {
                    key: 'maintenanceMode' as const,
                    title: 'Maintenance Mode Lock',
                    desc: 'Locks public Buyer & Seller pages with a maintenance screen while /#/admin stays active.',
                  },
                  {
                    key: 'announcementEnabled' as const,
                    title: 'Top Announcement Banner',
                    desc: 'Displays a global promotional or system banner above the sticky header.',
                  },
                  {
                    key: 'showBrandLogo' as const,
                    title: 'Show Brand Logo Icon',
                    desc: 'Toggle the brand logo emblem next to the site title in the header and footer.',
                  },
                  {
                    key: 'showHeaderCategories' as const,
                    title: 'Show Header Categories Menu',
                    desc: 'Show or hide the Categories mega-menu dropdown button in the top navigation bar.',
                  },
                  {
                    key: 'showHeaderSearch' as const,
                    title: 'Show Header Search Bar',
                    desc: 'Show or hide the global instant search bar in the top header.',
                  },
                  {
                    key: 'showHeaderLocalization' as const,
                    title: 'Show Region / Currency Button',
                    desc: 'Show or hide the Region & Currency selector button in the top header.',
                  },
                  {
                    key: 'showHeaderSellButton' as const,
                    title: 'Show Header "+ Sell Now" Button',
                    desc: 'Show or hide the primary + Sell button in the top header.',
                  },
                  {
                    key: 'showHeaderNotifications' as const,
                    title: 'Show Header Notifications Bell',
                    desc: 'Show or hide the order & alert notification bell in the header.',
                  },
                  {
                    key: 'showCategoryIcons' as const,
                    title: 'Show Service Category Icons',
                    desc: 'Toggle icons on service category buttons and cards across the entire site.',
                  },
                  {
                    key: 'allowNewListings' as const,
                    title: 'Allow New Seller Listings',
                    desc: 'Permit sellers on /#/seller to publish new offers to the marketplace.',
                  },
                  {
                    key: 'allowCheckout' as const,
                    title: 'Allow Buyer Checkout',
                    desc: 'Enable buyers to purchase listings and open new escrow transactions.',
                  },
                  {
                    key: 'enableLiveChat' as const,
                    title: 'Enable Live Trade Chat',
                    desc: 'Allow real-time encrypted messaging between buyers and sellers.',
                  },
                  {
                    key: 'showHomeHeroSection' as const,
                    title: 'Show Homepage Hero Banner',
                    desc: 'Display or hide the top Hero banner section on the homepage.',
                  },
                  {
                    key: 'showHeroSellCta' as const,
                    title: 'Show Hero "Create Listing" CTA',
                    desc: 'Show or hide the Create Listing button inside the homepage hero section.',
                  },
                  {
                    key: 'showHomeCategoriesSection' as const,
                    title: 'Show Home Categories Grid',
                    desc: 'Display or hide the Browse by Service Category section on the homepage.',
                  },
                  {
                    key: 'showHomeGamesSection' as const,
                    title: 'Show Home Supported Game Hubs',
                    desc: 'Display or hide the Supported Game Hubs grid on the homepage.',
                  },
                  {
                    key: 'showHomeListingsSection' as const,
                    title: 'Show Home Live Inventory Grid',
                    desc: 'Display or hide the Live Marketplace Inventory section on the homepage.',
                  },
                  {
                    key: 'showHomeEscrowSection' as const,
                    title: 'Show Home Escrow Vault Strip',
                    desc: 'Display the 3-step GamerProtect Escrow explanation card on the homepage.',
                  },
                  {
                    key: 'showFooterTrustStrip' as const,
                    title: 'Show Footer 4-Pillar Trust Strip',
                    desc: 'Display the 4 security pillars at the top of the global footer.',
                  },
                  {
                    key: 'showFooter' as const,
                    title: 'Show Global Footer',
                    desc: 'Display or hide the entire bottom sitemap and payment rail footer.',
                  },
                ].map((item) => {
                  const isActive = Boolean(siteConfig[item.key]);
                  return (
                    <div
                      key={item.key}
                      className="p-3.5 rounded-xl bg-white/85 border border-emerald-500/15 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-extrabold text-slate-900">{item.title}</div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => {
                          updateSiteConfig({ [item.key]: !isActive });
                          showNotice(`${item.title}: ${!isActive ? 'ON' : 'OFF'}`);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold shrink-0 cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isActive ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dedicated Portal Route Reference */}
            <div className="surface-glass-card p-6 rounded-2xl space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Dedicated Portal Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/80 border border-emerald-500/15 space-y-1">
                  <div className="font-bold text-slate-900">Buyer Storefront</div>
                  <div className="font-mono text-emerald-700">#/</div>
                  <div className="text-[11px] text-slate-500">
                    Public marketplace with zero mention of the Admin Portal.
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 border border-emerald-500/15 space-y-1">
                  <div className="font-bold text-slate-900">Seller Studio Portal</div>
                  <div className="font-mono text-emerald-700">/#/seller</div>
                  <div className="text-[11px] text-slate-500">
                    Opens automatically when + Sell is clicked. Zero mention of Admin Portal.
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 border border-emerald-500/15 space-y-1">
                  <div className="font-bold text-slate-900">Hidden Master Admin (God Mode)</div>
                  <div className="font-mono text-emerald-700">/#/admin</div>
                  <div className="text-[11px] text-slate-500">
                    Accessible exclusively by appending /#/admin to the URL.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BRANDING, CUSTOM LOGO, THEME, SEO & COPY */}
        {activeTab === 'site_config' && (
          <div className="space-y-6">
            {/* Brand Identity, Custom Logo & Browser Tab SEO */}
            <div className="surface-glass-card p-6 rounded-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Brand Identity, Custom Site Logo, Browser Title &amp; All Page Copy
                  </h2>
                  <p className="text-xs text-slate-500">
                    Control your website title, custom uploaded logo, headlines, section titles, 3-step escrow copy, and 4 footer pillars.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetSiteConfig();
                    setGatewayInput(
                      'VISA, Mastercard, PayPal, Apple Pay, Google Pay, Crypto (USDT/BTC)'
                    );
                    showNotice('Site configuration restored to defaults.');
                  }}
                  className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 cursor-pointer"
                >
                  Reset Config to Default
                </button>
              </div>

              {/* Browser Title & Favicon */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Browser Tab Title (&lt;title&gt;)
                  </label>
                  <input
                    type="text"
                    value={siteConfig.siteTitle}
                    onChange={(e) => updateSiteConfig({ siteTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Browser Favicon URL / Data URI (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste favicon image URL or upload file..."
                      value={siteConfig.faviconUrl}
                      onChange={(e) =>
                        updateSiteConfig({ faviconUrl: normalizeIconInput(e.target.value) })
                      }
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                    />
                    <label className="btn-glass-light px-3 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0">
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*,.svg,.ico"
                        onChange={(e) =>
                          handleIconFileUpload(e, (dataUrl) =>
                            updateSiteConfig({ faviconUrl: dataUrl })
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Custom Brand Logo Upload / URL */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end pt-3 border-t border-emerald-500/10">
                <div className="lg:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom Brand Logo (URL, Data URI, or raw &lt;svg&gt;...&lt;/svg&gt; code)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave blank for default shield logo, or paste URL / <svg> / upload image"
                    value={siteConfig.brandLogoUrl}
                    onChange={(e) =>
                      updateSiteConfig({ brandLogoUrl: normalizeIconInput(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>
                <div className="lg:col-span-5 flex flex-wrap items-center gap-2.5">
                  <label className="btn-glass-light px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer">
                    <span>Upload Brand Logo File</span>
                    <input
                      type="file"
                      accept="image/*,.svg"
                      onChange={(e) =>
                        handleIconFileUpload(e, (dataUrl) =>
                          updateSiteConfig({ brandLogoUrl: dataUrl })
                        )
                      }
                      className="hidden"
                    />
                  </label>
                  {siteConfig.brandLogoUrl && (
                    <button
                      type="button"
                      onClick={() => updateSiteConfig({ brandLogoUrl: '' })}
                      className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Restore Default Logo
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-emerald-500/10">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand Prefix
                  </label>
                  <input
                    type="text"
                    value={siteConfig.brandPrefix}
                    onChange={(e) => updateSiteConfig({ brandPrefix: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand Highlight
                  </label>
                  <input
                    type="text"
                    value={siteConfig.brandHighlight}
                    onChange={(e) => updateSiteConfig({ brandHighlight: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Header Search Placeholder
                  </label>
                  <input
                    type="text"
                    value={siteConfig.searchPlaceholder}
                    onChange={(e) => updateSiteConfig({ searchPlaceholder: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Header Sell Button Text
                  </label>
                  <input
                    type="text"
                    value={siteConfig.sellButtonText}
                    onChange={(e) => updateSiteConfig({ sellButtonText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Hero Section Copy */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-emerald-500/10">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hero Kicker Badge
                  </label>
                  <input
                    type="text"
                    value={siteConfig.heroKicker}
                    onChange={(e) => updateSiteConfig({ heroKicker: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hero Title Main Text
                  </label>
                  <input
                    type="text"
                    value={siteConfig.heroTitlePrefix}
                    onChange={(e) => updateSiteConfig({ heroTitlePrefix: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hero Title Highlight
                  </label>
                  <input
                    type="text"
                    value={siteConfig.heroTitleHighlight}
                    onChange={(e) => updateSiteConfig({ heroTitleHighlight: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hero Sell Button Label
                  </label>
                  <input
                    type="text"
                    value={siteConfig.heroSellCtaText}
                    onChange={(e) => updateSiteConfig({ heroSellCtaText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hero Subtitle Description
                </label>
                <textarea
                  rows={2}
                  value={siteConfig.heroDescription}
                  onChange={(e) => updateSiteConfig({ heroDescription: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                />
              </div>

              {/* Homepage Section Headlines & Subtitles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-emerald-500/10">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Categories Section Title &amp; Subtitle
                  </label>
                  <input
                    type="text"
                    value={siteConfig.homeCategoriesTitle}
                    onChange={(e) => updateSiteConfig({ homeCategoriesTitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={siteConfig.homeCategoriesSubtitle}
                    onChange={(e) => updateSiteConfig({ homeCategoriesSubtitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Game Hubs Section Title &amp; Subtitle
                  </label>
                  <input
                    type="text"
                    value={siteConfig.homeGamesTitle}
                    onChange={(e) => updateSiteConfig({ homeGamesTitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={siteConfig.homeGamesSubtitle}
                    onChange={(e) => updateSiteConfig({ homeGamesSubtitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Live Listings Section Title &amp; Subtitle
                  </label>
                  <input
                    type="text"
                    value={siteConfig.homeListingsTitle}
                    onChange={(e) => updateSiteConfig({ homeListingsTitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={siteConfig.homeListingsSubtitle}
                    onChange={(e) => updateSiteConfig({ homeListingsSubtitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
              </div>

              {/* 3-Step Escrow Strip Editor */}
              <div className="space-y-3 pt-3 border-t border-emerald-500/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Escrow Section Headline
                    </label>
                    <input
                      type="text"
                      value={siteConfig.escrowSectionTitle}
                      onChange={(e) => updateSiteConfig({ escrowSectionTitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Escrow Section Description
                    </label>
                    <input
                      type="text"
                      value={siteConfig.escrowSectionSubtitle}
                      onChange={(e) => updateSiteConfig({ escrowSectionSubtitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-emerald-500/20 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(siteConfig.escrowSteps || []).map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/80 border border-emerald-500/15 space-y-1.5"
                    >
                      <input
                        type="text"
                        value={st.step}
                        onChange={(e) => {
                          const next = [...siteConfig.escrowSteps];
                          next[idx] = { ...next[idx], step: e.target.value };
                          updateSiteConfig({ escrowSteps: next });
                        }}
                        className="w-full px-2.5 py-1 rounded-lg bg-white border border-emerald-500/20 text-[11px] font-mono font-bold text-emerald-700"
                      />
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          const next = [...siteConfig.escrowSteps];
                          next[idx] = { ...next[idx], title: e.target.value };
                          updateSiteConfig({ escrowSteps: next });
                        }}
                        className="w-full px-2.5 py-1 rounded-lg bg-white border border-emerald-500/20 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={st.subtitle}
                        onChange={(e) => {
                          const next = [...siteConfig.escrowSteps];
                          next[idx] = { ...next[idx], subtitle: e.target.value };
                          updateSiteConfig({ escrowSteps: next });
                        }}
                        className="w-full px-2.5 py-1 rounded-lg bg-white border border-emerald-500/20 text-xs text-slate-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer 4 Trust Pillars Editor */}
              <div className="space-y-2.5 pt-3 border-t border-emerald-500/10">
                <label className="block text-xs font-bold text-slate-700">
                  Footer 4-Pillar Trust Strip Copy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(siteConfig.trustPillars || []).map((pil, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/80 border border-emerald-500/15 space-y-1.5"
                    >
                      <input
                        type="text"
                        value={pil.title}
                        onChange={(e) => {
                          const next = [...siteConfig.trustPillars];
                          next[idx] = { ...next[idx], title: e.target.value };
                          updateSiteConfig({ trustPillars: next });
                        }}
                        className="w-full px-2.5 py-1 rounded-lg bg-white border border-emerald-500/20 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={pil.description}
                        onChange={(e) => {
                          const next = [...siteConfig.trustPillars];
                          next[idx] = { ...next[idx], description: e.target.value };
                          updateSiteConfig({ trustPillars: next });
                        }}
                        className="w-full px-2.5 py-1 rounded-lg bg-white border border-emerald-500/20 text-xs text-slate-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Announcement, Maintenance & Payment Gateways */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-emerald-500/10">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Announcement Badge
                  </label>
                  <input
                    type="text"
                    value={siteConfig.announcementBadge}
                    onChange={(e) => updateSiteConfig({ announcementBadge: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Announcement Banner Message
                  </label>
                  <input
                    type="text"
                    value={siteConfig.announcementText}
                    onChange={(e) => updateSiteConfig({ announcementText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-emerald-500/10">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maintenance Screen Headline
                  </label>
                  <input
                    type="text"
                    value={siteConfig.maintenanceTitle}
                    onChange={(e) => updateSiteConfig({ maintenanceTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maintenance Screen Message
                  </label>
                  <input
                    type="text"
                    value={siteConfig.maintenanceMessage}
                    onChange={(e) => updateSiteConfig({ maintenanceMessage: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Footer Payment Gateways (Comma-separated)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={gatewayInput}
                      onChange={(e) => setGatewayInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const list = gatewayInput
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        updateSiteConfig({ paymentGateways: list });
                        showNotice('Footer payment gateways updated.');
                      }}
                      className="btn-glass-primary px-3 py-2 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Theme Accent Color & Custom CSS Injection */}
            <div className="surface-glass-card p-6 rounded-2xl space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Live Theme Accent Color &amp; Custom CSS Injection
                </h3>
                <p className="text-xs text-slate-500">
                  Switch the primary accent color across all buttons/badges or inject custom CSS rules directly into the live DOM.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {[
                  { label: 'Emerald (Default)', hex: '#059669' },
                  { label: 'Royal Blue', hex: '#2563EB' },
                  { label: 'Cyber Violet', hex: '#7C3AED' },
                  { label: 'Crimson Red', hex: '#DC2626' },
                  { label: 'Amber Gold', hex: '#D97706' },
                  { label: 'Obsidian Slate', hex: '#0F172A' },
                ].map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => {
                      updateSiteConfig({ accentColorHex: preset.hex });
                      showNotice(`Theme accent set to ${preset.label}.`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer border ${
                      siteConfig.accentColorHex === preset.hex
                        ? 'border-slate-900 bg-white shadow-xs'
                        : 'border-emerald-500/20 bg-white/80'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{preset.label}</span>
                  </button>
                ))}
                <input
                  type="color"
                  value={siteConfig.accentColorHex || '#059669'}
                  onChange={(e) => updateSiteConfig({ accentColorHex: e.target.value })}
                  className="w-9 h-8 rounded-lg cursor-pointer border border-emerald-500/20 bg-white p-0.5"
                  title="Pick Custom Accent Color"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Global Custom CSS Rules (Injected live into &lt;head&gt;)
                </label>
                <textarea
                  rows={3}
                  placeholder="/* Optional custom CSS, e.g. body { letter-spacing: -0.01em; } */"
                  value={siteConfig.customCss}
                  onChange={(e) => updateSiteConfig({ customCss: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALL LISTINGS, THUMBNAILS & REVIEWS CONTROL */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            {/* Admin Create Listing Card */}
            <form
              onSubmit={handleAdminCreateListing}
              className="surface-glass-card p-6 rounded-2xl space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Publish Any Listing as Admin (With Custom Thumbnail &amp; Seller Profile)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Create verified offers under any game, category, custom image/SVG thumbnail, seller name, rating %, and tier.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {listings.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          bulkAdjustListingPrices(-10);
                          showNotice('Applied -10% discount across all active listings.');
                        }}
                        className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Bulk -10% Prices
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          bulkAdjustListingPrices(10);
                          showNotice('Applied +10% price increase across all active listings.');
                        }}
                        className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Bulk +10% Prices
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          clearAllListings();
                          showNotice('All marketplace listings cleared.');
                        }}
                        className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 cursor-pointer"
                      >
                        Wipe All Listings ({listings.length})
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Game Hub</label>
                  {games.length > 0 ? (
                    <select
                      value={newListGameId || games[0]?.id || ''}
                      onChange={(e) => setNewListGameId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                    >
                      {games.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter game name..."
                      value={newListCustomGame}
                      onChange={(e) => setNewListCustomGame(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Service Category
                  </label>
                  <select
                    value={newListCategory}
                    onChange={(e) => setNewListCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  >
                    {serviceCategories.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Offer Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter offer title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newListPrice}
                    onChange={(e) => setNewListPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock</label>
                  <input
                    type="number"
                    min="1"
                    value={newListStock}
                    onChange={(e) => setNewListStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Delivery Speed
                  </label>
                  <select
                    value={newListSpeed}
                    onChange={(e) => setNewListSpeed(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  >
                    <option value="Instant">Instant</option>
                    <option value="15 mins">15 mins</option>
                    <option value="1 hour">1 hour</option>
                    <option value="24 hours">24 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seller Username
                  </label>
                  <input
                    type="text"
                    value={newListSellerName}
                    onChange={(e) => setNewListSellerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seller Tier
                  </label>
                  <select
                    value={newListSellerTier}
                    onChange={(e) => setNewListSellerTier(e.target.value as SellerTier)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  >
                    <option value="Diamond">Diamond</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seller Rating %
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newListSellerRating}
                    onChange={(e) => setNewListSellerRating(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Optional Custom Thumbnail Upload / URL */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-end">
                <div className="lg:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom Thumbnail Image (URL, &lt;svg&gt;, or File Upload — Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Auto-generated studio card if left blank"
                      value={newListImageUrl}
                      onChange={(e) => setNewListImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                    />
                    <label className="btn-glass-light px-3 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0">
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*,.svg"
                        onChange={(e) =>
                          handleIconFileUpload(e, (dataUrl) => setNewListImageUrl(dataUrl))
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Detailed specification notes for buyer..."
                    value={newListDesc}
                    onChange={(e) => setNewListDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
                <div className="lg:col-span-2">
                  <button
                    type="submit"
                    className="btn-glass-primary w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Publish Listing
                  </button>
                </div>
              </div>
            </form>

            {/* All Listings Table */}
            <div className="surface-glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                Active Marketplace Listings ({listings.length})
              </h3>

              {listings.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No listings currently active. Use the form above to publish an offer.
                </p>
              ) : (
                <div className="space-y-3">
                  {listings.map((item) => {
                    const isEditing = editingListingId === item.id;
                    const isManagingReviews = reviewListingId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-white/85 border border-emerald-500/15 space-y-3"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          {isEditing ? (
                            <div className="space-y-2.5 flex-1">
                              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                                <input
                                  type="text"
                                  value={editListingTitle}
                                  onChange={(e) => setEditListingTitle(e.target.value)}
                                  placeholder="Title"
                                  className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs font-bold"
                                />
                                <input
                                  type="text"
                                  value={editListingSellerName}
                                  onChange={(e) => setEditListingSellerName(e.target.value)}
                                  placeholder="Seller Name"
                                  className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs"
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editListingPrice}
                                  onChange={(e) => setEditListingPrice(e.target.value)}
                                  placeholder="Price"
                                  className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs font-mono"
                                />
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    value={editListingStock}
                                    onChange={(e) => setEditListingStock(e.target.value)}
                                    className="w-16 px-2 py-1.5 rounded-lg border border-emerald-500/30 text-xs font-mono"
                                  />
                                  <select
                                    value={editListingSpeed}
                                    onChange={(e) => setEditListingSpeed(e.target.value as any)}
                                    className="px-2 py-1.5 rounded-lg border border-emerald-500/30 text-xs"
                                  >
                                    <option value="Instant">Instant</option>
                                    <option value="15 mins">15 mins</option>
                                    <option value="1 hour">1 hour</option>
                                    <option value="24 hours">24 hours</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Custom Thumbnail Image URL or <svg>..."
                                  value={editListingImageUrl}
                                  onChange={(e) => setEditListingImageUrl(e.target.value)}
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs font-mono"
                                />
                                <label className="btn-glass-light px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                                  <span>Upload Thumb</span>
                                  <input
                                    type="file"
                                    accept="image/*,.svg"
                                    onChange={(e) =>
                                      handleIconFileUpload(e, (url) => setEditListingImageUrl(url))
                                    }
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              {item.media?.[0] && (
                                <img
                                  src={item.media[0]}
                                  alt={item.title}
                                  className="w-16 h-10 rounded-lg object-cover border border-emerald-500/15 shrink-0"
                                />
                              )}
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                                    {item.gameTitle}
                                  </span>
                                  <span className="text-slate-400">·</span>
                                  <span className="font-semibold text-slate-600">
                                    {item.serviceType}
                                  </span>
                                  <span className="text-slate-400">·</span>
                                  <span className="font-mono text-[11px] text-slate-500">
                                    Seller: {item.seller.username} ({item.seller.tier} ·{' '}
                                    {item.seller.ratingPercentage}%)
                                  </span>
                                </div>
                                <div className="font-bold text-sm text-slate-900">{item.title}</div>
                                <div className="text-xs font-mono text-slate-500">
                                  Price: <strong className="text-emerald-700">${item.price.toFixed(2)}</strong> · Stock: {item.stock} · Speed: {item.deliverySpeed} · Reviews: {item.reviews?.length || 0}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveListingEdit(item)}
                                  className="btn-glass-primary px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingListingId(null)}
                                  className="btn-glass-light px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    setReviewListingId(isManagingReviews ? null : item.id)
                                  }
                                  className="btn-glass-light px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Reviews ({item.reviews?.length || 0})
                                </button>
                                <button
                                  onClick={() => {
                                    duplicateListing(item.id);
                                    showNotice('Listing duplicated.');
                                  }}
                                  className="btn-glass-light px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Clone
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingListingId(item.id);
                                    setEditListingTitle(item.title);
                                    setEditListingPrice(String(item.price));
                                    setEditListingStock(String(item.stock));
                                    setEditListingSpeed(item.deliverySpeed);
                                    setEditListingSellerName(item.seller.username);
                                    setEditListingImageUrl('');
                                  }}
                                  className="btn-glass-light px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    deleteListing(item.id);
                                    showNotice('Listing deleted.');
                                  }}
                                  className="btn-glass-light px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 cursor-pointer"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Review Manager Drawer for this Listing */}
                        {isManagingReviews && (
                          <div className="pt-3 border-t border-emerald-500/15 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="text"
                                placeholder="Buyer Masked Name (e.g. k***9)"
                                value={revBuyerName}
                                onChange={(e) => setRevBuyerName(e.target.value)}
                                className="w-36 px-2.5 py-1.5 rounded-lg bg-white border border-emerald-500/20 text-xs font-mono"
                              />
                              <select
                                value={revRating}
                                onChange={(e) => setRevRating(e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-500/20 text-xs font-bold"
                              >
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                              </select>
                              <input
                                type="text"
                                placeholder="Review comment..."
                                value={revComment}
                                onChange={(e) => setRevComment(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-emerald-500/20 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!revComment.trim()) return;
                                  addListingReview(item.id, {
                                    maskedBuyer: revBuyerName.trim() || 'b***r',
                                    rating: Number(revRating) || 5,
                                    date: new Date().toLocaleDateString(),
                                    comment: revComment.trim(),
                                    servicePurchased: item.serviceType,
                                  });
                                  showNotice('Added verified buyer review to listing.');
                                }}
                                className="btn-glass-primary px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Add Review
                              </button>
                            </div>

                            {(item.reviews || []).length > 0 && (
                              <div className="space-y-1.5">
                                {item.reviews.map((r) => (
                                  <div
                                    key={r.id}
                                    className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                                  >
                                    <div>
                                      <strong className="font-mono text-emerald-700">
                                        {r.rating}★
                                      </strong>{' '}
                                      <span className="font-bold">{r.maskedBuyer}</span>:{' '}
                                      <span className="text-slate-600">{r.comment}</span>
                                    </div>
                                    <button
                                      onClick={() => deleteListingReview(item.id, r.id)}
                                      className="text-red-600 font-bold hover:underline cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: GAMES & ICONS CATALOG CONTROL */}
        {activeTab === 'games' && (
          <div className="space-y-6">
            <form
              onSubmit={handleAddGameSubmit}
              className="surface-glass-card p-6 rounded-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Add Game Hub &amp; Custom Game Icon / Logo
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add game names, icons/logos (via URL, uploaded image/SVG file, or pasted SVG markup), servers, and platforms.
                  </p>
                </div>
                {games.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      resetGames();
                      showNotice('All games cleared.');
                    }}
                    className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 cursor-pointer"
                  >
                    Clear All Games ({games.length})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Game Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter game name..."
                    value={newGameTitle}
                    onChange={(e) => setNewGameTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Game Slug ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if left blank"
                    value={newGameId}
                    onChange={(e) => setNewGameId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Genre / Category Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Action RPG, Shooter, MMORPG"
                    value={newGameCategory}
                    onChange={(e) => setNewGameCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
              </div>

              {/* Game Icon / Logo URL, SVG Paste, or File Upload */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-end pt-2 border-t border-emerald-500/10">
                <div className="lg:col-span-7">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Game Icon / Logo (Image URL, Data URI, or raw &lt;svg&gt;...&lt;/svg&gt; code)
                  </label>
                  <input
                    type="text"
                    placeholder="Paste icon URL, data:image/..., or <svg>...</svg> markup (or upload a file)"
                    value={newGameIconUrl}
                    onChange={(e) => setNewGameIconUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>
                <div className="lg:col-span-5 flex flex-wrap items-center gap-2.5">
                  <label className="btn-glass-light px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer">
                    <span>Upload Icon / Logo File</span>
                    <input
                      type="file"
                      accept="image/*,.svg"
                      onChange={(e) =>
                        handleIconFileUpload(e, (dataUrl) => setNewGameIconUrl(dataUrl))
                      }
                      className="hidden"
                    />
                  </label>
                  {newGameIconUrl && (
                    <>
                      <img
                        src={normalizeIconInput(newGameIconUrl)}
                        alt="Preview"
                        className="w-9 h-9 rounded-xl object-contain bg-white border border-emerald-500/20 p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setNewGameIconUrl('')}
                        className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Remove Icon
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Servers (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newGameServers}
                    onChange={(e) => setNewGameServers(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Platforms (Comma-separated)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGamePlatforms}
                      onChange={(e) => setNewGamePlatforms(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                    />
                    <button
                      type="submit"
                      className="btn-glass-primary px-5 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0"
                    >
                      Add Game Hub
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="surface-glass-card p-6 rounded-2xl space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Active Game Hubs ({games.length})
              </h3>
              {games.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">
                  No games added yet. Use the form above to add your games and upload their icons/logos.
                </p>
              ) : (
                <div className="space-y-3">
                  {games.map((g, idx) => {
                    const isEditing = editingGameId === g.id;
                    return (
                      <div
                        key={g.id}
                        className="p-4 rounded-xl bg-white/85 border border-emerald-500/15 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                      >
                        {isEditing ? (
                          <div className="space-y-2.5 flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                              <input
                                type="text"
                                placeholder="Game Title"
                                value={editGameTitle}
                                onChange={(e) => setEditGameTitle(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs font-bold"
                              />
                              <input
                                type="text"
                                placeholder="Category / Genre"
                                value={editGameCategory}
                                onChange={(e) => setEditGameCategory(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs"
                              />
                              <input
                                type="text"
                                placeholder="Servers (comma-separated)"
                                value={editGameServers}
                                onChange={(e) => setEditGameServers(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs"
                              />
                              <input
                                type="text"
                                placeholder="Platforms (comma-separated)"
                                value={editGamePlatforms}
                                onChange={(e) => setEditGamePlatforms(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs"
                              />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="text"
                                placeholder="Icon / Logo URL, Data URI, or <svg>...</svg>"
                                value={editGameIconUrl}
                                onChange={(e) => setEditGameIconUrl(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs font-mono"
                              />
                              <label className="btn-glass-light px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                                <span>Upload Icon</span>
                                <input
                                  type="file"
                                  accept="image/*,.svg"
                                  onChange={(e) =>
                                    handleIconFileUpload(e, (dataUrl) => setEditGameIconUrl(dataUrl))
                                  }
                                  className="hidden"
                                />
                              </label>
                              {editGameIconUrl && (
                                <button
                                  type="button"
                                  onClick={() => setEditGameIconUrl('')}
                                  className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                                >
                                  Clear Icon
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            {g.iconUrl && (
                              <img
                                src={g.iconUrl}
                                alt={g.title}
                                className="w-10 h-10 rounded-xl object-contain bg-white border border-emerald-500/15 p-1 shrink-0"
                              />
                            )}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900">
                                  {g.title}
                                </span>
                                <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  id: {g.id}
                                </span>
                                <span className="text-xs text-slate-500">({g.category})</span>
                              </div>
                              <div className="text-xs text-slate-500">
                                Servers: {g.servers.join(', ')} · Platforms: {g.platforms.join(', ')} · Icon:{' '}
                                {g.iconUrl ? 'Configured' : 'None (Text Only)'}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveGameEdit(g.id)}
                                className="btn-glass-primary px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingGameId(null)}
                                className="btn-glass-light px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => reorderGame(g.id, 'up')}
                                disabled={idx === 0}
                                className="btn-glass-light px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40"
                                title="Move Up"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => reorderGame(g.id, 'down')}
                                disabled={idx === games.length - 1}
                                className="btn-glass-light px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40"
                                title="Move Down"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => {
                                  setEditingGameId(g.id);
                                  setEditGameTitle(g.title);
                                  setEditGameCategory(g.category);
                                  setEditGameIconUrl(g.iconUrl || '');
                                  setEditGameServers(g.servers.join(', '));
                                  setEditGamePlatforms(g.platforms.join(', '));
                                }}
                                className="btn-glass-light px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  deleteGame(g.id);
                                  showNotice(`Removed ${g.title}.`);
                                }}
                                className="btn-glass-light px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 cursor-pointer"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SERVICE CATEGORIES & CUSTOM ICONS CONTROL */}
        {activeTab === 'categories' && (
          <div className="surface-glass-card p-6 rounded-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Service Verticals, Ordering &amp; Custom Category Icons ({serviceCategories.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Add, rename, reorder, remove, or upload custom icons/logos for any service category.
                </p>
              </div>
              <button
                onClick={() => {
                  resetServiceCategories();
                  showNotice('Service categories restored to defaults.');
                }}
                className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 cursor-pointer"
              >
                Reset Categories
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCategoryName.trim()) return;
                const norm = normalizeIconInput(newCategoryIconUrl);
                addServiceCategory(newCategoryName.trim(), 'Shield', norm || undefined);
                setNewCategoryName('');
                setNewCategoryIconUrl('');
                showNotice('Service category added.');
              }}
              className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end"
            >
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Battle Passes, Coaching"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                />
              </div>
              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Category Icon URL / &lt;svg&gt; (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Paste icon URL or <svg>..."
                  value={newCategoryIconUrl}
                  onChange={(e) => setNewCategoryIconUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                />
              </div>
              <div className="md:col-span-3 flex gap-2">
                <label className="btn-glass-light px-3 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0">
                  <span>Upload Icon</span>
                  <input
                    type="file"
                    accept="image/*,.svg"
                    onChange={(e) =>
                      handleIconFileUpload(e, (url) => setNewCategoryIconUrl(url))
                    }
                    className="hidden"
                  />
                </label>
                <button
                  type="submit"
                  className="btn-glass-primary flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Add Category
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {serviceCategories.map((cat, idx) => {
                const isEditing = editingCatName === cat.name;
                return (
                  <div
                    key={cat.name}
                    className="p-3.5 rounded-xl bg-white/85 border border-emerald-500/15 flex flex-col gap-2"
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editCatNewName}
                          onChange={(e) => setEditCatNewName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs font-bold"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Custom Icon URL or <svg>..."
                            value={editCatIconUrl}
                            onChange={(e) => setEditCatIconUrl(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs font-mono"
                          />
                          <label className="btn-glass-light px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*,.svg"
                              onChange={(e) =>
                                handleIconFileUpload(e, (url) => setEditCatIconUrl(url))
                              }
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              updateServiceCategory(cat.name, {
                                name: editCatNewName.trim() || cat.name,
                                iconUrl: normalizeIconInput(editCatIconUrl) || undefined,
                              });
                              setEditingCatName(null);
                              showNotice('Category updated.');
                            }}
                            className="btn-glass-primary px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCatName(null)}
                            className="btn-glass-light px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {cat.iconUrl && (
                            <img
                              src={cat.iconUrl}
                              alt={cat.name}
                              className="w-7 h-7 rounded-lg object-contain bg-white border border-emerald-500/15 p-0.5"
                            />
                          )}
                          <div>
                            <div className="text-xs font-extrabold text-slate-900">{cat.name}</div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {listings.filter((l) => l.serviceType === cat.name).length} active offers
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => reorderServiceCategory(cat.name, 'up')}
                            disabled={idx === 0}
                            className="btn-glass-light px-2 py-1 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => reorderServiceCategory(cat.name, 'down')}
                            disabled={idx === serviceCategories.length - 1}
                            className="btn-glass-light px-2 py-1 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-40"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => {
                              setEditingCatName(cat.name);
                              setEditCatNewName(cat.name);
                              setEditCatIconUrl(cat.iconUrl || '');
                            }}
                            className="btn-glass-light px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              deleteServiceCategory(cat.name);
                              showNotice(`Category "${cat.name}" removed.`);
                            }}
                            className="btn-glass-light px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: ORDERS, PROMO CODES & WALLET BALANCE OVERRIDE */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Wallet Balance Override & Platform Fees */}
            <div className="surface-glass-card p-6 rounded-2xl space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  God-Mode Wallet Balance Override &amp; Platform Escrow Fees
                </h2>
                <p className="text-xs text-slate-500">
                  Directly set any Available Store Balance, Pending Escrow Balance, or platform fee rules across the site.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Available Wallet Balance (USD)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="1"
                      placeholder="Auto from orders"
                      value={
                        siteConfig.walletBalanceOverride !== null &&
                        siteConfig.walletBalanceOverride !== undefined
                          ? siteConfig.walletBalanceOverride
                          : ''
                      }
                      onChange={(e) =>
                        updateSiteConfig({
                          walletBalanceOverride:
                            e.target.value === '' ? null : Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono font-bold text-emerald-700"
                    />
                    {siteConfig.walletBalanceOverride !== null && (
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ walletBalanceOverride: null })}
                        className="btn-glass-light px-2.5 rounded-xl text-[11px] font-bold cursor-pointer"
                      >
                        Auto
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pending Escrow Hold (USD)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="1"
                      placeholder="Auto from orders"
                      value={
                        siteConfig.pendingEscrowOverride !== null &&
                        siteConfig.pendingEscrowOverride !== undefined
                          ? siteConfig.pendingEscrowOverride
                          : ''
                      }
                      onChange={(e) =>
                        updateSiteConfig({
                          pendingEscrowOverride:
                            e.target.value === '' ? null : Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono font-bold"
                    />
                    {siteConfig.pendingEscrowOverride !== null && (
                      <button
                        type="button"
                        onClick={() => updateSiteConfig({ pendingEscrowOverride: null })}
                        className="btn-glass-light px-2.5 rounded-xl text-[11px] font-bold cursor-pointer"
                      >
                        Auto
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Escrow Fee (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={siteConfig.platformFeePercent}
                    onChange={(e) =>
                      updateSiteConfig({
                        platformFeePercent: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min Order Fee (USD)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={siteConfig.minimumFeeUsd}
                    onChange={(e) =>
                      updateSiteConfig({
                        minimumFeeUsd: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Escrow Timer (Sec)
                  </label>
                  <input
                    type="number"
                    step="300"
                    value={siteConfig.defaultEscrowSeconds}
                    onChange={(e) =>
                      updateSiteConfig({
                        defaultEscrowSeconds: Math.max(60, Number(e.target.value) || 3600),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Checkout Promo / Coupon Code Manager */}
            <div className="surface-glass-card p-6 rounded-2xl space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Checkout Promo &amp; Coupon Codes ({(siteConfig.promoCodes || []).length})
                </h3>
                <p className="text-xs text-slate-500">
                  Create custom discount codes that buyers can redeem during checkout.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const cleanCode = newPromoCode.trim().toUpperCase();
                  if (!cleanCode) return;
                  const nextPromo: PromoCodeConfig = {
                    code: cleanCode,
                    discountPercent: Math.min(100, Math.max(1, Number(newPromoPercent) || 10)),
                    description: newPromoDesc.trim() || 'Promo Discount',
                    active: true,
                  };
                  const existing = (siteConfig.promoCodes || []).filter(
                    (p) => p.code.toUpperCase() !== cleanCode
                  );
                  updateSiteConfig({ promoCodes: [...existing, nextPromo] });
                  setNewPromoCode('');
                  showNotice(`Promo code "${cleanCode}" saved.`);
                }}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3"
              >
                <input
                  type="text"
                  placeholder="Code (e.g. VIP50)"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono font-bold uppercase"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Discount %"
                  value={newPromoPercent}
                  onChange={(e) => setNewPromoPercent(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newPromoDesc}
                  onChange={(e) => setNewPromoDesc(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                />
                <button
                  type="submit"
                  className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Add Promo Code
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(siteConfig.promoCodes || []).map((promo) => (
                  <div
                    key={promo.code}
                    className="p-3 rounded-xl bg-white/85 border border-emerald-500/15 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-emerald-700">
                          {promo.code}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          -{promo.discountPercent}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{promo.description}</div>
                    </div>
                    <button
                      onClick={() => {
                        updateSiteConfig({
                          promoCodes: siteConfig.promoCodes.filter((p) => p.code !== promo.code),
                        });
                        showNotice(`Removed promo code ${promo.code}.`);
                      }}
                      className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Manual Order + Master Order Ledger */}
            <div className="surface-glass-card p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Master Order &amp; Escrow Ledger ({orders.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Inject manual orders, override order states, release escrow funds, or cancel orders.
                  </p>
                </div>
                {orders.length > 0 && (
                  <button
                    onClick={() => {
                      clearAllOrders();
                      showNotice('All orders cleared.');
                    }}
                    className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 cursor-pointer"
                  >
                    Clear All Orders
                  </button>
                )}
              </div>

              {/* Manual Order Creator */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!manOrdTitle.trim()) return;
                  const priceNum = Math.max(1, Number(manOrdPrice) || 25);
                  const feeNum = Math.round(priceNum * (siteConfig.platformFeePercent / 100) * 100) / 100;
                  adminCreateOrder({
                    listingId: `lst_manual_${Date.now()}`,
                    listingTitle: manOrdTitle.trim(),
                    gameTitle: manOrdGame.trim() || games[0]?.title || 'General',
                    serviceType: 'Game Accounts',
                    sellerUsername: manOrdSeller.trim() || 'PolarithOfficial',
                    sellerId: 'seller_admin',
                    quantity: 1,
                    unitPrice: priceNum,
                    subtotal: priceNum,
                    fee: feeNum,
                    total: priceNum + feeNum,
                    status: manOrdStatus,
                    deliveryInstructions: 'Created manually via Admin God Mode.',
                    characterOrUid: manOrdBuyer.trim() || 'Buyer#0001',
                    timerSecondsRemaining: siteConfig.defaultEscrowSeconds || 3600,
                  });
                  setManOrdTitle('');
                  showNotice('Manual escrow order created.');
                }}
                className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-500/15 grid grid-cols-1 sm:grid-cols-6 gap-2.5"
              >
                <input
                  type="text"
                  placeholder="Order Item Title..."
                  value={manOrdTitle}
                  onChange={(e) => setManOrdTitle(e.target.value)}
                  className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-white border border-emerald-500/20 text-xs font-bold"
                />
                <input
                  type="text"
                  placeholder="Game Name"
                  value={manOrdGame}
                  onChange={(e) => setManOrdGame(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-emerald-500/20 text-xs"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price USD"
                  value={manOrdPrice}
                  onChange={(e) => setManOrdPrice(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-emerald-500/20 text-xs font-mono"
                />
                <select
                  value={manOrdStatus}
                  onChange={(e) => setManOrdStatus(e.target.value as Order['status'])}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-500/20 text-xs font-bold"
                >
                  <option value="Preparing">Preparing</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Completed">Completed</option>
                  <option value="Disputed">Disputed</option>
                </select>
                <button
                  type="submit"
                  className="btn-glass-primary px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  + Inject Order
                </button>
              </form>

              {orders.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">
                  No escrow orders recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-xl bg-white/85 border border-emerald-500/15 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-slate-900">#{ord.id}</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                            {ord.status}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600 font-semibold">{ord.gameTitle}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-900">{ord.listingTitle}</div>
                        <div className="text-xs font-mono text-slate-500">
                          Seller: {ord.sellerUsername} · Buyer UID: {ord.characterOrUid} · Subtotal:{' '}
                          <strong>${ord.subtotal.toFixed(2)}</strong> · Fee: ${ord.fee.toFixed(2)} · Total:{' '}
                          <strong className="text-emerald-700">${ord.total.toFixed(2)}</strong>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {(
                          ['Preparing', 'Delivered', 'Completed', 'Disputed', 'Cancelled'] as Order['status'][]
                        ).map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              adminUpdateOrder(ord.id, { status: st });
                              showNotice(`Order #${ord.id} status set to ${st}.`);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                              ord.status === st
                                ? 'bg-emerald-600 text-white'
                                : 'btn-glass-light text-slate-700'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            adminDeleteOrder(ord.id);
                            showNotice(`Order #${ord.id} deleted.`);
                          }}
                          className="btn-glass-light px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-600 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: LIVE CHATS & HEADER NOTIFICATION BELL BROADCAST */}
        {activeTab === 'chats' && (
          <div className="space-y-6">
            {/* Global Notification Bell Broadcast */}
            <div className="surface-glass-card p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Header Notification Bell Broadcast ({(siteConfig.customNotifications || []).length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Push custom alerts directly into the Header Notification Bell dropdown for all users.
                  </p>
                </div>
                {(siteConfig.customNotifications || []).length > 0 && (
                  <button
                    onClick={() => {
                      updateSiteConfig({ customNotifications: [] });
                      showNotice('Cleared all custom notifications.');
                    }}
                    className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 cursor-pointer"
                  >
                    Clear Alerts
                  </button>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!alertTitle.trim() || !alertMessage.trim()) return;
                  const item: CustomNotificationItem = {
                    id: `alert_${Date.now()}`,
                    title: alertTitle.trim(),
                    message: alertMessage.trim(),
                    badge: alertBadge.trim() || 'OFFICIAL',
                    timestamp: new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  };
                  updateSiteConfig({
                    customNotifications: [item, ...(siteConfig.customNotifications || [])],
                  });
                  setAlertTitle('');
                  setAlertMessage('');
                  showNotice('Alert broadcast to Header Notification Bell.');
                }}
                className="grid grid-cols-1 md:grid-cols-12 gap-3"
              >
                <input
                  type="text"
                  placeholder="Alert Title (e.g. Flash Sale Active)"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  className="md:col-span-3 px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                />
                <input
                  type="text"
                  placeholder="Badge (e.g. SYSTEM)"
                  value={alertBadge}
                  onChange={(e) => setAlertBadge(e.target.value)}
                  className="md:col-span-2 px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                />
                <input
                  type="text"
                  placeholder="Notification message details..."
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  className="md:col-span-5 px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                />
                <button
                  type="submit"
                  className="md:col-span-2 btn-glass-primary py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Push Alert
                </button>
              </form>

              {(siteConfig.customNotifications || []).length > 0 && (
                <div className="space-y-2">
                  {siteConfig.customNotifications.map((al) => (
                    <div
                      key={al.id}
                      className="p-3 rounded-xl bg-white/85 border border-emerald-500/15 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-emerald-700 mr-2">
                          [{al.badge}]
                        </span>
                        <strong className="text-slate-900">{al.title}:</strong>{' '}
                        <span className="text-slate-600">{al.message}</span>
                      </div>
                      <button
                        onClick={() =>
                          updateSiteConfig({
                            customNotifications: siteConfig.customNotifications.filter(
                              (x) => x.id !== al.id
                            ),
                          })
                        }
                        className="text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Trade Chat Monitor & Multi-Role Injector */}
            <div className="surface-glass-card p-6 rounded-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Live Trade Chat Monitor &amp; Multi-Role Message Injector ({conversations.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Create chat threads, inspect messages, or send messages as Admin, Seller, or Buyer.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newConvUsername.trim()) return;
                    adminCreateConversation(newConvUsername, newConvOrderId);
                    setNewConvUsername('');
                    setNewConvOrderId('');
                    showNotice('New trade chat room created.');
                  }}
                  className="flex flex-wrap gap-2"
                >
                  <input
                    type="text"
                    placeholder="Trader Username..."
                    value={newConvUsername}
                    onChange={(e) => setNewConvUsername(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Order ID (Optional)"
                    value={newConvOrderId}
                    onChange={(e) => setNewConvOrderId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    + Open Chat Room
                  </button>
                </form>
              </div>

              {conversations.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">
                  No active chat conversations yet. Use "+ Open Chat Room" above to start one.
                </p>
              ) : (
                <div className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const targetId = selectedConvId || conversations[0]?.id;
                      if (!targetId || !adminChatText.trim()) return;
                      adminSendSystemMessage(
                        targetId,
                        adminChatText,
                        adminMilestoneTitle,
                        adminSenderRole
                      );
                      setAdminChatText('');
                      showNotice('Message injected into trade chat.');
                    }}
                    className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-500/20 grid grid-cols-1 md:grid-cols-12 gap-2.5"
                  >
                    <select
                      value={selectedConvId || conversations[0]?.id || ''}
                      onChange={(e) => setSelectedConvId(e.target.value)}
                      className="md:col-span-3 px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                    >
                      {conversations.map((c) => (
                        <option key={c.id} value={c.id}>
                          Chat: {c.withUser.username} ({c.orderId || c.id})
                        </option>
                      ))}
                    </select>
                    <select
                      value={adminSenderRole}
                      onChange={(e) => setAdminSenderRole(e.target.value as any)}
                      className="md:col-span-2 px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-bold"
                    >
                      <option value="system">Send as Admin</option>
                      <option value="seller">Send as Seller</option>
                      <option value="buyer">Send as Buyer</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Milestone Title"
                      value={adminMilestoneTitle}
                      onChange={(e) => setAdminMilestoneTitle(e.target.value)}
                      className="md:col-span-2 px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                    />
                    <div className="md:col-span-5 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write message to inject..."
                        value={adminChatText}
                        onChange={(e) => setAdminChatText(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                      />
                      <button
                        type="submit"
                        className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0"
                      >
                        Send
                      </button>
                    </div>
                  </form>

                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="p-4 rounded-xl bg-white/85 border border-emerald-500/15 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-extrabold text-slate-900">
                          Participant: {conv.withUser.username} · Order: {conv.orderId || 'General'} · Status:{' '}
                          <span className="text-emerald-700">{conv.orderStatus || 'Active'}</span>
                        </div>
                        <button
                          onClick={() => {
                            adminDeleteConversation(conv.id);
                            showNotice('Conversation deleted.');
                          }}
                          className="btn-glass-light px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-600 cursor-pointer"
                        >
                          Delete Thread
                        </button>
                      </div>
                      <div className="max-h-44 overflow-y-auto space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                        {conv.messages.map((m) => (
                          <div
                            key={m.id}
                            className="text-xs flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-mono font-bold text-emerald-700">
                                [{m.senderName} · {m.timestamp}]:
                              </span>{' '}
                              <span className="text-slate-700">{m.text}</span>
                            </div>
                            <button
                              onClick={() => adminDeleteMessage(conv.id, m.id)}
                              className="text-[10px] text-red-500 hover:underline shrink-0 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: LOCALIZATION & FULL SNAPSHOT BACKUP */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="surface-glass-card p-6 rounded-2xl space-y-4">
              <h2 className="text-base font-extrabold text-slate-900">
                Default Region, Language, Currency &amp; Exchange Rate Control
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Region</label>
                  <input
                    type="text"
                    value={localization.region}
                    onChange={(e) => updateLocalization({ region: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Region Code
                  </label>
                  <input
                    type="text"
                    value={localization.regionCode}
                    onChange={(e) => updateLocalization({ regionCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
                  <input
                    type="text"
                    value={localization.language}
                    onChange={(e) => updateLocalization({ language: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Currency Code
                  </label>
                  <input
                    type="text"
                    value={localization.currency}
                    onChange={(e) => updateLocalization({ currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={localization.currencySymbol}
                    onChange={(e) => updateLocalization({ currencySymbol: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Exchange Rate (vs USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={localization.exchangeRate}
                    onChange={(e) =>
                      updateLocalization({
                        exchangeRate: Math.max(0.01, Number(e.target.value) || 1),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="surface-glass-card p-6 rounded-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Full Website State Snapshot (Download / Upload / Factory Wipe)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Export 100% of your website configurations, games, icons, categories, listings, orders, and chats to a JSON file or restore from backup.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const exported = exportSiteSnapshot();
                      setSnapshotJson(exported);
                      showNotice('Website snapshot generated in the JSON box below.');
                    }}
                    className="btn-glass-light px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Generate JSON in Box
                  </button>
                  <button
                    onClick={handleDownloadSnapshotFile}
                    className="btn-glass-primary px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Download .JSON File
                  </button>
                  <label className="btn-glass-light px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer">
                    <span>Upload .JSON File</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleUploadSnapshotFile}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => {
                      if (!snapshotJson.trim()) {
                        showNotice('Paste a JSON snapshot below first.');
                        return;
                      }
                      const ok = importSiteSnapshot(snapshotJson);
                      showNotice(
                        ok
                          ? 'Snapshot imported! All website settings & data updated.'
                          : 'Invalid JSON snapshot format.'
                      );
                    }}
                    className="btn-glass-light px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Import from Box
                  </button>
                  <button
                    onClick={async () => {
                      await clearFirebaseData();
                      resetSiteConfig();
                      resetGames();
                      resetServiceCategories();
                      showNotice('Complete factory reset executed.');
                    }}
                    className="btn-glass-light px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 cursor-pointer"
                  >
                    Factory Reset Website
                  </button>
                </div>
              </div>

              <textarea
                rows={10}
                value={snapshotJson}
                onChange={(e) => setSnapshotJson(e.target.value)}
                placeholder="Click 'Generate JSON in Box' or 'Download .JSON File' to backup current website state, or paste a JSON snapshot here and click 'Import from Box'..."
                className="w-full p-3.5 rounded-xl bg-white border border-emerald-500/20 text-xs font-mono text-slate-800"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
