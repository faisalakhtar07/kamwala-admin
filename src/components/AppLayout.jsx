import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Topbar from './Topbar';

export default function AppLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-cloud-50">
      <Sidebar />
      <div className="md:pl-64">
        <Topbar title={title} />
        <main className="p-4 md:p-8 pb-24 md:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
