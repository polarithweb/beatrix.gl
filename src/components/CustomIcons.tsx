import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';

export const PolarithLogoSvg: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  const { siteConfig } = useMarketplace();

  if (!siteConfig.showBrandLogo) {
    return null;
  }

  if (siteConfig.brandLogoUrl && siteConfig.brandLogoUrl.trim()) {
    return (
      <img
        src={siteConfig.brandLogoUrl}
        alt={`${siteConfig.brandPrefix}${siteConfig.brandHighlight}`}
        className={`${className} rounded-xl object-contain shrink-0`}
      />
    );
  }

  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="beatrix-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="beatrix-shine" x1="8" y1="6" x2="24" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="34" height="34" rx="11" fill="url(#beatrix-grad)" />
      <rect x="4" y="4" width="32" height="16" rx="9" fill="url(#beatrix-shine)" />
      <path
        d="M20 9L29 14.2V25.8L20 31L11 25.8V14.2L20 9Z"
        stroke="white"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="rgba(255,255,255,0.18)"
      />
      <path
        d="M15.5 20L18.8 23.2L25 16.8"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const CategoryIconSvg: React.FC<{ category: string; className?: string }> = ({
  category,
  className = 'w-5 h-5',
}) => {
  const { siteConfig, serviceCategories } = useMarketplace();

  if (!siteConfig.showCategoryIcons) {
    return null;
  }

  const matchedCat = serviceCategories.find((c) => c.name === category);
  if (matchedCat?.iconUrl && matchedCat.iconUrl.trim()) {
    return (
      <img
        src={matchedCat.iconUrl}
        alt={category}
        className={`${className} object-contain shrink-0`}
      />
    );
  }

  switch (category) {
    case 'Game Coins':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="9" fill="rgba(56,189,248,0.18)" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7V17M9.5 9.5C9.5 8.4 10.6 7.8 12 7.8C13.4 7.8 14.5 8.4 14.5 9.5C14.5 11.5 9.5 11.2 9.5 13.8C9.5 15 10.6 15.8 12 15.8C13.4 15.8 14.5 15 14.5 13.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'Game Accounts':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 3L19 6V11.5C19 16.2 15.9 20.1 12 21.5C8.1 20.1 5 16.2 5 11.5V6L12 3Z" fill="rgba(56,189,248,0.18)" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8.5 16.2C9.3 14.6 10.6 13.8 12 13.8C13.4 13.8 14.7 14.6 15.5 16.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'Items & Skins':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M6 3H18L21 8.5L12 21L3 8.5L6 3Z" fill="rgba(56,189,248,0.18)" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M3 8.5H21M12 21L8.5 8.5L12 3L15.5 8.5L12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'Boosting':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M13 2L4.5 13.5H11.5L10.5 22L19.5 10.5H12.5L13 2Z" fill="rgba(56,189,248,0.22)" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case 'Top Up':
    case 'Gift Cards':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="3" y="5" width="18" height="14" rx="3" fill="rgba(56,189,248,0.18)" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3 10H21M7 15H11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
};

/**
 * Renders the game icon/logo ONLY if an iconUrl was configured by the Admin in /#/admin.
 * No hardcoded game icons or fallback crests are rendered.
 */
export const GameCrestSvg: React.FC<{
  gameId?: string;
  iconUrl?: string;
  title?: string;
  className?: string;
}> = ({ iconUrl, title = 'Game', className = 'w-10 h-10' }) => {
  if (!iconUrl || !iconUrl.trim()) {
    return null;
  }
  return (
    <img
      src={iconUrl}
      alt={title}
      className={`${className} rounded-xl object-contain shrink-0`}
    />
  );
};

export const EscrowShieldSvg: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 28 28" fill="none" className={className}>
    <path
      d="M14 2.5L23.5 6.5V13.8C23.5 19.8 19.4 24.4 14 26.2C8.6 24.4 4.5 19.8 4.5 13.8V6.5L14 2.5Z"
      fill="rgba(56,189,248,0.22)"
      stroke="#0284C7"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M10.2 14.3L12.8 16.9L18.2 11.5"
      stroke="#0369A1"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const InstantZapSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <path
      d="M11 2L4 11.2H10L9 18L16 8.8H10L11 2Z"
      fill="#38BDF8"
      stroke="#0284C7"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);
