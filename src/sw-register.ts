if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        if (import.meta.env.DEV) {
          console.log('SW registered:', registration.scope);
        }
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
