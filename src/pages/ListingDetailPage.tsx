import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { EscrowShieldSvg, InstantZapSvg } from '../components/CustomIcons';
import {
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Share2,
  Flag,
  Minus,
  Plus,
  ShoppingCart,
  ChevronDown,
  Maximize2,
  X,
} from 'lucide-react';

export const ListingDetailPage: React.FC = () => {
  const {
    selectedListing,
    listings,
    initiateCheckout,
    openChatForSeller,
    formatCurrency,
    navigateTo,
  } = useMarketplace();

  const listing = selectedListing || listings[0] || null;

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [characterIdInput, setCharacterIdInput] = useState('');
  const [charInputError, setCharInputError] = useState('');
  const [gamerProtectAccordionOpen, setGamerProtectAccordionOpen] = useState(true);

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="p-10 surface-glass-card rounded-2xl text-center space-y-4">
          <EscrowShieldSvg className="w-12 h-12 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">No Listing Selected</h2>
          <p className="text-xs text-slate-500">
            There is no active offer selected. Browse the marketplace or publish a new listing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigateTo('marketplace')}
              className="btn-glass-light px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Browse Marketplace
            </button>
            <button
              onClick={() => navigateTo('dashboard')}
              className="btn-glass-primary px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Offer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleQtyChange = (delta: number) => {
    setQuantity((prev) =>
      Math.min(listing.stock, Math.max(listing.minPurchase || 1, prev + delta))
    );
  };

  const handleBuyNow = () => {
    if (listing.isFungible && !characterIdInput.trim()) {
      setCharInputError('Please enter your Character Name, Riot ID, or Player UID to continue.');
      return;
    }
    setCharInputError('');
    initiateCheckout(listing, quantity, characterIdInput);
  };

  const subtotal = listing.price * quantity;

  return (
    <div className="pb-20 space-y-6 w-full max-w-[100vw] overflow-x-hidden">
      {/* Breadcrumb Bar */}
      <div className="bg-white/75 backdrop-blur-md border-b border-emerald-500/15 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button onClick={() => navigateTo('home')} className="hover:text-emerald-700 cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => navigateTo('game_hub', { gameId: listing.gameId })}
            className="hover:text-emerald-700 cursor-pointer"
          >
            {listing.gameTitle}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => navigateTo('marketplace', { category: listing.serviceType })}
            className="hover:text-emerald-700 cursor-pointer"
          >
            {listing.serviceType}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-xs">
            Offer #{listing.id}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column (8 cols): Product & Seller Details */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            {/* Offer Header */}
            <div className="surface-glass-card rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-700">{listing.serviceType}</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono text-slate-500">#{listing.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  {statusFeedback && (
                    <span className="text-xs font-semibold text-emerald-700 mr-1">
                      {statusFeedback}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      setStatusFeedback('Link copied');
                      setTimeout(() => setStatusFeedback(null), 2500);
                    }}
                    className="btn-glass-light p-2 rounded-xl text-slate-600 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setStatusFeedback('Offer flagged for review');
                      setTimeout(() => setStatusFeedback(null), 2500);
                    }}
                    className="btn-glass-light p-2 rounded-xl text-slate-600 cursor-pointer"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                {listing.title}
              </h1>
            </div>

            {/* Media Gallery */}
            {listing.media.length > 0 && (
              <div className="surface-glass-card rounded-2xl p-4 space-y-3">
                <div
                  onClick={() => setLightboxOpen(true)}
                  className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-50 border border-emerald-500/15 cursor-pointer group"
                >
                  <img
                    src={listing.media[activeMediaIndex] || listing.media[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/20">
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Inspect Proof</span>
                  </div>
                </div>

                {listing.media.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-1">
                    {listing.media.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveMediaIndex(idx)}
                        className={`w-24 aspect-[16/9] rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          activeMediaIndex === idx
                            ? 'border-emerald-600'
                            : 'border-transparent opacity-65 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Specifications Table */}
            <div className="surface-glass-card rounded-2xl p-5 sm:p-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4">
                Offer Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(listing.specifications).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-white/70 border border-emerald-500/10 flex flex-col justify-between"
                  >
                    <span className="text-[11px] text-slate-400 font-semibold">{key}</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description & Warnings */}
            <div className="surface-glass-card rounded-2xl p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                Seller Description
              </h3>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </div>

              {listing.warnings && listing.warnings.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Important Trade Safety Instructions</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-amber-900/90 space-y-1">
                    {listing.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Verified Seller Card */}
            <div className="surface-glass-card rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={listing.seller.avatar}
                    alt={listing.seller.username}
                    className="w-12 h-12 rounded-full object-cover border border-emerald-500/20"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-base text-slate-900">
                        {listing.seller.username}
                      </h4>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Verified Seller · {listing.seller.ratingPercentage}% Positive
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openChatForSeller(listing.seller.id)}
                  className="btn-glass-light px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chat with Seller</span>
                </button>
              </div>

              {listing.reviews.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-emerald-500/10">
                  {listing.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-xl bg-white/75 border border-emerald-500/10 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">
                            {rev.maskedBuyer}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-emerald-700">
                            {rev.rating}.0 / 5.0
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{rev.date}</span>
                      </div>
                      <p className="text-xs text-slate-600">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (4 cols): Sticky Frosted Purchase Box */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4 min-w-0">
            <div className="surface-glass-card rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-baseline justify-between border-b border-emerald-500/10 pb-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Total Price</span>
                  <div className="text-3xl font-black font-mono text-emerald-700 mt-0.5">
                    {formatCurrency(subtotal)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-xs font-bold text-emerald-700">
                    {listing.deliverySpeed === 'Instant' && (
                      <InstantZapSvg className="w-3.5 h-3.5" />
                    )}
                    <span>{listing.deliverySpeed} Delivery</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                    {listing.stock} in stock
                  </span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Quantity</span>
                  <span className="text-slate-400 font-mono">Max {listing.stock}</span>
                </div>
                <div className="flex items-center justify-between h-11 px-3 rounded-xl bg-white/80 border border-emerald-500/20">
                  <button
                    onClick={() => handleQtyChange(-1)}
                    disabled={quantity <= (listing.minPurchase || 1)}
                    className="btn-glass-light w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-sm text-slate-900">{quantity}</span>
                  <button
                    onClick={() => handleQtyChange(1)}
                    disabled={quantity >= listing.stock}
                    className="btn-glass-light w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Required Character / Riot ID Input (for fungible top-ups/coins) */}
              {listing.isFungible && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    In-Game Character / Riot ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={characterIdInput}
                    onChange={(e) => {
                      setCharacterIdInput(e.target.value);
                      if (charInputError) setCharInputError('');
                    }}
                    placeholder="e.g. PlayerOne#NA1"
                    className="w-full h-10 px-3.5 rounded-xl bg-white/90 border border-emerald-500/25 text-xs text-slate-900 focus:border-emerald-500 outline-hidden"
                  />
                  {charInputError && (
                    <p className="text-[11px] text-red-600 font-medium">{charInputError}</p>
                  )}
                </div>
              )}

              {/* Primary 3D Frosted Glass Buy CTA */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleBuyNow}
                  className="btn-glass-primary w-full h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy Now · {formatCurrency(subtotal)}</span>
                </button>

                <button
                  onClick={() => openChatForSeller(listing.seller.id)}
                  className="btn-glass-light w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Contact Seller Before Buying</span>
                </button>
              </div>

              {/* GamerProtect Accordion */}
              <div className="pt-3 border-t border-emerald-500/10">
                <button
                  onClick={() => setGamerProtectAccordionOpen(!gamerProtectAccordionOpen)}
                  className="w-full flex items-center justify-between text-left py-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <EscrowShieldSvg className="w-5 h-5" />
                    <span className="text-xs font-extrabold text-emerald-800">
                      GamerProtect Escrow Included
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      gamerProtectAccordionOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {gamerProtectAccordionOpen && (
                  <div className="mt-2.5 space-y-2 text-[11px] text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/60">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Payment is locked in escrow until you verify delivery.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Full refund guarantee if the seller misses the delivery SLA.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && listing.media.length > 0 && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full surface-glass-card rounded-2xl overflow-hidden p-2"
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="btn-glass-light absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={listing.media[activeMediaIndex] || listing.media[0]}
              alt={listing.title}
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
