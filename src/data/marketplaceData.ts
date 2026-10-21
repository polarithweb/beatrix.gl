import { Game } from '../types/marketplace';

/**
 * Helper to generate crisp, high-resolution SVG data URI illustrations for
 * seller avatars and marketplace item thumbnails in a clean pure-white & light-blue palette.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function createAvatarSvg(
  initials: string,
  bgHex = '#0284C7',
  accentHex = '#38BDF8'
): string {
  const safeInitials = escapeXml(initials.slice(0, 2).toUpperCase() || 'BG');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgHex}" />
        <stop offset="100%" stop-color="${accentHex}" />
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="60" fill="url(#g)" />
    <circle cx="60" cy="44" r="20" fill="#FFFFFF" fill-opacity="0.22" />
    <path d="M24 106 C24 82 96 82 96 106" fill="#FFFFFF" fill-opacity="0.22" />
    <text x="60" y="68" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="34" fill="#FFFFFF" text-anchor="middle">${safeInitials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createProductSvg(
  gameLabel: string,
  headline: string,
  subLabel: string,
  bgStart = '#FFFFFF',
  bgEnd = '#F0F9FF',
  accentHex = '#0284C7',
  badgeText = 'ESCROW VERIFIED'
): string {
  const safeGame = escapeXml((gameLabel || ' OFFER').toUpperCase().slice(0, 22));
  const safeHeadline = escapeXml(headline.slice(0, 32));
  const safeSub = escapeXml(subLabel.slice(0, 48));
  const safeBadge = escapeXml(badgeText.slice(0, 18));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}" />
        <stop offset="100%" stop-color="${bgEnd}" />
      </linearGradient>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="${accentHex}" stroke-width="1" stroke-opacity="0.06" />
      </pattern>
    </defs>
    <rect width="800" height="450" fill="url(#bg)" />
    <rect width="800" height="450" fill="url(#grid)" />
    <circle cx="670" cy="110" r="160" fill="${accentHex}" fill-opacity="0.07" />
    <circle cx="140" cy="370" r="130" fill="${accentHex}" fill-opacity="0.05" />
    
    <!-- Elevated Pure White Card -->
    <rect x="48" y="44" width="704" height="362" rx="24" fill="#FFFFFF" stroke="#BAE6FD" stroke-width="2" />
    
    <!-- Top Category Tag & Shield -->
    <rect x="84" y="80" width="180" height="34" rx="8" fill="#E0F2FE" />
    <text x="174" y="102" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="13" fill="#0369A1" text-anchor="middle" letter-spacing="1">${safeGame}</text>
    
    <rect x="556" y="80" width="160" height="34" rx="8" fill="#E0F2FE" stroke="#7DD3FC" stroke-width="1.5" />
    <text x="636" y="102" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="12" fill="#0284C7" text-anchor="middle">${safeBadge}</text>

    <!-- Decorative Geometric Emblem on Right -->
    <g transform="translate(560, 165)">
      <rect x="0" y="0" width="148" height="148" rx="28" fill="#F0F9FF" stroke="#7DD3FC" stroke-width="2" />
      <polygon points="74,26 116,52 116,98 74,122 32,98 32,52" fill="#BAE6FD" stroke="#0284C7" stroke-width="2.5" />
      <circle cx="74" cy="74" r="18" fill="#0284C7" />
      <path d="M67 74 L72 79 L83 68" stroke="#FFFFFF" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- Primary Item Typography -->
    <text x="84" y="192" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="30" fill="#0F172A">${safeHeadline}</text>
    <text x="84" y="234" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="17" fill="#475569">${safeSub}</text>

    <!-- Bottom Spec Bar -->
    <line x1="84" y1="292" x2="510" y2="292" stroke="#E2E8F0" stroke-width="1.5" />
    <circle cx="96" cy="332" r="7" fill="#0284C7" />
    <text x="114" y="337" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="14" fill="#0F172A">Beatrix.gl 100% Escrow Verified</text>
    <text x="84" y="366" font-family="JetBrains Mono, monospace" font-weight="600" font-size="13" fill="#64748B">INSTANT VAULT DISPATCH · ZERO CHARGEBACK RISK</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SERVICE_VERTICALS = [
  { name: 'Game Accounts', icon: 'UserCheck' },
  { name: 'Game Coins', icon: 'Coins' },
  { name: 'Items & Skins', icon: 'Shield' },
  { name: 'Top Up', icon: 'Zap' },
  { name: 'Gift Cards', icon: 'Gift' },
  { name: 'Game Pal', icon: 'Users' },
  { name: 'Coaching', icon: 'Award' },
  { name: 'Boosting', icon: 'TrendingUp' },
  { name: 'Software', icon: 'Cpu' },
] as const;

// Zero hardcoded games: games and their icons/logos are added exclusively via /#/admin
export const TRENDING_GAMES: Game[] = [];
