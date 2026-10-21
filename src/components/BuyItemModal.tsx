import React, { useState } from 'react';
import { MarketplaceListing, formatPrice } from '../utils/marketplace';

interface BuyItemModalProps {
  listing: MarketplaceListing | null;
  onClose: () => void;
  onConfirmPurchase: (listing: MarketplaceListing) => Promise<string>;
}

export const BuyItemModal: React.FC<BuyItemModalProps> = ({
  listing,
  onClose,
  onConfirmPurchase,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!listing) return null;

  const handlePurchase = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const orderId = await onConfirmPurchase(listing);
      setConfirmedOrderId(orderId);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to complete purchase. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setConfirmedOrderId(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-item-modal-title"
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
        {confirmedOrderId ? (
          <div>
            <div className="flex items-center gap-2.5 text-emerald-700 mb-3">
              <svg
                className="w-5 h-5 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              <h2
                id="buy-item-modal-title"
                className="text-lg font-bold text-[#0F172A]"
              >
                Order Confirmed
              </h2>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Your order has been secured via Polarith Escrow. Delivery instructions from{' '}
              <span className="font-semibold text-[#0F172A]">
                {listing.sellerName}
              </span>{' '}
              are ready.
            </p>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-4 space-y-2 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference</span>
                <span className="font-mono font-semibold text-[#0F172A]">
                  {confirmedOrderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Game</span>
                <span className="font-medium text-[#0F172A]">{listing.game}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Window</span>
                <span className="font-medium text-[#0F172A]">
                  {listing.deliveryTime}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Total Paid</span>
                <span className="font-mono font-bold text-[#0F172A]">
                  {formatPrice(listing.price)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full h-10 text-sm font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h2
                id="buy-item-modal-title"
                className="text-lg font-bold text-[#0F172A]"
              >
                Checkout Summary
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close checkout"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l8 8M14 6l-8 8"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-4 mb-5">
              <div className="text-xs font-semibold text-indigo-700 mb-1">
                {listing.game} · {listing.category}
              </div>
              <div className="text-sm font-semibold text-[#0F172A] mb-3">
                {listing.title}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-200/80">
                <span>Seller: {listing.sellerName} (Verified)</span>
                <span>Delivery: {listing.deliveryTime}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 px-1">
              <span className="text-sm font-medium text-slate-600">
                Total Amount
              </span>
              <span className="font-mono tabular-nums text-xl font-bold text-[#0F172A]">
                {formatPrice(listing.price)}
              </span>
            </div>

            {errorMessage && (
              <p
                className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 mb-4"
                role="alert"
              >
                {errorMessage}
              </p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="h-10 px-4 text-sm font-medium text-slate-600 hover:text-[#0F172A] bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePurchase}
                className="h-10 px-5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
              >
                {isProcessing ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
