import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellRing, Search } from 'lucide-react';
import { getNotifications } from '../api/misc';
import InstallPrompt from './InstallPrompt';
import { playNotificationSound } from '../utils/sound';
import { enablePushNotifications, getPushPermission, isPushSupported } from '../utils/push';

export default function Topbar({ title }) {
  const [unread, setUnread] = useState(0);
  const [pushPermission, setPushPermission] = useState(getPushPermission());
  const prevUnreadRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const poll = () => {
      getNotifications({ unreadOnly: 'true' })
        .then((d) => {
          if (!mounted) return;
          const count = d.unreadCount || 0;
          // A live-in-tab sound alert, same proven pattern as the worker
          // dashboard's "New Work" polling - fires whenever the unread
          // count goes up, e.g. a customer just booked a new request.
          if (prevUnreadRef.current !== null && count > prevUnreadRef.current) {
            playNotificationSound();
          }
          prevUnreadRef.current = count;
          setUnread(count);
        })
        .catch(() => {});
    };

    poll();
    const interval = setInterval(poll, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleEnableNotifications = async () => {
    const ok = await enablePushNotifications();
    setPushPermission(getPushPermission());
    if (!ok && getPushPermission() === 'denied') {
      // Browser will never re-prompt once denied - nothing more we can do
      // from here except point them at their browser's site settings.
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-cloud-200 h-16 flex items-center gap-4 px-4 md:px-8">
      <h1 className="font-display font-semibold text-lg md:text-xl">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <InstallPrompt compact />

        {isPushSupported() && pushPermission !== 'granted' && (
          <button
            type="button"
            onClick={handleEnableNotifications}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-pill px-3 py-1.5 hover:bg-brand-100 transition-colors"
            title="Get a real notification (lock screen included) for new requests, even with this tab closed"
          >
            <BellRing size={14} />
            {pushPermission === 'denied' ? 'Notifications blocked' : 'Enable notifications'}
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 bg-cloud-50 border border-cloud-200 rounded-pill px-3.5 py-2 w-64 focus-within:border-brand-400 transition-colors">
          <Search size={16} className="text-ink-500" />
          <input
            placeholder="Search request ID, customer..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-ink-500"
          />
        </div>

        <Link
          to="/more"
          className="relative h-10 w-10 rounded-full bg-cloud-50 border border-cloud-200 flex items-center justify-center hover:bg-cloud-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-ink-700" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
