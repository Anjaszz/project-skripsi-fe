import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { FaMoneyBillWave, FaShoppingCart, FaBox, FaChartLine } from 'react-icons/fa';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Bar, Line, Area, Legend
} from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Admin Dashboard | Amanah Hub';
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
      subtitle: (
        <span className="text-gray-400">
          <span className="text-blue-500">Online : </span> {formatCurrency(summary?.today?.onlineSales || 0)} 
          <span className="mx-1 text-gray-300">|</span> 
          <span className="text-emerald-500">Kasir : </span> {formatCurrency(summary?.today?.offlineSales || 0)}
        </span>
      ),
      icon: FaMoneyBillWave,
      color: 'bg-blue-600'
    },
    {
      title: 'Transaksi Hari Ini',
      value: summary?.today?.transactionCount || 0,
      subtitle: (
        <span className="text-gray-800">
          <span className="text-blue-500">Online</span> {summary?.today?.onlineCount || 0} 
          <span className="mx-1 text-gray-300">|</span> 
          <span className="text-emerald-500">Kasir</span> {summary?.today?.offlineCount || 0}
        </span>
      ),
      icon: FaShoppingCart,
      color: 'bg-green-600'
    },
    {
      title: 'Keuntungan Hari Ini',
      value: formatCurrency(summary?.today?.profit || 0),
      subtitle: <span className="text-purple-400">Data Offline (Kasir)</span>,
      icon: FaChartLine,
      color: 'bg-indigo-600'
    },
    {
      title: 'Stok Hampir Habis',
      value: summary?.inventory?.lowStockProducts || 0,
      icon: FaBox,
      color: 'bg-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{stat.title}</p>
                  <p className="text-xl font-black text-gray-800 italic">{stat.value}</p>
                  {stat.subtitle && (
                    <div className="text-[9px] font-bold mt-1 uppercase tracking-tighter">
                      {stat.subtitle}
                    </div>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white shadow`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Tren Penjualan Mingguan</h2>
          <div className="h-[350px]">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={salesData.slice(-7)}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(str) => {
                        const date = new Date(str);
                        return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `Rp ${value >= 1000000 ? (value/1000000).toFixed(1) + 'jt' : (value/1000).toFixed(0) + 'rb'}`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }} 
                    formatter={(value, name) => [
                        name === 'Penjualan' ? formatCurrency(value) : `${value} Transaksi`, 
                        name
                    ]}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  
                  <Bar 
                    yAxisId="left"
                    dataKey="sales" 
                    fill="#3b82f6" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30}
                    name="Penjualan"
                  />
                  
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Jml Transaksi"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-gray-400">Belum ada data penjualan</div>
            )}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Inventory Status</h2>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FaBox className="text-blue-500" />
                        <span className="text-sm text-gray-600">Total Produk</span>
                    </div>
                    <span className="font-bold text-gray-800">{summary?.inventory?.totalProducts || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FaMoneyBillWave className="text-green-500" />
                        <span className="text-sm text-gray-600">Total Modal</span>
                    </div>
                    <span className="font-bold text-gray-800 text-sm">{formatCurrency(summary?.inventory?.totalCapital || 0)}</span>
                </div>
                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                         <span className="text-xs text-gray-500">Kesehatan Stok</span>
                         <span className="text-xs font-bold text-red-500">{summary?.inventory?.lowStockProducts || 0} Menipis</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-red-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min(100, ((summary?.inventory?.lowStockProducts || 0) / (summary?.inventory?.totalProducts || 1)) * 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
