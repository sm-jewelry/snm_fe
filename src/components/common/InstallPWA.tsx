import React, { useEffect, useState } from 'react';
import { X, Download, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  return (
    <div className={`fixed top-4 right-4 ${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-2xl z-[10000] flex items-center gap-3 animate-slideIn`}>
      {type === 'success' && <CheckCircle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [dismissCount, setDismissCount] = useState(0);
  const [lastDismissTime, setLastDismissTime] = useState<number | null>(null);
  const [permanentlyInstalled, setPermanentlyInstalled] = useState(false);

  useEffect(() => {

    // Check if already installed
    const isInStandaloneMode = () => {
      const standalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      return standalone;
    };
    
    const standalone = isInStandaloneMode();
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // If already installed, don't show banner
    if (standalone || permanentlyInstalled) {
      return;
    }

    // Check if should show based on dismiss history
    if (lastDismissTime && dismissCount > 0) {
      const now = Date.now();
      const hoursSinceDismiss = (now - lastDismissTime) / (1000 * 60 * 60);
      
      let delayHours = 24;
      if (dismissCount === 1) delayHours = 24; // 1 day
      else if (dismissCount === 2) delayHours = 72; // 3 days
      else if (dismissCount >= 3) delayHours = 168; // 7 days
      
      if (hoursSinceDismiss < delayHours) {
        return;
      }
    }

    // Listen for install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after 2 seconds
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show banner after delay
    if (iOS && !standalone) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setPermanentlyInstalled(true);
      setShowInstallPrompt(false);
      setDismissCount(0);
      setLastDismissTime(null);
      setToast({ message: 'App installed successfully! ✨', type: 'success' });
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [dismissCount, lastDismissTime, permanentlyInstalled]);

  const handleInstallClick = async () => {
    
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setPermanentlyInstalled(true);
        setDismissCount(0);
        setLastDismissTime(null);
        setShowInstallPrompt(false);
        setToast({ message: 'Installing app... 🚀', type: 'success' });
      } else {
        setShowInstallPrompt(false);
        setToast({ message: 'You can install anytime from your browser menu', type: 'info' });
      }

      setDeferredPrompt(null);
    } catch (error) {
      setToast({ message: 'Installation failed. Please try again.', type: 'error' });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    
    const newCount = dismissCount + 1;
    setDismissCount(newCount);
    setLastDismissTime(Date.now());
    setShowInstallPrompt(false);
    
    if (newCount === 1) {
      setToast({ message: "We'll remind you in 24 hours", type: 'info' });
    } else if (newCount === 2) {
      setToast({ message: "We'll remind you in 3 days", type: 'info' });
    } else {
      setToast({ message: "We'll remind you in 7 days", type: 'info' });
    }
  };

  // Don't show if already installed
  if (isStandalone || permanentlyInstalled) {
    return toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null;
  }

  // Don't show if not ready
  if (!showInstallPrompt) {
    return toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null;
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* iOS Install Instructions */}
      {isIOS ? (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 shadow-2xl z-[9999] animate-slideUp">
          <div className="max-w-6xl mx-auto flex items-center gap-4 relative">
            <img src="/icons/icon-96x96.png" alt="SNM" className="w-14 h-14 rounded-xl shadow-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="m-0 mb-1 text-base font-semibold leading-tight">Install SNM Jewellery App</h4>
              <p className="m-0 text-sm opacity-90 leading-tight flex items-center gap-1 flex-wrap">
                Tap 
                <span className="inline-flex items-center justify-center px-2 py-1 bg-white bg-opacity-20 rounded text-xs font-bold">
                  <svg width="14" height="14" viewBox="0 0 16 20" fill="currentColor">
                    <path d="M8 0L3 5h3v7h4V5h3L8 0zm-7 18v2h14v-2H1z"/>
                  </svg>
                </span>
                then "Add to Home Screen"
              </p>
            </div>
            <button 
              onClick={handleDismiss} 
              className="bg-white bg-opacity-20 border-0 text-white text-xl cursor-pointer p-2 opacity-90 transition-all rounded-md flex items-center justify-center min-w-9 min-h-9 flex-shrink-0 hover:opacity-100 hover:bg-opacity-30 active:scale-95"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : deferredPrompt ? (
        // Android/Chrome Custom Install UI (replaces default)
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-600 to-yellow-600 text-white p-4 shadow-2xl z-[9999] animate-slideUp">
          <div className="max-w-6xl mx-auto flex items-center gap-4 relative">
            <img src="/icons/icon-96x96.png" alt="SNM" className="w-14 h-14 rounded-xl shadow-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="m-0 mb-1 text-base font-semibold leading-tight">Install SNM Jewellery</h4>
              <p className="m-0 text-sm opacity-90 leading-tight">Get quick access to our jewelry collection</p>
            </div>
            <div className="flex gap-3 items-center flex-shrink-0">
              <button 
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="bg-white text-amber-600 border-0 px-6 py-2.5 rounded-lg font-semibold text-sm cursor-pointer transition-all shadow-lg whitespace-nowrap hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isInstalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Install
                  </>
                )}
              </button>
              <button 
                onClick={handleDismiss}
                disabled={isInstalling}
                className="bg-white bg-opacity-20 border-0 text-white text-xl cursor-pointer p-2 opacity-90 transition-all rounded-md flex items-center justify-center min-w-9 min-h-9 flex-shrink-0 hover:opacity-100 hover:bg-opacity-30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        @media (max-width: 768px) {
          .fixed.bottom-0 {
            padding: 0.75rem 0.625rem;
          }
          
          .fixed.bottom-0 img {
            width: 3rem;
            height: 3rem;
          }
          
          .fixed.bottom-0 h4 {
            font-size: 0.875rem;
          }
          
          .fixed.bottom-0 p {
            font-size: 0.75rem;
          }
          
          .fixed.bottom-0 button:not([aria-label="Close"]) {
            padding: 0.5rem 1rem;
            font-size: 0.8125rem;
          }
          
          .fixed.bottom-0 button[aria-label="Close"] {
            min-width: 2rem;
            min-height: 2rem;
            font-size: 1.125rem;
            padding: 0.375rem 0.625rem;
          }
        }

        @media (max-width: 480px) {
          .fixed.bottom-0 .max-w-6xl {
            gap: 0.5rem;
          }
          
          .fixed.bottom-0 img {
            width: 2.5rem;
            height: 2.5rem;
          }
          
          .fixed.bottom-0 h4 {
            font-size: 0.8125rem;
          }
          
          .fixed.bottom-0 p {
            font-size: 0.6875rem;
          }
          
          .fixed.bottom-0 button:not([aria-label="Close"]) {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default InstallPWA;