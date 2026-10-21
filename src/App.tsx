/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LocalizationModal } from './components/LocalizationModal';
import { NotificationMenu } from './components/NotificationMenu';
import { ChatWorkspace } from './components/ChatWorkspace';
import { PolarithLogoSvg } from './components/CustomIcons';

import { HomePage } from './pages/HomePage';
import { GameHubPage } from './pages/GameHubPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BuyerProfilePage } from './pages/BuyerProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';

function MarketplaceRouter() {
  const { currentPage, chatDrawerOpen, siteConfig } = useMarketplace();

  // Standalone Master Admin Portal (accessible ONLY via /#/admin)
  if (currentPage === 'admin') {
    return <AdminPage />;
  }

  // Maintenance Mode Lock (when toggled on by Admin)
  if (siteConfig.maintenanceMode) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white text-slate-900">
        <div className="surface-glass-card max-w-lg w-full rounded-3xl p-8 text-center space-y-4 bg-white">
          <PolarithLogoSvg className="w-12 h-12 mx-auto" />
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {siteConfig.maintenanceTitle ||
              `${siteConfig.brandPrefix}${siteConfig.brandHighlight}`}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {siteConfig.maintenanceMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col bg-white text-slate-900">
      {/* Optional Global Announcement Banner */}
      {siteConfig.announcementEnabled && (
        <div className="w-full bg-sky-100 text-sky-900 border-b border-sky-200 px-4 py-2 text-xs font-semibold">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 text-center">
            {siteConfig.announcementBadge && (
              <span className="px-2 py-0.5 rounded bg-sky-200 text-sky-900 font-mono text-[10px] font-bold uppercase tracking-wider">
                {siteConfig.announcementBadge}
              </span>
            )}
            <span>{siteConfig.announcementText}</span>
          </div>
        </div>
      )}

      {/* Sticky Top Header */}
      <Header />

      {/* Notification Dropdown Menu */}
      <NotificationMenu />

      {/* Main Page View */}
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden bg-white">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'game_hub' && <GameHubPage />}
        {currentPage === 'marketplace' && <MarketplacePage />}
        {currentPage === 'listing_detail' && <ListingDetailPage />}
        {currentPage === 'checkout' && <CheckoutPage />}
        {currentPage === 'buyer_profile' && <BuyerProfilePage />}
        {currentPage === 'chat' && (
          <div className="pt-4">
            <ChatWorkspace isFullScreen={true} />
          </div>
        )}
        {currentPage === 'dashboard' && <DashboardPage />}
      </main>

      {/* Footer (shown on non-checkout pages when enabled) */}
      {currentPage !== 'checkout' && siteConfig.showFooter && <Footer />}

      {/* Floating Bottom-Right Chat Drawer (when open on non-chat pages) */}
      {currentPage !== 'chat' &&
        siteConfig.enableLiveChat &&
        chatDrawerOpen && <ChatWorkspace isFullScreen={false} />}

      {/* Global Localization & Currency Modal */}
      <LocalizationModal />
    </div>
  );
}

export default function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceRouter />
    </MarketplaceProvider>
  );
}
