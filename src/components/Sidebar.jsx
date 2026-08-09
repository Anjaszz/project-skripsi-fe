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
  FaCreditCard,
  FaTimes
} from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (window.innerWidth < 1024) toggleSidebar();
  };

  const menuItems = [
    ...(isAdmin ? [{ path: '/dashboard', label: 'Dashboard', icon: FaChartLine }] : []),
    { path: '/inventory', label: 'Inventory', icon: FaBox },
    ...(isAdmin ? [{ path: '/stock-history', label: 'Riwayat Stok', icon: FaHistory }] : []),
    { path: '/variants', label: 'Variant', icon: FaTags },
    ...(isAdmin ? [{ path: '/laporan', label: 'Laporan', icon: FaFileAlt }] : []),
    { path: '/kasir', label: 'Kasir', icon: FaCashRegister },
    { path: '/pesanan', label: 'Pesanan Online', icon: FaClipboardList },
    { path: '/produk', label: 'Produk', icon: FaStore },
    ...(isAdmin ? [{ path: '/customers', label: 'Daftar Pelanggan', icon: FaUser }] : []),
    ...(isAdmin ? [{ path: '/payment-settings', label: 'Pengaturan Pembayaran', icon: FaCreditCard }] : []),
  ];

  return (
    <div className={`
      fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white flex-shrink-0 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Brand Header */}
      <div className="p-6 bg-gray-900 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded">
            <FaStore className="text-xl text-white" />
          </div>
          <h1 className="text-sm font-black tracking-tight uppercase leading-none">Pd. Amanah <br /> Lintang</h1>
        </div>
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-700 p-2 rounded-full">
            <FaUser className="text-gray-300" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{user?.username}</p>
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <Icon className={`${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span className={`text-[13px] font-bold ${isActive ? 'text-white' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-gray-400 hover:bg-red-600/10 hover:text-red-500 rounded-xl transition-all font-bold text-[13px]"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
