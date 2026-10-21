import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { PolarithLogoSvg } from './CustomIcons';

export const Footer: React.FC = () => {
  const { siteConfig, navigateTo } = useMarketplace();

  return (
    <footer className="bg-white text-slate-600 border-t border-sky-200 text-xs w-full max-w-[100vw] overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <PolarithLogoSvg className="w-6 h-6" />
          <span className="font-extrabold text-sm text-slate-900">
            {siteConfig.brandPrefix}
            <span className="text-sky-600">{siteConfig.brandHighlight}</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigateTo('home')}
            className="btn-glass-light flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold text-center cursor-pointer whitespace-nowrap"
          >
            Home
          </button>
          <button
            onClick={() => navigateTo('marketplace')}
            className="btn-glass-light flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold text-center cursor-pointer whitespace-nowrap"
          >
            Marketplace
          </button>
          <button
            onClick={() => navigateTo('buyer_profile')}
            className="btn-glass-light flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold text-center cursor-pointer whitespace-nowrap"
          >
            Profile
          </button>
          {siteConfig.allowNewListings && (
            <button
              onClick={() => navigateTo('dashboard')}
              className="btn-glass-primary flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold text-center cursor-pointer whitespace-nowrap"
            >
              + Sell
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
