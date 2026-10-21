import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ServiceVertical } from '../types/marketplace';
import {
  CategoryIconSvg,
  GameCrestSvg,
  InstantZapSvg,
} from '../components/CustomIcons';
import {
  ArrowRight,
  Plus,
  ShoppingBag,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    listings,
    siteConfig,
    games,
    serviceCategories,
    selectedCategory,
    setSelectedCategory,
    navigateTo,
    formatCurrency,
    getCategoryCount,
    getGameCount,
  } = useMarketplace();

  const [filtersExpanded, setFiltersExpanded] = useState(false);

  return (
    <div className="space-y-8 pb-16 bg-white w-full max-w-[100vw] overflow-x-hidden">
      {/* Clean Hero Bar */}
      {siteConfig.showHomeHeroSection && (
        <section className="bg-white border-b border-sky-100 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="surface-glass-card rounded-2xl p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
              <div className="space-y-1.5 max-w-2xl">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                  {siteConfig.heroTitlePrefix}{' '}
                  <span className="text-sky-600">{siteConfig.heroTitleHighlight}</span>
                </h1>
                {siteConfig.heroDescription && siteConfig.heroDescription.trim() !== '' && (
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {siteConfig.heroDescription}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => navigateTo('marketplace')}
                  className="btn-glass-light flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-sky-700" />
                  <span>Browse Marketplace</span>
                </button>
                {siteConfig.showHeroSellCta && siteConfig.allowNewListings && (
                  <button
                    onClick={() => navigateTo('dashboard')}
                    className="btn-glass-primary flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{(siteConfig.heroSellCtaText || 'Sell').replace(/^\+\s*/, '')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Minimized Single-Row Categories & Filter Bar (Expandable on Click) */}
      {siteConfig.showHomeCategoriesSection && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="surface-glass-card rounded-2xl p-3 sm:p-4 bg-white space-y-3">
            {/* Minimized Row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  className="btn-glass-primary px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{ siteConfig.homeCategoriesTitle || 'Categories & Filters' }</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      filtersExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Quick inline preview pills (first 3) when collapsed */}
                {!filtersExpanded &&
                  serviceCategories.slice(0, 3).map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() =>
                        navigateTo('marketplace', { category: cat.name as ServiceVertical })
                      }
                      className="btn-glass-light px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <CategoryIconSvg category={cat.name} className="w-3.5 h-3.5 text-sky-700" />
                      <span>{cat.name}</span>
                    </button>
                  ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>{filtersExpanded ? 'Minimize' : `Expand (${serviceCategories.length})`}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      filtersExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <button
                  onClick={() => navigateTo('marketplace')}
                  className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold hidden sm:flex items-center gap-1 cursor-pointer"
                >
                  <span>All Offers</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-700" />
                </button>
              </div>
            </div>

            {/* Expanded Categories & Filters Panel */}
            {filtersExpanded && (
              <div className="pt-3 border-t border-sky-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {serviceCategories.map((cat) => {
                  const count = getCategoryCount(cat.name);
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setSelectedCategory(cat.name as ServiceVertical);
                        navigateTo('marketplace', { category: cat.name as ServiceVertical });
                      }}
                      className={`p-3 rounded-xl text-left flex items-center justify-between gap-2.5 cursor-pointer ${
                        isSelected ? 'btn-glass-primary' : 'btn-glass-light'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {siteConfig.showCategoryIcons && (
                          <div className="w-7 h-7 rounded-lg bg-white border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
                            <CategoryIconSvg category={cat.name} className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-slate-900 leading-snug">
                            {cat.name}
                          </div>
                          <div className="text-[10px] font-mono text-sky-800">
                            {count} {count === 1 ? 'offer' : 'offers'}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Section 2: Supported Games (Rendered cleanly when games exist) */}
      {siteConfig.showHomeGamesSection && games.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
              {siteConfig.homeGamesTitle || 'Games'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => {
              const gameListings = listings.filter((l) => l.gameId === game.id);
              const count = getGameCount(game.id);
              const lowestPrice =
                gameListings.length > 0
                  ? Math.min(...gameListings.map((l) => l.price))
                  : null;

              return (
                <div
                  key={game.id}
                  onClick={() => navigateTo('game_hub', { gameId: game.id })}
                  className="surface-glass-card surface-glass-card-hover rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer bg-white"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GameCrestSvg
                      gameId={game.id}
                      iconUrl={game.iconUrl}
                      title={game.title}
                      className="w-10 h-10 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                        {game.title}
                      </h3>
                      <div className="text-xs text-slate-500">
                        {count} {count === 1 ? 'offer' : 'offers'}
                        {lowestPrice !== null && (
                          <>
                            {' · From '}
                            <strong className="font-mono text-slate-900">
                              {formatCurrency(lowestPrice)}
                            </strong>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Open
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 3: Live Marketplace Listings */}
      {siteConfig.showHomeListingsSection && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
              {siteConfig.homeListingsTitle || 'Marketplace Listings'}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {siteConfig.allowNewListings && (
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="btn-glass-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Sell</span>
                </button>
              )}
              <button
                onClick={() => navigateTo('marketplace')}
                className="btn-glass-light px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>View All ({listings.length})</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-700" />
              </button>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="surface-glass-card rounded-2xl p-8 text-center space-y-3 bg-white">
              <p className="text-sm font-bold text-slate-900">No active listings yet</p>
              {siteConfig.allowNewListings && (
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Become a Seller</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {listings.slice(0, 8).map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => navigateTo('listing_detail', { listingId: listing.id })}
                  className="surface-glass-card surface-glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer group bg-white"
                >
                  <div>
                    <div className="relative aspect-[16/9] bg-sky-50 overflow-hidden border-b border-sky-100">
                      <img
                        src={listing.media[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span className="font-bold text-sky-700 truncate">
                          {listing.gameTitle}
                        </span>
                        <span className="shrink-0">{listing.serviceType}</span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug min-h-[2.5rem]">
                        {listing.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span className="truncate font-medium text-slate-700">
                          {listing.seller.username}
                        </span>
                        <span className="font-mono text-[11px] text-sky-700 font-semibold shrink-0">
                          {listing.seller.ratingPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-white border-t border-sky-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                      {listing.deliverySpeed === 'Instant' && (
                        <InstantZapSvg className="w-3.5 h-3.5" />
                      )}
                      <span>{listing.deliverySpeed}</span>
                    </div>

                    <span className="text-base font-black font-mono text-slate-900">
                      {formatCurrency(listing.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
