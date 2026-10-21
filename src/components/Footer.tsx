import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { PolarithLogoSvg } from './CustomIcons';

export const Footer: React.FC = () => {
  const { siteConfig, navigateTo } = useMarketplace();

  return (
    <footer className="bg-white text-slate-600 border-t border-sky-200 text-xs w-full max-w-[100vw] overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <PolarithLogoSvg className="w-6 h-6" />
          <span className="font-extrabold text-sm text-slate-900">
            {siteConfig.brandPrefix}
            <span className="text-sky-600">{siteConfig.brandHighlight}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigateTo('home')}
            className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => navigateTo('marketplace')}
            className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            Marketplace
          </button>
          <button
            onClick={() => navigateTo('buyer_profile')}
            className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            Buyer Profile
          </button>
          {siteConfig.allowNewListings && (
            <button
              onClick={() => navigateTo('dashboard')}
              className="btn-glass-primary px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              + Sell
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
