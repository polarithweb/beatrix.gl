import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ServiceVertical } from '../types/marketplace';
import {
  CategoryIconSvg,
  EscrowShieldSvg,
  InstantZapSvg,
} from '../components/CustomIcons';
import {
  Package,
  Plus,
  ShoppingBag,
  Wallet,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  Key,
  Upload,
  FileCheck,
  AlertCircle,
  UserCheck,
  ArrowRight,
} from 'lucide-react';

function compressImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const resultStr = typeof reader.result === 'string' ? reader.result : '';
      if (!resultStr.startsWith('data:image/')) {
        resolve(resultStr);
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(resultStr);
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(resultStr);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = resultStr;
    };
    reader.readAsDataURL(file);
  });
}

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    isApprovedSeller,
    currentSellerApplication,
    submitSellerApplication,
    games: TRENDING_GAMES,
    serviceCategories: SERVICE_VERTICALS,
    orders,
    listings,
    availableBalance,
    pendingEscrowBalance,
    formatCurrency,
    addListing,
    updateListingInline,
    deleteListing,
    confirmOrderReceived,
    navigateTo,
  } = useMarketplace();

  // Seller KYC Application Form State
  const [kycFullName, setKycFullName] = useState(
    currentSellerApplication?.fullName || currentUser?.displayName || ''
  );
  const [kycUsername, setKycUsername] = useState(
    currentSellerApplication?.username ||
      currentUser?.displayName?.replace(/\s+/g, '') ||
      ''
  );
  const [kycEmail, setKycEmail] = useState(
    currentSellerApplication?.email || currentUser?.email || ''
  );
  const [kycPhone, setKycPhone] = useState(currentSellerApplication?.phone || '');
  const [kycAadhaarNumber, setKycAadhaarNumber] = useState(
    currentSellerApplication?.aadhaarNumber || ''
  );
  const [kycAadhaarImage, setKycAadhaarImage] = useState(
    currentSellerApplication?.aadhaarImageUrl || ''
  );
  const [kycPayoutDetails, setKycPayoutDetails] = useState(
    currentSellerApplication?.payoutDetails || ''
  );
  const [kycFileName, setKycFileName] = useState('');
  const [kycError, setKycError] = useState<string | null>(null);
  const [isEditingApplication, setIsEditingApplication] = useState(false);

  // Approved Seller Portal State
  const [activeSection, setActiveSection] = useState<
    'manage_listings' | 'create_listing' | 'sold_orders' | 'wallet'
  >('manage_listings');

  const [orderStatusFilter, setOrderStatusFilter] = useState<
    'All' | 'Preparing' | 'Delivered' | 'Completed' | 'Disputed'
  >('All');

  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [inlinePrice, setInlinePrice] = useState<number>(0);
  const [inlineStock, setInlineStock] = useState<number>(0);
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(null);

  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizServiceType, setWizServiceType] = useState<ServiceVertical>('Game Accounts');
  const [wizGameId, setWizGameId] = useState(TRENDING_GAMES[0]?.id || '');
  const [wizCustomGameTitle, setWizCustomGameTitle] = useState('');
  const [wizServer, setWizServer] = useState('Global');
  const [wizPlatform] = useState('PC');
  const [wizTitle, setWizTitle] = useState('');
  const [wizDesc, setWizDesc] = useState('');
  const [wizPrice, setWizPrice] = useState('45.00');
  const [wizStock, setWizStock] = useState(1);
  const [wizSpeed, setWizSpeed] = useState<'Instant' | '15 mins' | '1 hour'>('Instant');
  const [wizSecretKey, setWizSecretKey] = useState('');
  const [wizError, setWizError] = useState<string | null>(null);

  const selectedGameObj =
    TRENDING_GAMES.find((g) => g.id === wizGameId) || TRENDING_GAMES[0] || null;

  const showNotice = (msg: string) => {
    setDashboardNotice(msg);
    setTimeout(() => setDashboardNotice(null), 3500);
  };

  const handleAadhaarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFileToDataUrl(file);
      setKycAadhaarImage(dataUrl);
      setKycFileName(file.name);
      setKycError(null);
    } catch {
      setKycError('Could not load image file. Please select a valid JPG/PNG image.');
    }
    e.target.value = '';
  };

  const handleSellerKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (kycFullName.trim().length < 2) {
      setKycError('Please enter your full legal name.');
      return;
    }
    if (kycPhone.trim().length < 6) {
      setKycError('Please enter a valid phone / WhatsApp number.');
      return;
    }
    if (kycAadhaarNumber.trim().length < 4) {
      setKycError('Please enter your Aadhaar card number.');
      return;
    }
    if (!kycAadhaarImage) {
      setKycError('Please upload your Aadhaar card picture.');
      return;
    }
    if (kycPayoutDetails.trim().length < 3) {
      setKycError('Please enter your UPI ID or bank payout details.');
      return;
    }

    setKycError(null);
    submitSellerApplication({
      fullName: kycFullName,
      username: kycUsername || kycFullName.split(' ')[0],
      email: kycEmail || 'seller@beatrix.gl',
      phone: kycPhone,
      aadhaarNumber: kycAadhaarNumber,
      aadhaarImageUrl: kycAadhaarImage,
      payoutDetails: kycPayoutDetails,
    });
    setIsEditingApplication(false);
  };

  // GATE: Visitor is ONLY a buyer until authorized as a seller
  if (!isApprovedSeller) {
    const isPending =
      currentSellerApplication?.status === 'pending' && !isEditingApplication;
    const isRejected = currentSellerApplication?.status === 'rejected';

    return (
      <div className="min-h-screen bg-white text-slate-900 pb-20 w-full max-w-[100vw] overflow-x-hidden">
        <div className="bg-white border-b border-sky-200 py-5 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-lg sm:text-xl text-slate-900">
                  Seller Registration & Verification
                </h1>
                <p className="text-xs text-slate-500">
                  Seller accounts require identity verification before listing items on Beatrix.gl
                </p>
              </div>
            </div>

            <button
              onClick={() => navigateTo('marketplace')}
              className="btn-glass-light px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-sky-700" />
              <span>Continue as Buyer</span>
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
          {isPending && currentSellerApplication ? (
            <div className="surface-glass-card rounded-2xl p-6 sm:p-8 space-y-6 bg-white">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-sky-100 pb-5">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold bg-sky-100 text-sky-800 border border-sky-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Verification Pending Authorization</span>
                  </span>
                  <h2 className="text-xl font-black text-slate-900 pt-2">
                    Your Seller Application is Under Review
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Your details and Aadhaar card document have been submitted for seller authorization. You can still browse and buy any item as a Buyer while your seller account is reviewed.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">Full Name</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {currentSellerApplication.fullName}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">
                    Seller Username
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {currentSellerApplication.username}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">
                    Email & Phone
                  </div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {currentSellerApplication.email} · {currentSellerApplication.phone}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-sky-50/50 border border-sky-200">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">
                    Aadhaar Number
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {currentSellerApplication.aadhaarNumber}
                  </div>
                </div>
              </div>

              {currentSellerApplication.aadhaarImageUrl && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">
                    Uploaded Aadhaar Card Document:
                  </div>
                  <div className="rounded-2xl border border-sky-200 p-3 bg-white max-w-md">
                    <img
                      src={currentSellerApplication.aadhaarImageUrl}
                      alt="Uploaded Aadhaar Card"
                      className="w-full max-h-56 object-contain rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigateTo('marketplace')}
                  className="btn-glass-primary px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Shop as Buyer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditingApplication(true)}
                  className="btn-glass-light px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Update Application Details
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSellerKycSubmit}
              className="surface-glass-card rounded-2xl p-6 sm:p-8 space-y-5 bg-white"
            >
              <div className="space-y-1 border-b border-sky-100 pb-4">
                <h2 className="text-xl font-black text-slate-900">
                  Apply for Seller Account Authorization
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Every visitor on Beatrix.gl starts as a Buyer. To sell items, please submit your details and upload your Aadhaar card picture below for verification.
                </p>
              </div>

              {isRejected && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Previous Seller Application Was Declined</span>
                  </div>
                  {currentSellerApplication?.adminNote && (
                    <p>Reason: {currentSellerApplication.adminNote}</p>
                  )}
                  <p>Please review your details and Aadhaar image below and submit again.</p>
                </div>
              )}

              {kycError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{kycError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Legal Name (As on Aadhaar) *
                  </label>
                  <input
                    type="text"
                    required
                    value={kycFullName}
                    onChange={(e) => setKycFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-sky-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Seller Storefront Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={kycUsername}
                    onChange={(e) => setKycUsername(e.target.value)}
                    placeholder="e.g. ProGamerStore"
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-sky-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={kycEmail}
                    onChange={(e) => setKycEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-sky-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={kycPhone}
                    onChange={(e) => setKycPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-sky-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Aadhaar Card Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={kycAadhaarNumber}
                    onChange={(e) => setKycAadhaarNumber(e.target.value)}
                    placeholder="XXXX XXXX XXXX"
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-sky-300 text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Payout UPI ID / Bank Details *
                  </label>
                  <input
                    type="text"
                    required
                    value={kycPayoutDetails}
                    onChange={(e) => setKycPayoutDetails(e.target.value)}
                    placeholder="yourname@upi or Bank A/C & IFSC"
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-sky-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Aadhaar Card Picture Upload */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Aadhaar Card Picture (Upload File) *
                </label>
                <div className="p-4 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-sky-700" />
                      <span>
                        {kycFileName
                          ? `Uploaded: ${kycFileName}`
                          : 'Upload clear photo/scan of your Aadhaar Card'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Supported formats: JPG, PNG, WEBP.
                    </p>
                  </div>

                  <label className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Aadhaar Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAadhaarFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {kycAadhaarImage && (
                  <div className="mt-3 p-3 rounded-2xl border border-sky-200 bg-white max-w-sm space-y-1.5">
                    <div className="text-[11px] font-bold text-sky-800 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Aadhaar Card Preview Ready</span>
                    </div>
                    <img
                      src={kycAadhaarImage}
                      alt="Aadhaar Preview"
                      className="w-full max-h-48 object-contain rounded-xl border border-sky-100"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-sky-100">
                <button
                  type="button"
                  onClick={() => navigateTo('home')}
                  className="btn-glass-light px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Back to Home
                </button>

                <button
                  type="submit"
                  className="btn-glass-primary px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Submit Seller Verification</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // APPROVED SELLER PORTAL
  const handleStartInlineEdit = (item: any) => {
    setEditingListingId(item.id);
    setInlinePrice(item.price);
    setInlineStock(item.stock);
  };

  const handleSaveInlineEdit = async (id: string) => {
    await updateListingInline(id, { price: inlinePrice, stock: inlineStock });
    setEditingListingId(null);
    showNotice('Listing rate and stock updated.');
  };

  const handleCreateListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wizTitle.trim().length < 3) {
      setWizError('Please enter a descriptive listing title (at least 3 characters).');
      setWizardStep(2);
      return;
    }
    const resolvedGameTitle =
      selectedGameObj?.title || wizCustomGameTitle.trim() || 'General Gaming';
    const resolvedGameId =
      selectedGameObj?.id ||
      resolvedGameTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '') ||
      'general';

    setWizError(null);
    await addListing({
      title: wizTitle.trim(),
      gameId: resolvedGameId,
      gameTitle: resolvedGameTitle,
      serviceType: wizServiceType,
      price: Number(wizPrice) || 25,
      currency: 'USD',
      stock: wizStock,
      minPurchase: 1,
      deliverySpeed: wizSpeed,
      deliveryMethod: wizSpeed === 'Instant' ? 'Automated' : 'Manual Transfer',
      isFungible: wizServiceType === 'Game Coins' || wizServiceType === 'Top Up',
      attributes: {
        region: wizServer,
        platform: wizPlatform,
      },
      media: [],
      specifications: {
        'Server / Region': wizServer,
        Platform: wizPlatform,
        'Auto Delivery': wizSecretKey ? 'Enabled via Vault' : 'Manual Transfer',
      },
      description: wizDesc || 'Verified gaming listing protected by Beatrix.gl escrow.',
      reviews: [],
    });

    showNotice('Listing published to live marketplace.');
    setActiveSection('manage_listings');
    setWizardStep(1);
    setWizTitle('');
    setWizDesc('');
  };

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'All' && o.status !== orderStatusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 w-full max-w-[100vw] overflow-x-hidden">
      {/* Top Banner */}
      <div className="bg-white border-b border-sky-200 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <EscrowShieldSvg className="w-6 h-6 shrink-0" />
            <div>
              <h1 className="font-black text-base sm:text-lg tracking-tight truncate">
                Beatrix.gl Seller Portal
              </h1>
              <p className="text-[11px] text-sky-700 font-semibold">
                Authorized Seller: {currentSellerApplication?.username || currentUser?.displayName || 'Verified Seller'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {dashboardNotice && (
              <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1 rounded-xl">
                {dashboardNotice}
              </span>
            )}
            <button
              onClick={() => {
                setActiveSection('create_listing');
                setWizardStep(1);
              }}
              className="btn-glass-primary h-9 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Listing</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Vertical Sidebar */}
          <div className="lg:col-span-3 surface-glass-card rounded-2xl p-4 space-y-5 bg-white">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                Seller Controls
              </div>
              <div className="space-y-1.5 text-xs font-semibold">
                <button
                  onClick={() => setActiveSection('manage_listings')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer ${
                    activeSection === 'manage_listings'
                      ? 'btn-glass-primary'
                      : 'btn-glass-light'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4" />
                    <span>Manage Listings</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold">{listings.length}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSection('create_listing');
                    setWizardStep(1);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer ${
                    activeSection === 'create_listing'
                      ? 'btn-glass-primary'
                      : 'btn-glass-light'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="w-4 h-4" />
                    <span>Create New Offer</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('sold_orders')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer ${
                    activeSection === 'sold_orders'
                      ? 'btn-glass-primary'
                      : 'btn-glass-light'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Sold Orders</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold">{orders.length}</span>
                </button>

                <button
                  onClick={() => setActiveSection('wallet')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer ${
                    activeSection === 'wallet'
                      ? 'btn-glass-primary'
                      : 'btn-glass-light'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4" />
                    <span>Seller Wallet</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold">
                    {formatCurrency(availableBalance)}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Workspace */}
          <div className="lg:col-span-9 space-y-6">
            {/* KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="surface-glass-card rounded-2xl p-4 bg-white">
                <span className="text-xs font-medium text-slate-500">Available Balance</span>
                <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                  {formatCurrency(availableBalance)}
                </div>
              </div>

              <div className="surface-glass-card rounded-2xl p-4 bg-white">
                <span className="text-xs font-medium text-slate-500">In Escrow</span>
                <div className="text-2xl font-black font-mono text-sky-700 mt-1">
                  {formatCurrency(pendingEscrowBalance)}
                </div>
              </div>

              <div className="surface-glass-card rounded-2xl p-4 bg-white">
                <span className="text-xs font-medium text-slate-500">Active Listings</span>
                <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                  {listings.length}
                </div>
              </div>
            </div>

            {/* Section 1: Manage Listings */}
            {activeSection === 'manage_listings' && (
              <div className="surface-glass-card rounded-2xl p-5 space-y-4 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">
                    Active Marketplace Inventory ({listings.length})
                  </h2>
                  <button
                    onClick={() => {
                      setActiveSection('create_listing');
                      setWizardStep(1);
                    }}
                    className="btn-glass-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Listing</span>
                  </button>
                </div>

                {listings.length === 0 ? (
                  <div className="py-10 text-center space-y-3">
                    <p className="text-sm font-bold text-slate-800">No active listings yet</p>
                    <button
                      onClick={() => {
                        setActiveSection('create_listing');
                        setWizardStep(1);
                      }}
                      className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create First Listing</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {listings.map((item) => {
                      const isEditing = editingListingId === item.id;
                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl border border-sky-200 bg-white flex flex-wrap items-center justify-between gap-4"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="font-bold text-sm text-slate-900">{item.title}</div>
                            <div className="text-xs text-slate-500">
                              {item.gameTitle} · {item.serviceType} · {item.deliverySpeed}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {isEditing ? (
                              <>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={inlinePrice}
                                  onChange={(e) => setInlinePrice(Number(e.target.value))}
                                  className="w-24 h-8 px-2 rounded-lg bg-white border border-sky-400 text-xs font-mono"
                                />
                                <input
                                  type="number"
                                  value={inlineStock}
                                  onChange={(e) => setInlineStock(Number(e.target.value))}
                                  className="w-16 h-8 px-2 rounded-lg bg-white border border-sky-400 text-xs font-mono"
                                />
                                <button
                                  onClick={() => handleSaveInlineEdit(item.id)}
                                  className="btn-glass-primary px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Save
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="font-mono font-black text-sm text-slate-900 mr-2">
                                  {formatCurrency(item.price)} (Stock: {item.stock})
                                </span>
                                <button
                                  onClick={() => handleStartInlineEdit(item)}
                                  className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => deleteListing(item.id)}
                                  className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
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
            )}

            {/* Section 2: Create New Offer */}
            {activeSection === 'create_listing' && (
              <div className="surface-glass-card rounded-2xl p-6 space-y-6 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 pb-4">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Publish New Marketplace Offer
                  </h2>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setWizardStep(s as 1 | 2 | 3)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          wizardStep === s ? 'btn-glass-primary' : 'btn-glass-light'
                        }`}
                      >
                        Step {s}
                      </button>
                    ))}
                  </div>
                </div>

                {wizError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                    {wizError}
                  </div>
                )}

                <form onSubmit={handleCreateListingSubmit} className="space-y-5">
                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          Select Service Category
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {SERVICE_VERTICALS.map((v) => (
                            <button
                              key={v.name}
                              type="button"
                              onClick={() => setWizServiceType(v.name as ServiceVertical)}
                              className={`p-3 rounded-xl text-left text-xs font-bold flex items-center gap-2 cursor-pointer ${
                                wizServiceType === v.name
                                  ? 'btn-glass-primary'
                                  : 'btn-glass-light'
                              }`}
                            >
                              <CategoryIconSvg category={v.name} className="w-4 h-4 shrink-0" />
                              <span className="truncate">{v.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Game Title
                          </label>
                          {TRENDING_GAMES.length > 0 ? (
                            <select
                              value={wizGameId}
                              onChange={(e) => setWizGameId(e.target.value)}
                              className="w-full h-10 px-3 rounded-xl bg-white border border-sky-300 text-xs text-slate-900"
                            >
                              {TRENDING_GAMES.map((g) => (
                                <option key={g.id} value={g.id}>
                                  {g.title}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={wizCustomGameTitle}
                              onChange={(e) => setWizCustomGameTitle(e.target.value)}
                              placeholder="Enter Game Name"
                              className="w-full h-10 px-3 rounded-xl bg-white border border-sky-300 text-xs text-slate-900"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Server / Region
                          </label>
                          <input
                            type="text"
                            value={wizServer}
                            onChange={(e) => setWizServer(e.target.value)}
                            placeholder="Global / NA / EU"
                            className="w-full h-10 px-3 rounded-xl bg-white border border-sky-300 text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="btn-glass-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Continue to Step 2
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Offer Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={wizTitle}
                          onChange={(e) => setWizTitle(e.target.value)}
                          placeholder="e.g. Verified Level 100 Account · Instant Delivery"
                          className="w-full h-10 px-3.5 rounded-xl bg-white border border-sky-300 text-xs sm:text-sm text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Price (USD)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={wizPrice}
                            onChange={(e) => setWizPrice(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-white border border-sky-300 text-xs font-mono text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={wizStock}
                            onChange={(e) => setWizStock(Number(e.target.value))}
                            className="w-full h-10 px-3 rounded-xl bg-white border border-sky-300 text-xs font-mono text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Delivery Speed
                          </label>
                          <select
                            value={wizSpeed}
                            onChange={(e) => setWizSpeed(e.target.value as any)}
                            className="w-full h-10 px-3 rounded-xl bg-white border border-sky-300 text-xs text-slate-900"
                          >
                            <option value="Instant">Instant</option>
                            <option value="15 mins">15 mins</option>
                            <option value="1 hour">1 hour</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Offer Description
                        </label>
                        <textarea
                          rows={3}
                          value={wizDesc}
                          onChange={(e) => setWizDesc(e.target.value)}
                          placeholder="Describe your item, delivery instructions, and inclusions..."
                          className="w-full p-3 rounded-xl bg-white border border-sky-300 text-xs text-slate-900"
                        />
                      </div>

                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="btn-glass-light px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="btn-glass-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Continue to Step 3
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-sky-700" />
                          <span>Automated Delivery Credentials / Vault Payload (Optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={wizSecretKey}
                          onChange={(e) => setWizSecretKey(e.target.value)}
                          placeholder="Paste gift code or account credentials for instant dispatch after buyer payment..."
                          className="w-full p-3 rounded-xl bg-white border border-sky-300 text-xs font-mono text-slate-900"
                        />
                      </div>

                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="btn-glass-light px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="btn-glass-primary px-6 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer"
                        >
                          Publish Offer Live
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Section 3: Sold Orders */}
            {activeSection === 'sold_orders' && (
              <div className="surface-glass-card rounded-2xl p-5 space-y-4 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">
                    Orders ({filteredOrders.length})
                  </h2>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['All', 'Preparing', 'Delivered', 'Completed', 'Disputed'] as const).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => setOrderStatusFilter(st)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            orderStatusFilter === st ? 'btn-glass-primary' : 'btn-glass-light'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-500">
                    No matching orders found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl border border-sky-200 bg-white flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-mono text-xs font-bold text-sky-700">
                            #{ord.id} · {ord.status}
                          </div>
                          <div className="font-bold text-sm text-slate-900">
                            {ord.listingTitle}
                          </div>
                          <div className="text-xs text-slate-500">
                            {ord.gameTitle} · Qty {ord.quantity}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-900">
                            {formatCurrency(ord.total)}
                          </span>
                          {ord.status !== 'Completed' && (
                            <button
                              onClick={() => confirmOrderReceived(ord.id)}
                              className="btn-glass-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section 4: Wallet */}
            {activeSection === 'wallet' && (
              <div className="surface-glass-card rounded-2xl p-6 space-y-4 bg-white">
                <h2 className="text-base font-extrabold text-slate-900">Seller Payout Wallet</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40">
                    <div className="text-xs text-slate-500">Available for Withdrawal</div>
                    <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                      {formatCurrency(availableBalance)}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40">
                    <div className="text-xs text-slate-500">Registered Payout Account</div>
                    <div className="text-sm font-bold text-slate-900 mt-1">
                      {currentSellerApplication?.payoutDetails || 'Verified Payout Method'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
