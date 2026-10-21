import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { PolarithLogoSvg, EscrowShieldSvg, InstantZapSvg } from '../components/CustomIcons';
import {
  Lock,
  CreditCard,
  Wallet,
  Globe,
  Coins,
  CheckCircle2,
  Tag,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    activeCheckoutListing,
    listings,
    siteConfig,
    checkoutQuantity,
    checkoutCharacterId,
    completeCheckout,
    availableBalance,
    formatCurrency,
    navigateTo,
  } = useMarketplace();

  const listing = activeCheckoutListing || listings[0] || null;
  const [selectedPayment, setSelectedPayment] = useState('wallet');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoStatus, setPromoStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'card',
      title: 'Credit / Debit Card',
      desc: 'Visa, Mastercard, American Express',
      feeBadge: `${siteConfig.platformFeePercent}% Fee`,
      icon: CreditCard,
    },
    {
      id: 'wallet',
      title: `${siteConfig.brandPrefix} Store Credits / Escrow Balance`,
      desc: `Instant deduction from your available wallet balance (${formatCurrency(availableBalance)} available)`,
      feeBadge: '0% FEE · INSTANT',
      icon: Wallet,
    },
    {
      id: 'paypal',
      title: 'PayPal & Digital E-Wallets',
      desc: 'Pay with PayPal balance or linked bank account',
      feeBadge: `${siteConfig.platformFeePercent}% Fee`,
      icon: Globe,
    },
    {
      id: 'crypto',
      title: 'Crypto Payments (USDT / BTC / ETH)',
      desc: 'Pay via TRC20, ERC20 or Bitcoin Lightning',
      feeBadge: '1.0% Fee',
      icon: Coins,
    },
  ];

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="p-10 surface-glass-card rounded-2xl text-center space-y-4">
          <EscrowShieldSvg className="w-12 h-12 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">Your Checkout Cart is Empty</h2>
          <p className="text-xs text-slate-500">
            Select an active listing from the marketplace to start an escrow-protected checkout.
          </p>
          <button
            onClick={() => navigateTo('marketplace')}
            className="btn-glass-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const subtotal = listing.price * checkoutQuantity;
  const processingFee =
    selectedPayment === 'wallet'
      ? 0
      : Math.max(
          siteConfig.minimumFeeUsd,
          Math.round(subtotal * (siteConfig.platformFeePercent / 100) * 100) / 100
        );
  const totalPayable = Math.max(0, subtotal + processingFee - promoDiscount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = promoCode.trim().toUpperCase();
    const matchedPromo = (siteConfig.promoCodes || []).find(
      (p) => p.active && p.code.toUpperCase() === entered
    );
    if (matchedPromo) {
      const discount =
        Math.round(subtotal * (matchedPromo.discountPercent / 100) * 100) / 100;
      setPromoDiscount(discount);
      setPromoStatus(
        `${matchedPromo.discountPercent}% Promo (${matchedPromo.code}) applied (-${formatCurrency(discount)})`
      );
    } else {
      setPromoDiscount(0);
      setPromoStatus('Invalid or inactive coupon code.');
    }
  };

  const handlePayNow = async () => {
    setIsProcessing(true);
    try {
      await completeCheckout(
        selectedPayment === 'wallet' ? 'Store Balance' : selectedPayment.toUpperCase()
      );
      navigateTo('chat');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 text-slate-900 w-full max-w-[100vw] overflow-x-hidden">
      {/* Minimalist Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-emerald-500/15 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 text-lg font-black tracking-tight cursor-pointer"
            >
              <PolarithLogoSvg className="w-7 h-7" />
              <span>
                {siteConfig.brandPrefix}
                <span className="text-emerald-600">{siteConfig.brandHighlight}</span>
              </span>
            </button>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <Lock className="w-3.5 h-3.5" />
              <span>Escrow Checkout</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-400">1. Order Review</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-emerald-700">2. Payment</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-400">3. Delivery</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Checkout Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Order Verification & Payment Methods */}
          <div className="lg:col-span-7 space-y-6 min-w-0">
            <div className="surface-glass-card rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
                  1. Delivery Target & Order Details
                </h2>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  {listing.deliverySpeed === 'Instant' && <InstantZapSvg className="w-3.5 h-3.5" />}
                  {listing.deliverySpeed} Delivery
                </span>
              </div>

              <div className="flex items-start gap-4">
                <img
                  src={listing.media[0]}
                  alt={listing.title}
                  className="w-20 h-14 rounded-xl object-cover border border-emerald-500/15 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase">
                    {listing.gameTitle} · {listing.serviceType}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 mt-0.5">
                    {listing.title}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    Seller: <strong className="text-slate-800">{listing.seller.username}</strong> · Qty:{' '}
                    <strong className="font-mono">{checkoutQuantity}</strong>
                  </div>
                </div>
              </div>

              {checkoutCharacterId && (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Delivery Recipient ID:</span>
                  <span className="font-mono font-bold text-emerald-800">{checkoutCharacterId}</span>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="surface-glass-card rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
                2. Select Payment Rail
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = selectedPayment === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedPayment(pm.id)}
                      className={`w-full p-4 rounded-2xl text-left transition-all flex items-center justify-between gap-4 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/80 border-2 border-emerald-600 shadow-xs'
                          : 'bg-white/80 border border-emerald-500/15 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {pm.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {pm.desc}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono font-bold text-emerald-700">
                          {pm.feeBadge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Sticky Summary & Pay Now */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4 min-w-0">
            <div className="surface-glass-card rounded-2xl p-5 sm:p-6 space-y-5">
              <h3 className="font-extrabold text-base text-slate-900 border-b border-emerald-500/10 pb-3">
                Escrow Settlement Summary
              </h3>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code (POLARITH)"
                      className="w-full h-9 pl-8 pr-3 bg-white/90 border border-emerald-500/20 rounded-xl text-xs font-mono uppercase outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-glass-light h-9 px-4 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoStatus && (
                  <p className="text-[11px] text-emerald-700 font-medium">{promoStatus}</p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs border-t border-emerald-500/10 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Order Subtotal ({checkoutQuantity}x)</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Gateway Fee</span>
                  <span className="font-mono font-bold text-slate-900">
                    {processingFee === 0 ? 'FREE' : formatCurrency(processingFee)}
                  </span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Promo Discount (10%)</span>
                    <span className="font-mono">-{formatCurrency(promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-3 border-t border-emerald-500/15">
                  <span className="text-sm font-extrabold text-slate-900">Total Payable</span>
                  <span className="text-2xl font-black font-mono text-emerald-700">
                    {formatCurrency(totalPayable)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayNow}
                disabled={isProcessing}
                className="btn-glass-primary w-full h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>
                  {isProcessing
                    ? 'Securing Escrow Vault...'
                    : `Complete Payment · ${formatCurrency(totalPayable)}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <EscrowShieldSvg className="w-4 h-4" />
                  <span>100% Money-Back Escrow Protection</span>
                </div>
                <p>
                  Your payment is held in Polarith GamerProtect escrow and only released after you confirm delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
