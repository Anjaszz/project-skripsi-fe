import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaChartLine,
  FaBox,
  FaTags,
  FaHistory,
  FaCashRegister,
  FaFileAlt,
  FaSignOutAlt,
  FaUser,
  FaStore,
  FaClipboardList,
  FaExternalLinkAlt,
  FaCreditCard
} from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    // 1. Dashboard (Admin)
    ...(isAdmin ? [{ path: '/dashboard', label: 'Dashboard', icon: FaChartLine }] : []),
    
    // 2. Kasir
    { path: '/kasir', label: 'Kasir', icon: FaCashRegister },
    
    // 3. Pesanan Online
    { path: '/pesanan', label: 'Pesanan Online', icon: FaClipboardList },
    
    // 4. Inventory
    { path: '/inventory', label: 'Inventory', icon: FaBox },
    
    // 5. Produk
    { path: '/produk', label: 'Produk', icon: FaStore },
    
    // 6. Laporan
    { path: '/laporan', label: 'Laporan', icon: FaFileAlt },
    
    // 7. Riwayat Stok
    { path: '/stock-history', label: 'Riwayat Stok', icon: FaHistory },
    
    // 8. Variant
    { path: '/variants', label: 'Variant', icon: FaTags },

    // 9. Daftar Pelanggan (Admin)
    ...(isAdmin ? [{ path: '/customers', label: 'Daftar Pelanggan', icon: FaUser }] : []),
    
    // 10. Pengaturan Pembayaran (Admin)
    ...(isAdmin ? [{ path: '/payment-settings', label: 'Pengaturan Pembayaran', icon: FaCreditCard }] : []),
  ];

  return (
    <div className="bg-gray-800 text-white w-64 flex-shrink-0 flex flex-col shadow-lg z-20">
      {/* Brand Header */}
      <div className="p-6 bg-gray-900 flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded">
          <FaStore className="text-xl text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight uppercase">Pd. Amanah Lintang</h1>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-700 p-2 rounded-full">
            <FaUser className="text-gray-300" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{user?.username}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="text-lg" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-gray-400 hover:bg-red-600 hover:text-white rounded transition-colors font-medium"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
