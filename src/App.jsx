import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Variants from './pages/Variants';
import Inventory from './pages/Inventory';
import StockHistory from './pages/StockHistory';
import Kasir from './pages/Kasir';
import Laporan from './pages/Laporan';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/kasir" replace />} />
              <Route
                path="dashboard"
                element={
                  <PrivateRoute requiredRole="admin">
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="variants"
                element={
                  <PrivateRoute requiredRole="admin">
                    <Variants />
                  </PrivateRoute>
                }
              />
              <Route
                path="inventory"
                element={
                  <PrivateRoute requiredRole="admin">
                    <Inventory />
                  </PrivateRoute>
                }
              />
              <Route
                path="stock-history"
                element={
                  <PrivateRoute requiredRole="admin">
                    <StockHistory />
                  </PrivateRoute>
                }
              />
              <Route path="kasir" element={<Kasir />} />
              <Route
                path="laporan"
                element={
                  <PrivateRoute requiredRole="admin">
                    <Laporan />
                  </PrivateRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
