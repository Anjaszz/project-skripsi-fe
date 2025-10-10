import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { FaMoneyBillWave, FaShoppingCart, FaBox, FaChartLine } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, salesRes] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getSalesReport({ period: 'daily' })
      ]);

      setSummary(summaryRes.data.data);
      setSalesData(salesRes.data.data.groupedData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Penjualan Hari Ini',
      value: formatCurrency(summary?.today?.sales || 0),
      icon: FaMoneyBillWave,
      color: 'bg-blue-500'
    },
    {
      title: 'Transaksi Hari Ini',
      value: summary?.today?.transactionCount || 0,
      icon: FaShoppingCart,
      color: 'bg-green-500'
    },
    {
      title: 'Keuntungan Hari Ini',
      value: formatCurrency(summary?.today?.profit || 0),
      icon: FaChartLine,
      color: 'bg-yellow-500'
    },
    {
      title: 'Stok Hampir Habis',
      value: summary?.inventory?.lowStockProducts || 0,
      icon: FaBox,
      color: 'bg-red-500'
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-full`}>
                  <Icon className="text-white text-2xl" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Bulan Ini</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Total Penjualan</span>
              <span className="font-semibold">{formatCurrency(summary?.month?.sales || 0)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Total Keuntungan</span>
              <span className="font-semibold text-green-600">{formatCurrency(summary?.month?.profit || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Inventory</h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Total Produk</span>
              <span className="font-semibold">{summary?.inventory?.totalProducts || 0}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Total Modal</span>
              <span className="font-semibold">{formatCurrency(summary?.inventory?.totalCapital || 0)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Produk Hampir Habis</span>
              <span className="font-semibold text-red-600">{summary?.inventory?.lowStockProducts || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      {salesData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Grafik Penjualan (7 Hari Terakhir)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" name="Penjualan" />
              <Bar dataKey="profit" fill="#10b981" name="Keuntungan" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
