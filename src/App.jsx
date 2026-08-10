import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Variants from './pages/Variants';
import Inventory from './pages/Inventory';
import Kasir from './pages/Kasir';
import Laporan from './pages/Laporan';
import Produk from './pages/Produk';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Pesanan from './pages/Pesanan';
import CustomerAuth from './pages/CustomerAuth';
import DaftarPelanggan from './pages/DaftarPelanggan';
import StockHistory from './pages/StockHistory';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminPaymentSettings from './pages/AdminPaymentSettings';

const staffRoles = ['admin', 'kasir', 'developer'];
const customerRoles = ['customer'];

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth" element={<CustomerAuth />} />
            <Route path="/customer-dashboard" element={<PrivateRoute requiredRole={['customer', 'admin', 'developer']}><CustomerDashboard /></PrivateRoute>} />

            {/* Private Routes Groupp */}
            <Route
              element={
                <PrivateRoute requiredRole={staffRoles}>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="dashboard" element={<PrivateRoute requiredRole="admin"><Dashboard /></PrivateRoute>} />
              <Route path="variants" element={<Variants />} />
              <Route path="produk" element={<Produk />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="stock-history" element={<PrivateRoute requiredRole={['admin', 'developer']}><StockHistory /></PrivateRoute>} />
              <Route path="customers" element={<PrivateRoute requiredRole={['admin', 'developer']}><DaftarPelanggan /></PrivateRoute>} />
              <Route path="kasir" element={<Kasir />} />
              <Route path="laporan" element={<PrivateRoute requiredRole="admin"><Laporan /></PrivateRoute>} />
              <Route path="pesanan" element={<Pesanan />} />
              <Route path="payment-settings" element={<PrivateRoute requiredRole="admin"><AdminPaymentSettings /></PrivateRoute>} />
            </Route>

            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
