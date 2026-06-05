if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        if (import.meta.env.DEV) {
          console.log('SW registered:', registration.scope);
        }

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          if (import.meta.env.DEV) {
            console.log('SW update found, installing...');
          }

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              if (import.meta.env.DEV) {
                console.log('SW update installed and waiting');
              }
              window.dispatchEvent(new CustomEvent('braindrop:sw-update-available', { detail: registration }));
            }
          };
        };
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
