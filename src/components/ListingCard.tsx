import React from 'react';
import { MarketplaceListing, formatPrice } from '../utils/marketplace';

interface ListingCardProps {
  listing: MarketplaceListing;
  onBuyClick: (listing: MarketplaceListing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onBuyClick,
}) => {
  return (
    <article className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div>
        {/* Game Name badge & category */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-block text-xs font-semibold tracking-tight text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-md">
            {listing.game}
          </span>
          <span className="text-xs text-slate-500">
            {listing.category}
          </span>
        </div>

        {/* Listing Title */}
        <h2 className="text-base font-semibold text-[#0F172A] leading-snug mb-4 line-clamp-2 min-h-[2.75rem]">
          {listing.title}
        </h2>
      </div>

      <div>
        {/* Seller Name with simple SVG verified indicator */}
        <div className="flex items-center justify-between text-xs text-slate-600 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-medium text-slate-700 truncate">
              {listing.sellerName}
            </span>
            {listing.verified && (
              <span
                className="inline-flex items-center gap-0.5 text-indigo-600 font-medium shrink-0"
                title="Verified Seller"
              >
                <svg
                  className="w-3.5 h-3.5 text-indigo-600 shrink-0"
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
                <span>Verified</span>
              </span>
            )}
          </div>
          <span className="text-slate-400 shrink-0">
            {listing.deliveryTime}
          </span>
        </div>

        {/* Price and Buy button */}
        <div className="flex items-center justify-between gap-4">
          <div className="font-mono tabular-nums text-lg font-bold text-[#0F172A]">
            {formatPrice(listing.price)}
          </div>

          <button
            type="button"
            onClick={() => onBuyClick(listing)}
            className="h-9 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Buy
          </button>
        </div>
      </div>
    </article>
  );
};
