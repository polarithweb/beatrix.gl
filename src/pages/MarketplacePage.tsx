import React, { useState, useMemo } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ServiceVertical } from '../types/marketplace';
import { CategoryIconSvg, InstantZapSvg, EscrowShieldSvg } from '../components/CustomIcons';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Plus,
  ChevronDown,
} from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const {
    listings,
    games: TRENDING_GAMES,
    serviceCategories: SERVICE_VERTICALS,
    selectedCategory,
    setSelectedCategory,
    selectedGame,
    setSelectedGame,
    globalSearchQuery,
    setGlobalSearchQuery,
    formatCurrency,
    navigateTo,
  } = useMarketplace();

  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string>('All');
  const [instantOnly, setInstantOnly] = useState(false);
  const [onlineSellersOnly, setOnlineSellersOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'rating'>(
    'recommended'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const availableServers = useMemo(() => {
    if (selectedGame) {
      return ['All', ...selectedGame.servers];
    }
    return ['All', 'North America', 'Europe', 'Asia', 'Global'];
  }, [selectedGame]);

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedGame ? 1 : 0) +
    (selectedServer !== 'All' ? 1 : 0) +
    (instantOnly ? 1 : 0) +
    (onlineSellersOnly ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0);

  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        if (selectedGame && item.gameId !== selectedGame.id) return false;
        if (selectedCategory !== 'All' && item.serviceType !== selectedCategory) return false;
        if (selectedServer !== 'All') {
          const regionStr = `${item.attributes.region || ''} ${item.attributes.server || ''}`;
          if (!regionStr.toLowerCase().includes(selectedServer.toLowerCase())) return false;
        }
        if (instantOnly && item.deliverySpeed !== 'Instant') return false;
        if (onlineSellersOnly && !item.seller.isOnline) return false;
        if (minPrice && item.price < parseFloat(minPrice)) return false;
        if (maxPrice && item.price > parseFloat(maxPrice)) return false;
        if (globalSearchQuery.trim()) {
          const q = globalSearchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchGame = item.gameTitle.toLowerCase().includes(q);
          const matchSeller = item.seller.username.toLowerCase().includes(q);
          if (!matchTitle && !matchGame && !matchSeller) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.seller.ratingPercentage - a.seller.ratingPercentage;
        return 0;
      });
  }, [
    listings,
    selectedGame,
    selectedCategory,
    selectedServer,
    instantOnly,
    onlineSellersOnly,
    minPrice,
    maxPrice,
    globalSearchQuery,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedGame(null);
    setSelectedServer('All');
    setInstantOnly(false);
    setOnlineSellersOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setGlobalSearchQuery('');
  };

  return (
    <div className="pb-20 space-y-5 bg-white w-full max-w-[100vw] overflow-x-hidden pt-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        {/* Title Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {selectedGame ? `${selectedGame.title} Marketplace` : 'Marketplace Offers'}
            </h1>
            <p className="text-xs text-slate-500">
              Showing <strong className="font-mono text-slate-800">{filteredListings.length}</strong>{' '}
              verified escrow listings
            </p>
          </div>
          <button
            onClick={() => navigateTo('dashboard')}
            className="btn-glass-primary px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Sell</span>
          </button>
        </div>

        {/* Minimized Single-Row Filter Bar (Expandable on Click) */}
        <div className="surface-glass-card rounded-2xl p-3 bg-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Search input + Expand Filters button */}
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[220px]">
              <button
                type="button"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="btn-glass-primary px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>
                  Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
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
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Search offers, accounts, coins..."
                  className="w-full h-9 pl-8 pr-3 rounded-xl bg-white border border-sky-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Sort & View Switcher */}
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-glass-light px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Reset
                </button>
              )}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-9 px-3 rounded-xl bg-white border border-sky-300 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="recommended">Sort: Best Match</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Seller Rating</option>
              </select>

              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl cursor-pointer ${
                    viewMode === 'grid' ? 'btn-glass-primary' : 'btn-glass-light'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl cursor-pointer ${
                    viewMode === 'list' ? 'btn-glass-primary' : 'btn-glass-light'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filter Drawer (Only shown when user expands Filters) */}
          {filtersExpanded && (
            <div className="pt-3 border-t border-sky-100 space-y-4">
              {/* Service Categories */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Category
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                      selectedCategory === 'All' ? 'btn-glass-primary' : 'btn-glass-light'
                    }`}
                  >
                    All Categories
                  </button>
                  {SERVICE_VERTICALS.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name as ServiceVertical)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                        selectedCategory === cat.name ? 'btn-glass-primary' : 'btn-glass-light'
                      }`}
                    >
                      <CategoryIconSvg category={cat.name} className="w-3.5 h-3.5 text-sky-800" />
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Game, Server, Price, and Toggles in a compact responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Game
                  </label>
                  <select
                    value={selectedGame?.id || 'all'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'all') {
                        setSelectedGame(null);
                      } else {
                        const found = TRENDING_GAMES.find((g) => g.id === val) || null;
                        setSelectedGame(found);
                      }
                      setSelectedServer('All');
                    }}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-sky-300 text-xs font-semibold text-slate-800"
                  >
                    <option value="all">All Games</option>
                    {TRENDING_GAMES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Server / Region
                  </label>
                  <select
                    value={selectedServer}
                    onChange={(e) => setSelectedServer(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white border border-sky-300 text-xs font-semibold text-slate-800"
                  >
                    {availableServers.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Price Range (USD)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-xl bg-white border border-sky-300 text-xs font-mono text-slate-800"
                    />
                    <span className="text-slate-400 text-xs">–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-xl bg-white border border-sky-300 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInstantOnly(!instantOnly)}
                    className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      instantOnly ? 'btn-glass-primary' : 'btn-glass-light'
                    }`}
                  >
                    <InstantZapSvg className="w-3.5 h-3.5" />
                    <span>Instant Only</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlineSellersOnly(!onlineSellersOnly)}
                    className={`h-9 px-3 rounded-xl text-xs font-bold cursor-pointer ${
                      onlineSellersOnly ? 'btn-glass-primary' : 'btn-glass-light'
                    }`}
                  >
                    Online Sellers
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Listing Results */}
        {filteredListings.length === 0 ? (
          <div className="surface-glass-card rounded-2xl p-10 text-center space-y-3 bg-white">
            <EscrowShieldSvg className="w-10 h-10 mx-auto" />
            <div className="text-base font-extrabold text-slate-800">
              No matching offers found
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={clearAllFilters}
                className="btn-glass-light px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => navigateTo('dashboard')}
                className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Sell Item</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredListings.map((listing) => (
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
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
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
        ) : (
          <div className="space-y-3">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                onClick={() => navigateTo('listing_detail', { listingId: listing.id })}
                className="surface-glass-card surface-glass-card-hover rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group bg-white"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <img
                    src={listing.media[0]}
                    alt={listing.title}
                    className="w-24 h-16 rounded-xl object-cover shrink-0 border border-sky-200"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-[11px] text-slate-500">
                      <strong className="text-sky-700">{listing.gameTitle}</strong> ·{' '}
                      {listing.serviceType}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 truncate">
                      {listing.title}
                    </h3>
                    <div className="text-xs text-slate-500">
                      Seller: <strong className="text-slate-700">{listing.seller.username}</strong>{' '}
                      ({listing.seller.ratingPercentage}%) · {listing.deliverySpeed}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-sky-100">
                  <div className="text-lg font-black font-mono text-slate-900">
                    {formatCurrency(listing.price)}
                  </div>
                  <span className="btn-glass-primary px-3.5 py-1.5 rounded-xl text-xs font-bold">
                    Inspect Offer
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
