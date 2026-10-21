import React from 'react';
import { FILTER_CATEGORIES, FilterCategory } from '../utils/marketplace';

interface CategoryPillsProps {
  selectedCategory: FilterCategory;
  onSelectCategory: (category: FilterCategory) => void;
  totalCount: number;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  totalCount,
}) => {
  return (
    <nav
      aria-label="Marketplace categories"
      className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-slate-200/80"
    >
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {FILTER_CATEGORIES.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              aria-pressed={isActive}
              className={`h-10 px-4 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                isActive
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-[#0F172A]'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="text-xs font-medium text-slate-500 font-mono tabular-nums whitespace-nowrap">
        {totalCount} {totalCount === 1 ? 'listing' : 'listings'} available
      </div>
    </nav>
  );
};
