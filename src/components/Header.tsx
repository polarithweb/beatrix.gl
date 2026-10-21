import React, { useRef, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ServiceVertical } from '../types/marketplace';
import {
  PolarithLogoSvg,
  CategoryIconSvg,
  GameCrestSvg,
} from './CustomIcons';
import {
  Search,
  ChevronDown,
  Globe,
  MessageSquare,
  Bell,
  Plus,
  User,
  X,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentPage,
    navigateTo,
    siteConfig,
    games,
    serviceCategories,
    globalSearchQuery,
    setGlobalSearchQuery,
    searchDropdownOpen,
    setSearchDropdownOpen,
    megaMenuOpen,
    setMegaMenuOpen,
    localization,
    setLocalizationModalOpen,
    chatDrawerOpen,
    setChatDrawerOpen,
    unreadChatCount,
    unreadNotificationsCount,
    notificationsOpen,
    setNotificationsOpen,
    availableBalance,
    formatCurrency,
    getCategoryCount,
    getGameCount,
    listings,
  } = useMarketplace();

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setMegaMenuOpen, setSearchDropdownOpen]);

  const filteredGames = globalSearchQuery.trim()
    ? games.filter((g) =>
        g.title.toLowerCase().includes(globalSearchQuery.toLowerCase())
      )
    : games.slice(0, 6);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchDropdownOpen(false);
    navigateTo('marketplace');
  };

  const cleanSellLabel = (siteConfig.sellButtonText || 'Sell').replace(/^\+\s*/, '');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-sky-200 text-slate-900 select-none w-full max-w-[100vw]">
      <div className="max-w-7xl mx-auto py-2.5 px-3 sm:px-6 space-y-2 md:space-y-0">
        {/* ROW 1 on Mobile / Single Full Bar on Desktop */}
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Left: Brand Logo */}
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 text-base sm:text-xl font-extrabold tracking-tight cursor-pointer group shrink-0 bg-transparent border-0 p-0"
          >
            <PolarithLogoSvg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 transition-transform group-hover:scale-105" />
            <span className="text-slate-900 whitespace-nowrap">
              {siteConfig.brandPrefix}
              <span className="text-sky-600">{siteConfig.brandHighlight}</span>
            </span>
          </button>

          {/* Categories Trigger (Centered on mobile Row 1, next to logo on desktop) */}
          {siteConfig.showHeaderCategories && (
            <div className="relative flex-1 md:flex-initial flex justify-center md:justify-start" ref={megaMenuRef}>
              <button
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className="btn-glass-light w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                <CategoryIconSvg category="Game Coins" className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span>Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-sky-700 transition-transform ${
                    megaMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {megaMenuOpen && (
                <div className="fixed sm:absolute left-3 right-3 sm:left-0 sm:right-auto top-14 sm:top-full sm:mt-2 w-auto sm:w-[560px] rounded-2xl surface-glass-card p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 z-50 max-h-[80vh] overflow-y-auto bg-white">
                  {/* Col 1: Service Categories */}
                  <div className="sm:col-span-5 sm:border-r border-sky-100 sm:pr-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Categories
                    </div>
                    <div className="space-y-1.5">
                      {serviceCategories.map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => {
                            setMegaMenuOpen(false);
                            navigateTo('marketplace', { category: cat.name as ServiceVertical });
                          }}
                          className="w-full btn-glass-light flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <CategoryIconSvg
                              category={cat.name}
                              className="w-4 h-4 text-sky-700"
                            />
                            <span className="text-xs font-bold text-slate-900">
                              {cat.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-sky-800 font-bold">
                            {getCategoryCount(cat.name)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Col 2: Supported Games */}
                  <div className="sm:col-span-7">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Games
                      </span>
                      <button
                        onClick={() => {
                          setMegaMenuOpen(false);
                          navigateTo('marketplace');
                        }}
                        className="btn-glass-light px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Browse All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {games.length === 0 ? (
                        <div className="sm:col-span-2 py-6 text-center text-xs text-slate-400">
                          No game hubs added yet.
                        </div>
                      ) : (
                        games.map((game) => {
                          const count = getGameCount(game.id);
                          return (
                            <button
                              key={game.id}
                              onClick={() => {
                                setMegaMenuOpen(false);
                                navigateTo('game_hub', { gameId: game.id });
                              }}
                              className="btn-glass-light flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer"
                            >
                              <GameCrestSvg
                                gameId={game.id}
                                iconUrl={game.iconUrl}
                                title={game.title}
                                className="w-7 h-7 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {game.title}
                                </div>
                                <div className="text-[10px] text-sky-800 font-mono">
                                  {count} {count === 1 ? 'offer' : 'offers'}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Center on Desktop: Search Bar */}
          {siteConfig.showHeaderSearch && (
            <div className="hidden md:block flex-1 max-w-sm lg:max-w-md relative min-w-0" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={globalSearchQuery}
                  onFocus={() => setSearchDropdownOpen(true)}
                  onChange={(e) => {
                    setGlobalSearchQuery(e.target.value);
                    setSearchDropdownOpen(true);
                  }}
                  placeholder={siteConfig.searchPlaceholder}
                  className="w-full h-9 pl-9 pr-8 rounded-xl bg-white border border-sky-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                />
                {globalSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setGlobalSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Instant Search Dropdown */}
              {searchDropdownOpen && (
                <div className="fixed sm:absolute left-3 right-3 sm:left-0 sm:right-0 top-16 sm:top-full sm:mt-2 rounded-2xl surface-glass-card p-3.5 z-50 bg-white">
                  <div className="flex flex-wrap gap-1.5 pb-3 mb-2.5 border-b border-sky-100">
                    {serviceCategories.slice(0, 5).map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          setSearchDropdownOpen(false);
                          navigateTo('marketplace', { category: cat.name });
                        }}
                        className="btn-glass-light px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    {filteredGames.length === 0 ? (
                      <div className="px-2.5 py-2 text-xs text-slate-500">
                        Press Enter to search all marketplace offers.
                      </div>
                    ) : (
                      filteredGames.map((game) => (
                        <button
                          key={game.id}
                          type="button"
                          onClick={() => {
                            setSearchDropdownOpen(false);
                            navigateTo('game_hub', { gameId: game.id });
                          }}
                          className="w-full btn-glass-light flex items-center justify-between px-2.5 py-2 rounded-xl text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <GameCrestSvg
                              gameId={game.id}
                              iconUrl={game.iconUrl}
                              title={game.title}
                              className="w-6 h-6"
                            />
                            <span className="text-xs font-bold text-slate-900">{game.title}</span>
                          </div>
                          <span className="text-[11px] font-mono text-sky-800 font-semibold">
                            {listings.filter((l) => l.gameId === game.id).length} offers
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Top-Right on Mobile: + Sell button fills the right side of Row 1 */}
          {siteConfig.showHeaderSellButton && siteConfig.allowNewListings && (
            <button
              onClick={() => navigateTo('dashboard')}
              className="md:hidden btn-glass-primary flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>{cleanSellLabel}</span>
            </button>
          )}

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {siteConfig.showHeaderLocalization && (
              <button
                onClick={() => setLocalizationModalOpen(true)}
                className="btn-glass-light flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
                title="Region, Language & Currency"
              >
                <Globe className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span>{localization.regionCode}</span>
                <span className="text-sky-400">|</span>
                <span className="font-mono text-sky-900">
                  {localization.currency} ({localization.currencySymbol})
                </span>
              </button>
            )}

            {siteConfig.showHeaderSellButton && siteConfig.allowNewListings && (
              <button
                onClick={() => navigateTo('dashboard')}
                className="btn-glass-primary flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>{cleanSellLabel}</span>
              </button>
            )}

            {siteConfig.enableLiveChat && (
              <button
                onClick={() => {
                  if (currentPage === 'chat') return;
                  setChatDrawerOpen(!chatDrawerOpen);
                }}
                aria-label="Live Trade Chat"
                className="btn-glass-light relative px-3 py-2 flex items-center gap-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0"
                title="Live Trade Chat"
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-800" />
                <span>Chat</span>
                {unreadChatCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                    {unreadChatCount}
                  </span>
                )}
              </button>
            )}

            {siteConfig.showHeaderNotifications && (
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
                className="btn-glass-light relative px-2.5 py-2 flex items-center gap-1 rounded-xl text-xs font-bold cursor-pointer shrink-0"
                title="Notifications"
              >
                <Bell className="w-3.5 h-3.5 text-sky-800" />
                {unreadNotificationsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => navigateTo('buyer_profile')}
              aria-label="Buyer Profile & Orders"
              title="Buyer Profile & Orders"
              className="btn-glass-light flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Buyer Profile"
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-sky-800 shrink-0" />
              )}
              <span>
                {currentUser?.displayName
                  ? currentUser.displayName.split(' ')[0]
                  : 'Buyer Profile'}
              </span>
              {availableBalance > 0 && (
                <span className="hidden xl:inline font-mono text-[11px] text-sky-900">
                  ({formatCurrency(availableBalance)})
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ROW 2 on Mobile: Evenly Distributed Controls Filling 100% of the Row */}
        <div className="flex md:hidden items-center justify-between gap-2 w-full">
          {siteConfig.enableLiveChat && (
            <button
              onClick={() => {
                if (currentPage === 'chat') return;
                setChatDrawerOpen(!chatDrawerOpen);
              }}
              aria-label="Live Trade Chat"
              className="btn-glass-light flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-800 shrink-0" />
              <span>Chat</span>
              {unreadChatCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>
          )}

          {siteConfig.showHeaderNotifications && (
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-label="Notifications"
              className="btn-glass-light flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              <Bell className="w-3.5 h-3.5 text-sky-800 shrink-0" />
              <span>Alerts</span>
              {unreadNotificationsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {siteConfig.showHeaderLocalization && (
            <button
              onClick={() => setLocalizationModalOpen(true)}
              className="btn-glass-light flex-1 py-2 px-2.5 flex items-center justify-center gap-1 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
              title="Region & Currency"
            >
              <Globe className="w-3.5 h-3.5 text-sky-700 shrink-0" />
              <span className="font-mono text-sky-900">{localization.currency}</span>
            </button>
          )}

          <button
            onClick={() => navigateTo('buyer_profile')}
            aria-label="Buyer Profile & Orders"
            className="btn-glass-light flex-[1.25] py-2 px-3 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap truncate"
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Buyer Profile"
                className="w-4 h-4 rounded-full object-cover shrink-0"
              />
            ) : (
              <User className="w-3.5 h-3.5 text-sky-800 shrink-0" />
            )}
            <span className="truncate">
              {currentUser?.displayName
                ? currentUser.displayName.split(' ')[0]
                : 'Profile'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
