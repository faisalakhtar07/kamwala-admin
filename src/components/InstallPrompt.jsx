import { useEffect, useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { Button } from './Form';

export default function InstallPrompt({ compact }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setInstalled(standalone);

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  if (installed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-mint-600">
        <CheckCircle2 size={14} /> Installed
      </span>
    );
  }
  if (!deferredPrompt) return null;

  return (
    <Button size="sm" variant="outline" onClick={handleInstall}>
      <Download size={14} /> Install App
    </Button>
  );
}
