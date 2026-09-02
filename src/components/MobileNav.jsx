import { NavLink } from 'react-router-dom';
import { LayoutGrid, ClipboardList, HardHat, Users, MoreHorizontal } from 'lucide-react';

const LINKS = [
  { to: '/', label: 'Home', icon: LayoutGrid, end: true },
  { to: '/requests', label: 'Requests', icon: ClipboardList },
  { to: '/workers', label: 'Workers', icon: HardHat },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/more', label: 'More', icon: MoreHorizontal },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-cloud-200 flex items-stretch h-16 pb-[env(safe-area-inset-bottom)]">
      {LINKS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
              isActive ? 'text-brand-600' : 'text-ink-500'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
