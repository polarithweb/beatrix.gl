import React, { useState } from 'react';
import {
  LISTING_CATEGORIES,
  LISTING_CONSTRAINTS,
  ListingCategory,
  NewListingInput,
  validateNewListingInput,
} from '../utils/marketplace';

interface SellItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitListing: (input: NewListingInput) => Promise<void>;
  sellerDisplayName: string;
}

export const SellItemModal: React.FC<SellItemModalProps> = ({
  isOpen,
  onClose,
  onSubmitListing,
  sellerDisplayName,
}) => {
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [category, setCategory] = useState<ListingCategory>('Game Accounts');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<{
    title?: string;
    game?: string;
    category?: string;
    price?: string;
    submit?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateNewListingInput({
      title,
      game,
      category,
      price,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmitListing({
        title,
        game,
        category,
        price,
      });
      setTitle('');
      setGame('');
      setCategory('Game Accounts');
      setPrice('');
      onClose();
    } catch (err) {
      setErrors({
        submit:
          err instanceof Error
            ? err.message
            : 'Unable to publish listing. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sell-item-modal-title"
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div>
            <h2
              id="sell-item-modal-title"
              className="text-lg font-bold text-[#0F172A]"
            >
              Post a Listing
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selling as {sellerDisplayName} · Verified Seller
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
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

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="listing-title"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Listing Title
            </label>
            <input
              id="listing-title"
              type="text"
              value={title}
              maxLength={LISTING_CONSTRAINTS.TITLE_MAX_LENGTH}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Ascendant 3 Account with Reaver Vandal"
              className="w-full h-10 px-3.5 text-sm text-[#0F172A] bg-[#F8FAFC] border border-slate-200 rounded-lg placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="listing-game"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Game
              </label>
              <input
                id="listing-game"
                type="text"
                value={game}
                maxLength={LISTING_CONSTRAINTS.GAME_MAX_LENGTH}
                onChange={(e) => setGame(e.target.value)}
                placeholder="e.g., Valorant"
                className="w-full h-10 px-3.5 text-sm text-[#0F172A] bg-[#F8FAFC] border border-slate-200 rounded-lg placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
              {errors.game && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.game}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="listing-category"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Category
              </label>
              <select
                id="listing-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ListingCategory)}
                className="w-full h-10 px-3 text-sm text-[#0F172A] bg-[#F8FAFC] border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-none"
              >
                {LISTING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="listing-price"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Price (USD)
            </label>
            <input
              id="listing-price"
              type="number"
              step="0.01"
              min="0.01"
              max={LISTING_CONSTRAINTS.PRICE_MAX}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="49.99"
              className="w-full h-10 px-3.5 text-sm font-mono tabular-nums text-[#0F172A] bg-[#F8FAFC] border border-slate-200 rounded-lg placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.price}
              </p>
            )}
          </div>

          {errors.submit && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5" role="alert">
              {errors.submit}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 text-sm font-medium text-slate-600 hover:text-[#0F172A] bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
