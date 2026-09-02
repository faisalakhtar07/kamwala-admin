import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  ClipboardList,
  Grid3x3,
  Users,
  HardHat,
  UserPlus,
  Tag,
  Star,
  LifeBuoy,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/requests', label: 'Requests', icon: ClipboardList },
  { to: '/categories', label: 'Categories', icon: Grid3x3 },
  { to: '/services', label: 'Services & Pricing', icon: Tag },
  { to: '/workers', label: 'Workers', icon: HardHat },
  { to: '/worker-applications', label: 'Worker Applications', icon: UserPlus },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/support', label: 'Support', icon: LifeBuoy },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-cloud-200 bg-white">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-cloud-200">
        <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-display font-bold text-sm">
          K
        </div>
        <div>
          <p className="font-display font-bold text-sm leading-none">KAMWALA</p>
          <p className="text-[11px] text-ink-500 mt-0.5">Operator Console</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-700 hover:bg-cloud-50 hover:text-ink-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-cloud-200">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-mint-100 text-mint-600 flex items-center justify-center text-sm font-semibold">
            {(admin?.name || 'A').charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{admin?.name || 'Admin'}</p>
            <p className="text-xs text-ink-500 truncate">{admin?.mobile}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-rose-50 hover:text-rose-500 transition-colors"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}
