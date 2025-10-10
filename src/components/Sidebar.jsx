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
  FaUser
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
    ...(isAdmin ? [
      { path: '/dashboard', label: 'Dashboard', icon: FaChartLine },
      { path: '/variants', label: 'Variant', icon: FaTags },
      { path: '/inventory', label: 'Inventory', icon: FaBox },
      { path: '/stock-history', label: 'Riwayat Stok', icon: FaHistory },
    ] : []),
    { path: '/kasir', label: 'Kasir', icon: FaCashRegister },
    ...(isAdmin ? [
      { path: '/laporan', label: 'Laporan', icon: FaFileAlt },
    ] : []),
  ];

  return (
    <div className="bg-blue-800 text-white w-64 flex-shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Inventory & Kasir</h1>
      </div>

      <div className="px-6 py-4 border-y border-blue-700">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-full">
            <FaUser />
          </div>
          <div>
            <p className="font-medium">{user?.username}</p>
            <p className="text-xs text-blue-300 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-blue-700 border-l-4 border-white'
                  : 'hover:bg-blue-700'
              }`}
            >
              <Icon className="text-xl" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-6">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-6 py-3 w-full text-left hover:bg-blue-700 rounded transition-colors"
        >
          <FaSignOutAlt className="text-xl" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
