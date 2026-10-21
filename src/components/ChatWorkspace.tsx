import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { EscrowShieldSvg } from './CustomIcons';
import {
  Send,
  Image,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Maximize2,
  X,
  Search,
  Lock,
} from 'lucide-react';

interface ChatWorkspaceProps {
  isFullScreen?: boolean;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({ isFullScreen = false }) => {
  const {
    chatDrawerOpen,
    setChatDrawerOpen,
    conversations,
    activeChatConvId,
    setActiveChatConvId,
    sendChatMessage,
    confirmOrderReceived,
    raiseDispute,
    orders,
    navigateTo,
    formatCurrency,
  } = useMarketplace();

  const [filterTab, setFilterTab] = useState<'All' | 'Unread' | 'Active Orders'>('All');
  const [inputText, setInputText] = useState('');
  const [searchConvQuery, setSearchConvQuery] = useState('');
  const [attachNotice, setAttachNotice] = useState<string | null>(null);

  const activeConv = conversations.find((c) => c.id === activeChatConvId) || conversations[0];
  const activeOrder = orders.find((o) => o.id === activeConv?.orderId);

  const filteredConversations = conversations.filter((c) => {
    if (filterTab === 'Active Orders' && !c.orderId) return false;
    if (filterTab === 'Unread' && c.unreadCount === 0) return false;
    if (searchConvQuery) {
      return (
        c.withUser.username.toLowerCase().includes(searchConvQuery.toLowerCase()) ||
        (c.orderId && c.orderId.toLowerCase().includes(searchConvQuery.toLowerCase()))
      );
    }
    return true;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    sendChatMessage(activeConv.id, inputText);
    setInputText('');
  };

  const insertQuickReply = (phrase: string) => {
    setInputText(phrase);
  };

  if (!isFullScreen && !chatDrawerOpen) return null;

  return (
    <div
      className={
        isFullScreen
          ? 'max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[600px] flex flex-col w-full max-w-[100vw] overflow-x-hidden'
          : 'fixed bottom-3 right-3 sm:bottom-4 sm:right-4 w-[calc(100vw-1.5rem)] sm:w-[820px] max-w-[calc(100vw-1.5rem)] h-[540px] sm:h-[580px] surface-glass-card rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col'
      }
    >
      {/* Drawer Top Header (only in floating mode) */}
      {!isFullScreen && (
        <div className="h-12 px-4 bg-emerald-50/60 border-b border-emerald-500/15 text-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <EscrowShieldSvg className="w-5 h-5 shrink-0" />
            <span className="font-bold text-xs sm:text-sm truncate">
              Live Order & Trade Chat
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setChatDrawerOpen(false);
                navigateTo('chat');
              }}
              title="Expand to Full-Screen Workspace"
              className="btn-glass-light p-1.5 rounded-lg cursor-pointer text-slate-600"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChatDrawerOpen(false)}
              title="Close Chat Drawer"
              className="btn-glass-light p-1.5 rounded-lg cursor-pointer text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Responsive Workspace Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden surface-glass-card rounded-2xl">
        {/* Left Pane: Conversation List */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-emerald-500/15 flex flex-col bg-emerald-50/20 shrink-0 max-h-40 md:max-h-none">
          <div className="p-3 border-b border-emerald-500/15 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders, sellers..."
                value={searchConvQuery}
                onChange={(e) => setSearchConvQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-2 text-xs bg-white/90 border border-emerald-500/20 rounded-xl outline-hidden text-slate-900"
              />
            </div>

            <div className="flex gap-1 text-[11px] font-semibold">
              {(['All', 'Active Orders', 'Unread'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`flex-1 py-1 rounded-lg text-center cursor-pointer ${
                    filterTab === tab ? 'btn-glass-primary' : 'btn-glass-light'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-emerald-500/10">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No active conversations yet.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === activeConv?.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveChatConvId(c.id)}
                    className={`w-full p-3 text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-50/80' : 'hover:bg-emerald-50/40'
                    }`}
                  >
                    <img
                      src={c.withUser.avatar}
                      alt={c.withUser.username}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {c.withUser.username}
                        </span>
                        <span className="text-[10px] text-slate-400">{c.lastTimestamp}</span>
                      </div>
                      {c.orderId && (
                        <div className="text-[10px] font-mono font-semibold text-emerald-700 truncate">
                          #{c.orderId}
                        </div>
                      )}
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.lastMessage}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center Pane: Active Chat Stream */}
        <div className="flex-1 flex flex-col bg-white/70 min-w-0">
          <div className="px-3.5 py-2 bg-emerald-50/80 border-b border-emerald-200/70 flex items-center justify-between gap-2 text-emerald-950 text-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-medium leading-tight truncate">
                <strong>GamerProtect Safety:</strong> Keep all trade communication inside chat for escrow coverage.
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 shrink-0">
              ESCROW ACTIVE
            </span>
          </div>

          {activeConv ? (
            <>
              <div className="px-4 py-2.5 border-b border-emerald-500/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={activeConv.withUser.avatar}
                    alt={activeConv.withUser.username}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {activeConv.withUser.username}
                    </span>
                  </div>
                </div>

                {activeConv.orderStatus && (
                  <span className="text-[11px] font-mono font-semibold text-emerald-700 shrink-0">
                    {activeConv.orderStatus}
                  </span>
                )}
              </div>

              {/* Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                {activeConv.messages.map((m) => {
                  if (m.isSystemMilestone) {
                    return (
                      <div
                        key={m.id}
                        className="my-3 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950"
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {m.milestoneTitle || 'Escrow Milestone'}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-700">
                            {m.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed">{m.text}</p>
                      </div>
                    );
                  }

                  const isMe = m.senderId === 'buyer';
                  return (
                    <div
                      key={m.id}
                      className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <img
                          src={activeConv.withUser.avatar}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                      )}
                      <div
                        className={`max-w-[78%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'btn-glass-primary rounded-br-xs'
                            : 'bg-white text-slate-800 rounded-bl-xs border border-emerald-500/15 shadow-2xs'
                        }`}
                      >
                        <div>{m.text}</div>
                        <div
                          className={`text-[9px] mt-1 text-right font-mono ${
                            isMe ? 'text-emerald-100' : 'text-slate-400'
                          }`}
                        >
                          {m.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick-Reply Suggestions */}
              <div className="px-3 py-1.5 border-t border-emerald-500/10 flex flex-wrap items-center gap-1.5 text-[11px]">
                {[
                  'Ready for trade invite',
                  'Confirmed in game, thank you!',
                  'Can you confirm the email transfer?',
                ].map((phrase) => (
                  <button
                    key={phrase}
                    type="button"
                    onClick={() => insertQuickReply(phrase)}
                    className="btn-glass-light px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap cursor-pointer"
                  >
                    {phrase}
                  </button>
                ))}
                {attachNotice && (
                  <span className="text-[10px] text-emerald-700 font-semibold ml-auto">
                    {attachNotice}
                  </span>
                )}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-emerald-500/15 flex items-center gap-2 bg-white/90"
              >
                <button
                  type="button"
                  title="Attach trade screenshot proof"
                  onClick={() => {
                    setAttachNotice('GamerProtect watermarked uploader ready');
                    setTimeout(() => setAttachNotice(null), 2500);
                  }}
                  className="btn-glass-light p-2 rounded-xl text-slate-600 cursor-pointer"
                >
                  <Image className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type message to seller..."
                  className="flex-1 h-9 px-3 text-xs bg-white border border-emerald-500/20 rounded-xl outline-hidden text-slate-900 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="btn-glass-primary h-9 px-3.5 disabled:opacity-40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-2">
              <EscrowShieldSvg className="w-10 h-10" />
              <div className="text-sm font-bold text-slate-800">No Active Trade Chats</div>
              <p className="text-xs text-slate-500 max-w-xs">
                Open a chat with a seller from any marketplace offer or purchase an order to start an escrow-protected conversation.
              </p>
            </div>
          )}
        </div>

        {/* Right Pane: Order Action Context Panel */}
        <div className="hidden lg:flex w-64 border-l border-emerald-500/15 p-4 bg-emerald-50/20 flex-col justify-between text-xs shrink-0">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/15 mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Order Action Panel
              </span>
              <span className="text-[10px] font-bold text-emerald-700">Escrow Active</span>
            </div>

            {activeOrder ? (
              <div className="space-y-3">
                <div className="p-3 bg-white/90 border border-emerald-500/15 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-400 mb-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>Delivery SLA Timer</span>
                  </div>
                  <div className="text-xl font-black font-mono text-slate-900">
                    {activeOrder.status === 'Completed' ? 'COMPLETED' : '01:00:00'}
                  </div>
                </div>

                <div className="p-3 bg-white/90 border border-emerald-500/15 rounded-xl space-y-1.5">
                  <div className="text-[10px] font-mono text-emerald-700 font-bold">
                    #{activeOrder.id}
                  </div>
                  <div className="font-bold text-slate-900 line-clamp-2">
                    {activeOrder.listingTitle}
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-emerald-500/10">
                    <span className="text-slate-400">Escrow Locked:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(activeOrder.total)}
                    </span>
                  </div>
                </div>

                {activeOrder.deliveryInstructions && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                      Encrypted Vault Credentials
                    </span>
                    <code className="text-[11px] font-mono font-bold text-emerald-950 block break-all">
                      {activeOrder.deliveryInstructions}
                    </code>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => confirmOrderReceived(activeOrder.id)}
                    disabled={activeOrder.status === 'Completed'}
                    className="btn-glass-primary w-full py-2.5 px-3 rounded-xl disabled:opacity-40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {activeOrder.status === 'Completed'
                        ? 'Order Confirmed'
                        : 'Confirm Order Received'}
                    </span>
                  </button>

                  <button
                    onClick={() => raiseDispute(activeOrder.id)}
                    disabled={activeOrder.status === 'Completed'}
                    className="btn-glass-light w-full py-2 px-3 rounded-xl text-red-600 disabled:opacity-40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Raise Dispute</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-xs">
                Select a conversation with an active order to manage escrow release.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
