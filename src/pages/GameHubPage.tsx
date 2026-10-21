import React, { useState, useMemo } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ServiceVertical } from '../types/marketplace';
import {
  GameCrestSvg,
  CategoryIconSvg,
  InstantZapSvg,
  EscrowShieldSvg,
} from '../components/CustomIcons';
import {
  ChevronRight,
  Search,
  Plus,
  ShoppingCart,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

export const GameHubPage: React.FC = () => {
  const {
    selectedGame,
    games: TRENDING_GAMES,
    serviceCategories: SERVICE_VERTICALS,
    listings,
    navigateTo,
    initiateCheckout,
    formatCurrency,
  } = useMarketplace();

  const game = selectedGame || TRENDING_GAMES[0] || null;

  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [activeService, setActiveService] = useState<ServiceVertical | 'All'>('All');
  const [activeServer, setActiveServer] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});

  const gameListings = useMemo(() => {
    if (!game) return [];
    return listings.filter((l) => {
      if (l.gameId !== game.id) return false;
      if (activeService !== 'All' && l.serviceType !== activeService) return false;
      if (activeServer !== 'All') {
        const srvStr = `${l.attributes.region || ''} ${l.attributes.server || ''}`;
        if (!srvStr.toLowerCase().includes(activeServer.toLowerCase())) return false;
      }
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        if (
          !l.title.toLowerCase().includes(q) &&
          !l.seller.username.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [listings, game, activeService, activeServer, searchFilter]);

  const getQty = (id: string, min = 1) => quantityMap[id] ?? min;
  const setQty = (id: string, val: number) =>
    setQuantityMap((prev) => ({ ...prev, [id]: Math.max(1, val) }));

  if (!game) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="surface-glass-card rounded-2xl p-12 text-center space-y-4 bg-white">
          <EscrowShieldSvg className="w-10 h-10 mx-auto" />
          <div className="text-base font-extrabold text-slate-900">
            No game hub selected or published yet
          </div>
          <div className="flex justify-center gap-2.5">
            <button
              onClick={() => navigateTo('marketplace')}
              className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Browse Marketplace
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="btn-glass-light px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-5 bg-white w-full max-w-[100vw] overflow-x-hidden">
      {/* Game Hub Header */}
      <div className="bg-white border-b border-sky-200 py-5 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium">
            <button
              onClick={() => navigateTo('home')}
              className="hover:text-sky-700 cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => navigateTo('marketplace')}
              className="hover:text-sky-700 cursor-pointer"
            >
              Marketplace
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">{game.title}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <GameCrestSvg
                gameId={game.id}
                iconUrl={game.iconUrl}
                title={game.title}
                className="w-12 h-12 shrink-0"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {game.title}
                </h1>
                <span className="text-xs font-mono font-bold text-sky-700">
                  {game.category}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('dashboard')}
              className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Sell in {game.title}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Minimized Single-Row Filter Bar (Expandable on Click) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5">
        <div className="surface-glass-card rounded-2xl p-3 bg-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[220px]">
              <button
                type="button"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="btn-glass-primary px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>
                  Filters ({activeService === 'All' ? 'All Services' : activeService} ·{' '}
                  {activeServer})
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    filtersExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div className="relative flex-1 min-w-[160px]">
                <Search className="w-3.5 h-3.5 text-sky-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={`Search ${game.title} offers...`}
                  className="w-full h-9 pl-8 pr-3 rounded-xl bg-white border border-sky-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {(activeService !== 'All' || activeServer !== 'All' || searchFilter) && (
              <button
                type="button"
                onClick={() => {
                  setActiveService('All');
                  setActiveServer('All');
                  setSearchFilter('');
                }}
                className="btn-glass-light px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {filtersExpanded && (
            <div className="pt-3 border-t border-sky-100 space-y-3">
              {/* Service Type Filter */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Category
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setActiveService('All')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                      activeService === 'All' ? 'btn-glass-primary' : 'btn-glass-light'
                    }`}
                  >
                    All ({listings.filter((l) => l.gameId === game.id).length})
                  </button>
                  {SERVICE_VERTICALS.map((cat) => {
                    const count = listings.filter(
                      (l) => l.gameId === game.id && l.serviceType === cat.name
                    ).length;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => setActiveService(cat.name as ServiceVertical)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                          activeService === cat.name ? 'btn-glass-primary' : 'btn-glass-light'
                        }`}
                      >
                        <CategoryIconSvg category={cat.name} className="w-3.5 h-3.5 text-sky-800" />
                        <span>{cat.name}</span>
                        <span className="font-mono text-[10px]">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Server Filter */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Server / Region
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {['All', ...game.servers].map((srv) => (
                    <button
                      key={srv}
                      onClick={() => setActiveServer(srv)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        activeServer === srv ? 'btn-glass-primary' : 'btn-glass-light'
                      }`}
                    >
                      {srv}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seller Comparison Table / Cards */}
        {gameListings.length === 0 ? (
          <div className="surface-glass-card rounded-2xl p-10 text-center space-y-3 bg-white">
            <EscrowShieldSvg className="w-10 h-10 mx-auto" />
            <div className="text-base font-extrabold text-slate-800">
              No active offers in {game.title} matching your filter
            </div>
            <button
              onClick={() => navigateTo('dashboard')}
              className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sell in {game.title}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {gameListings.map((item) => {
              const qty = getQty(item.id, item.minPurchase || 1);
              const rowTotal = item.price * qty;

              return (
                <div
                  key={item.id}
                  className="surface-glass-card surface-glass-card-hover rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white"
                >
                  <div
                    onClick={() => navigateTo('listing_detail', { listingId: item.id })}
                    className="flex-1 min-w-0 cursor-pointer space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-sky-700">{item.serviceType}</span>
                      <span>·</span>
                      <span>Region: {item.attributes.region || 'Global'}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        {item.deliverySpeed === 'Instant' && (
                          <InstantZapSvg className="w-3.5 h-3.5" />
                        )}
                        {item.deliverySpeed} Delivery
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <img
                        src={item.seller.avatar}
                        alt={item.seller.username}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span className="font-bold text-slate-700">{item.seller.username}</span>
                      <span className="font-mono text-sky-700 font-semibold">
                        {item.seller.ratingPercentage}%
                      </span>
                      <span>·</span>
                      <span className="font-mono">Stock: {item.stock}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-4 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-sky-100">
                    <div className="flex items-center rounded-xl bg-white border border-sky-200 p-1">
                      <button
                        type="button"
                        onClick={() => setQty(item.id, qty - 1)}
                        className="w-7 h-7 rounded-lg hover:bg-sky-50 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-mono text-xs font-bold text-slate-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(item.id, Math.min(item.stock, qty + 1))}
                        className="w-7 h-7 rounded-lg hover:bg-sky-50 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <div className="text-lg font-black font-mono text-slate-900">
                        {formatCurrency(rowTotal)}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {formatCurrency(item.price)} each
                      </div>
                    </div>

                    <button
                      onClick={() => initiateCheckout(item, qty)}
                      className="btn-glass-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
