import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import GlobalOrderNotifier from './GlobalOrderNotifier';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100 font-sans antialiased text-gray-900 overflow-hidden">
      {/* Global Order Notifier - Active in all layout pages */}
      <GlobalOrderNotifier />

      {/* Sidebar - Fixed width */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Simple Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Point of Sale</h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-green-500 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              ONLINE
            </span>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
