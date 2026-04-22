// hooks/useInstallPrompt.ts
import { useState, useEffect } from 'react';

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.matchMedia('(display-mode: standalone)').matches;

    setIsIOS(ios);
    setIsInstalled(standalone);

    // Android/Chrome — capturar el prompt nativo
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setIsInstallable(false);
    setPrompt(null);
  };

  return { isInstallable, install, isIOS, isInstalled };
}