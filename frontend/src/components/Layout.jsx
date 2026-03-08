import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import SOSButton from './SOSButton';
import FakeCallButton from './FakeCallButton';

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="animate-in">
            <Outlet />
          </div>
        </main>
      </div>
      <SOSButton />
      <FakeCallButton />
    </div>
  );
}
