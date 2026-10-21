import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { EscrowShieldSvg } from '../components/CustomIcons';
import {
  ShoppingBag,
  User,
  CheckCircle2,
  Clock,
  MessageSquare,
  LogIn,
  LogOut,
  ArrowRight,
} from 'lucide-react';

export const BuyerProfilePage: React.FC = () => {
  const {
    currentUser,
    visitorId,
    signInWithGoogle,
    signOutUser,
    orders,
    availableBalance,
    formatCurrency,
    confirmOrderReceived,
    raiseDispute,
    openChatForSeller,
    navigateTo,
  } = useMarketplace();

  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Preparing' | 'Delivered' | 'Completed' | 'Disputed'
  >('All');

  const filteredOrders = orders.filter((ord) => {
    if (statusFilter !== 'All' && ord.status !== statusFilter) return false;
    return true;
  });

  const displayName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Beatrix Buyer';

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 w-full max-w-[100vw] overflow-x-hidden">
      {/* Top Buyer Header Bar */}
      <div className="bg-white border-b border-sky-200 py-5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-lg sm:text-xl text-slate-900 truncate">
                Buyer Account & Orders
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {currentUser?.email || `Buyer ID: ${visitorId.slice(0, 14)}`} · Buyer Mode
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigateTo('marketplace')}
              className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Browse Marketplace</span>
            </button>
            {currentUser ? (
              <button
                onClick={signOutUser}
                className="btn-glass-light px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="btn-glass-light px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Buyer Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="surface-glass-card rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">Buyer Account</div>
              <div className="text-base font-extrabold text-slate-900 mt-1">
                {displayName}
              </div>
              <div className="text-[11px] text-sky-700 font-semibold mt-0.5">
                Active Buyer Access
              </div>
            </div>
            <EscrowShieldSvg className="w-8 h-8 shrink-0" />
          </div>

          <div className="surface-glass-card rounded-2xl p-5">
            <div className="text-xs font-bold text-slate-500">Buyer Wallet Balance</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {formatCurrency(availableBalance)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Ready for instant checkout
            </div>
          </div>

          <div className="surface-glass-card rounded-2xl p-5">
            <div className="text-xs font-bold text-slate-500">Total Purchases</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {orders.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Protected by Beatrix.gl Escrow
            </div>
          </div>
        </div>

        {/* Purchased Orders Section */}
        <div className="surface-glass-card rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                My Purchased Orders
              </h2>
              <p className="text-xs text-slate-500">
                Track your purchases and release escrow once you receive your item in-game.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['All', 'Preparing', 'Delivered', 'Completed', 'Disputed'] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                      statusFilter === st ? 'btn-glass-primary' : 'btn-glass-light'
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3 border border-dashed border-sky-200 rounded-2xl bg-white">
              <ShoppingBag className="w-8 h-8 text-sky-600 mx-auto" />
              <div className="text-sm font-bold text-slate-900">
                No purchased orders found
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore the marketplace to buy game accounts, currency, skins, and top-ups with Beatrix.gl Escrow protection.
              </p>
              <button
                onClick={() => navigateTo('marketplace')}
                className="btn-glass-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl bg-white border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-700">
                        #{ord.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        {ord.status}
                      </span>
                      <span className="text-xs text-slate-400">{ord.createdAt}</span>
                    </div>
                    <div className="font-extrabold text-sm text-slate-900">
                      {ord.listingTitle}
                    </div>
                    <div className="text-xs text-slate-500">
                      Game: <strong className="text-slate-700">{ord.gameTitle}</strong> · Seller:{' '}
                      <strong className="text-slate-700">{ord.sellerUsername}</strong> · Qty:{' '}
                      {ord.quantity}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <div className="text-right mr-2">
                      <div className="text-sm font-black font-mono text-slate-900">
                        {formatCurrency(ord.total)}
                      </div>
                      <div className="text-[10px] text-slate-400">Escrow Total</div>
                    </div>

                    <button
                      onClick={() => openChatForSeller(ord.sellerId, ord.id)}
                      className="btn-glass-light px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat Seller</span>
                    </button>

                    {(ord.status === 'Preparing' || ord.status === 'Delivered') && (
                      <>
                        <button
                          onClick={() => confirmOrderReceived(ord.id)}
                          className="btn-glass-primary px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Received</span>
                        </button>
                        <button
                          onClick={() => raiseDispute(ord.id)}
                          className="btn-glass-light px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Dispute</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
