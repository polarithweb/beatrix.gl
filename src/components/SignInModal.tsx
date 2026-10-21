import React, { useState } from 'react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  onDemoSignIn: (handle: string) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
  onDemoSignIn,
}) => {
  const [sellerHandle, setSellerHandle] = useState('PolarithPro');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleClick = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      await onGoogleSignIn();
      onClose();
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Google sign-in popup could not complete. You can also sign in with a seller handle below.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sellerHandle.trim();
    if (cleaned.length < 2) {
      setAuthError('Seller handle must be at least 2 characters.');
      return;
    }
    onDemoSignIn(cleaned);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-in-modal-title"
    >
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <h2
            id="sign-in-modal-title"
            className="text-lg font-bold text-[#0F172A]"
          >
            Sign In to Polarith Gamerz
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
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
        </div>

        <div className="space-y-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleClick}
            className="w-full h-10 px-4 flex items-center justify-center gap-2.5 text-sm font-semibold text-[#0F172A] bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-xs text-slate-400">or</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <form onSubmit={handleQuickSignIn} className="space-y-3">
            <div>
              <label
                htmlFor="seller-handle-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Seller Handle
              </label>
              <input
                id="seller-handle-input"
                type="text"
                value={sellerHandle}
                maxLength={50}
                onChange={(e) => setSellerHandle(e.target.value)}
                className="w-full h-10 px-3.5 text-sm text-[#0F172A] bg-[#F8FAFC] border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-600" role="alert">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-10 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              Continue as Verified Seller
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
