import React from 'react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenSellModal: () => void;
  onAuthClick: () => void;
  currentUserLabel: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenSellModal,
  onAuthClick,
  currentUserLabel,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-2.5 gap-x-4 sm:gap-8">
        {/* Left: Typography-only brand header — zero logos or decorative icons */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSearchChange('');
          }}
          className="order-1 text-lg sm:text-xl font-bold tracking-tight text-[#0F172A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 rounded-sm"
        >
          Polarith Gamerz
        </a>

        {/* Center: Simple search input */}
        <div className="order-3 sm:order-2 w-full sm:w-auto sm:flex-1 sm:max-w-md">
          <div className="relative">
            <label htmlFor="marketplace-search" className="sr-only">
              Search games, accounts, or items
            </label>
            <input
              id="marketplace-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search games, accounts, or items..."
              className="w-full h-9 sm:h-10 pl-3.5 pr-8 text-sm text-[#0F172A] bg-[#F8FAFC] border border-slate-200 rounded-lg placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 focus:outline-none transition-colors"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l8 8M14 6l-8 8"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Right: "Sell Item" button and "Sign In" button */}
        <div className="order-2 sm:order-3 flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenSellModal}
            className="h-9 sm:h-10 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sell Item
          </button>

          <button
            type="button"
            onClick={onAuthClick}
            className="h-9 sm:h-10 px-3.5 sm:px-4 text-xs sm:text-sm font-medium text-[#0F172A] bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {currentUserLabel ? `Sign Out (${currentUserLabel})` : 'Sign In'}
          </button>
        </div>
      </div>
    </header>
  );
};
