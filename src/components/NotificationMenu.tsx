import React, { useRef, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { EscrowShieldSvg } from './CustomIcons';
import { CheckCircle2, Clock } from 'lucide-react';

export const NotificationMenu: React.FC = () => {
  const {
    notificationsOpen,
    setNotificationsOpen,
    orders,
    siteConfig,
    navigateTo,
    formatCurrency,
  } = useMarketplace();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setNotificationsOpen]);

  if (!notificationsOpen) return null;

  const customAlerts = siteConfig.customNotifications || [];

  return (
    <div
      ref={menuRef}
      className="fixed sm:absolute right-4 top-16 w-[calc(100vw-2rem)] sm:w-96 surface-glass-card rounded-2xl p-4 z-50 text-slate-900"
    >
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/15">
        <h4 className="font-bold text-sm text-slate-900">Order Alerts & Activity</h4>
        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
          <EscrowShieldSvg className="w-3.5 h-3.5" />
          GamerProtect
        </span>
      </div>

      {orders.length === 0 && customAlerts.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No active order notifications yet.
        </div>
      ) : (
        <div className="py-2 divide-y divide-emerald-500/10 max-h-80 overflow-y-auto">
          {customAlerts.map((alert) => (
            <div
              key={alert.id}
              className="py-3 flex items-start gap-3 bg-emerald-50/35 -mx-2 px-2 rounded-xl text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold">
                SYS
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-slate-900 truncate">
                    {alert.title}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 shrink-0">
                    {alert.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  {alert.message}
                </p>
                <div className="mt-1 text-[10px] text-slate-400 font-mono">
                  {alert.timestamp}
                </div>
              </div>
            </div>
          ))}

          {orders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => {
                setNotificationsOpen(false);
                navigateTo('chat');
              }}
              className="py-3 flex items-start gap-3 hover:bg-emerald-50/40 -mx-2 px-2 rounded-xl transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                {ord.status === 'Completed' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {ord.gameTitle} · Order #{ord.id}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 shrink-0">
                    {ord.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {ord.deliveryInstructions}
                </p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <span>Seller: {ord.sellerUsername}</span>
                  <span className="font-mono font-bold text-slate-700">
                    {formatCurrency(ord.total)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-emerald-500/15 flex justify-between items-center text-xs">
        <button
          onClick={() => {
            setNotificationsOpen(false);
            navigateTo('dashboard');
          }}
          className="text-emerald-700 font-semibold hover:underline cursor-pointer"
        >
          View all orders in Dashboard
        </button>
      </div>
    </div>
  );
};
