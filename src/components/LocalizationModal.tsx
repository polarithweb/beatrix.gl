import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Globe, Check, X, Search } from 'lucide-react';

const REGIONS = [
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$', rate: 1.0 },
  { code: 'EU', name: 'European Union', currency: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹', rate: 83.5 },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥', rate: 154.2 },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'CA$', rate: 1.37 },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$', rate: 1.52 },
];

const LANGUAGES = [
  { code: 'EN', name: 'English' },
  { code: 'ES', name: 'Español' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'FR', name: 'Français' },
  { code: 'JA', name: '日本語' },
  { code: 'HI', name: 'हिन्दी' },
];

export const LocalizationModal: React.FC = () => {
  const { localization, updateLocalization, localizationModalOpen, setLocalizationModalOpen } =
    useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(localization.regionCode);
  const [selectedLang, setSelectedLang] = useState(localization.langCode);
  const [selectedCurrency, setSelectedCurrency] = useState(localization.currency);

  if (!localizationModalOpen) return null;

  const filteredRegions = REGIONS.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.currency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    const reg = REGIONS.find((r) => r.code === selectedRegion) || REGIONS[0];
    const currObj = REGIONS.find((r) => r.currency === selectedCurrency) || reg;
    const langObj = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

    updateLocalization({
      region: reg.name,
      regionCode: reg.code,
      language: langObj.name,
      langCode: langObj.code,
      currency: currObj.currency,
      currencySymbol: currObj.symbol,
      exchangeRate: currObj.rate,
    });
    setLocalizationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl surface-glass-card p-6 space-y-5 text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-500/15">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Regional & Currency Preferences
              </h3>
              <p className="text-xs text-slate-500">
                Customize display currency, server region, and interface language
              </p>
            </div>
          </div>
          <button
            onClick={() => setLocalizationModalOpen(false)}
            className="btn-glass-light p-1.5 rounded-lg text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Search filter */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search country or currency code (e.g. INR, EUR, USD)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-emerald-500/20 bg-white/90 focus:outline-none focus:border-emerald-500 text-slate-900"
            />
          </div>

          {/* Region Grid */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Region / Country
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {filteredRegions.map((r) => (
                <button
                  key={r.code}
                  onClick={() => {
                    setSelectedRegion(r.code);
                    setSelectedCurrency(r.currency);
                  }}
                  className={`p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedRegion === r.code ? 'btn-glass-primary' : 'btn-glass-light'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{r.name}</div>
                    <div
                      className={`text-[10px] ${
                        selectedRegion === r.code ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {r.code} · {r.currency} ({r.symbol})
                    </div>
                  </div>
                  {selectedRegion === r.code && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Interface Language
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setSelectedLang(l.code)}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    selectedLang === l.code ? 'btn-glass-primary' : 'btn-glass-light'
                  }`}
                >
                  <span>{l.name}</span>
                  {selectedLang === l.code && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Settlement Currency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['USD', 'EUR', 'INR', 'GBP', 'JPY', 'CAD', 'AUD'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`p-2 rounded-xl text-xs font-mono font-bold text-center transition-all cursor-pointer ${
                    selectedCurrency === curr ? 'btn-glass-primary' : 'btn-glass-light'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-emerald-500/15 flex justify-end gap-3">
          <button
            onClick={() => setLocalizationModalOpen(false)}
            className="btn-glass-light px-4 py-2 text-xs font-bold rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-glass-primary px-5 py-2 text-xs font-bold rounded-xl cursor-pointer"
          >
            Apply Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
