import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    console.log('🚀 InstallPWA Component Mounted');

    // Check if already installed
    const isInStandaloneMode = () => {
      const standalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      
      console.log('📱 Standalone Mode:', standalone);
      return standalone;
    };
    
    const standalone = isInStandaloneMode();
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    console.log('🍎 Is iOS:', iOS);

    // If already installed, don't show banner
    if (standalone) {
      console.log('✅ App already installed - not showing banner');
      return;
    }

    // Check if dismissed recently
    const dismissData = localStorage.getItem('pwa-install-dismissed');
    if (dismissData) {
      try {
        const { timestamp, count } = JSON.parse(dismissData);
        const now = Date.now();
        const hoursSinceDismiss = (now - timestamp) / (1000 * 60 * 60);
        
        // Progressive delay based on dismiss count
        let delayHours = 24; // Default 24 hours
        
        if (count === 1) delayHours = 24; // 1 day after first dismiss
        if (count === 2) delayHours = 72; // 3 days after second dismiss
        if (count >= 3) delayHours = 168; // 7 days after third+ dismiss
        
        console.log(`⏰ Dismissed ${count} time(s), ${hoursSinceDismiss.toFixed(1)} hours ago`);
        console.log(`⏳ Will show again after ${delayHours} hours`);
        
        if (hoursSinceDismiss < delayHours) {
          console.log('🚫 Install prompt dismissed recently - not showing');
          return;
        } else {
          // Clear old dismiss flag
          localStorage.removeItem('pwa-install-dismissed');
          console.log('✨ Dismiss period expired - showing banner again');
        }
      } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('pwa-install-dismissed');
      }
    }

    // Listen for install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎉 beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after 2 seconds
      setTimeout(() => {
        console.log('✨ Showing install prompt (Android)');
        setShowInstallPrompt(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show banner after delay
    if (iOS && !standalone) {
      setTimeout(() => {
        console.log('✨ Showing install prompt (iOS)');
        setShowInstallPrompt(true);
      }, 3000);
    }

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA was installed successfully');
      setShowInstallPrompt(false);
      // Clear dismiss data on successful install
      localStorage.removeItem('pwa-install-dismissed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('👆 Install button clicked');
    
    if (!deferredPrompt) {
      console.warn('⚠️ No deferred prompt available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      console.log('📊 User choice:', outcome);

      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
        // Clear dismiss data on successful install
        localStorage.removeItem('pwa-install-dismissed');
      } else {
        console.log('❌ User dismissed the install prompt from native dialog');
      }

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('❌ Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    console.log('🚫 Install banner dismissed manually');
    
    // Get current dismiss count
    const dismissData = localStorage.getItem('pwa-install-dismissed');
    let count = 1;
    
    if (dismissData) {
      try {
        const parsed = JSON.parse(dismissData);
        count = (parsed.count || 0) + 1;
      } catch (e) {
        count = 1;
      }
    }
    
    // Save dismiss data with count
    localStorage.setItem('pwa-install-dismissed', JSON.stringify({
      timestamp: Date.now(),
      count: count
    }));
    
    console.log(`📊 Dismissed ${count} time(s)`);
    setShowInstallPrompt(false);
  };

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  // Don't show if not ready
  if (!showInstallPrompt) {
    return null;
  }

  console.log('✅ Rendering install banner');

  // iOS Install Instructions
  if (isIOS) {
    return (
      <div className="pwa-install-banner ios-install">
        <div className="install-content">
          <img src="/icons/icon-96x96.png" alt="SNM Jewellery" className="install-icon" />
          <div className="install-text">
            <h4>Install SNM Jewellery App</h4>
            <p>
              Tap <span className="ios-share-icon">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
                  <path d="M8 0L3 5h3v7h4V5h3L8 0zm-7 18v2h14v-2H1z"/>
                </svg>
              </span> then "Add to Home Screen"
            </p>
          </div>
          <button 
            onClick={handleDismiss} 
            className="dismiss-btn"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Android/Chrome Install Prompt
  if (deferredPrompt) {
    return (
      <div className="pwa-install-banner" onClick={handleInstallClick}>
        <div className="install-content">
          <img src="/icons/icon-96x96.png" alt="SNM Jewellery" className="install-icon" />
          <div className="install-text">
            <h4>Install SNM Jewellery</h4>
            <p>Get quick access to our jewelry collection</p>
          </div>
          <div className="install-actions">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleInstallClick();
              }} 
              className="install-btn"
            >
              Install
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }} 
              className="dismiss-btn"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallPWA;