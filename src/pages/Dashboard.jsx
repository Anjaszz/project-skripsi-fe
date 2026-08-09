import { useState, useEffect } from 'react';
import { dashboardAPI, inventoryAPI } from '../services/api';
import { FaMoneyBillWave, FaShoppingCart, FaBox, FaChartLine, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Bar, Line, Area, Legend
} from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Admin Dashboard | Amanah Hub';
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, salesRes, invRes] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getSalesReport({ period: 'daily' }),
        inventoryAPI.getAll()
      ]);

      setSummary(summaryRes.data.data);
      setSalesData(salesRes.data.data.groupedData || []);
      const allInv = invRes.data.data || [];
      setLowStockItems(allInv.filter(item => (Number(item.stock) || 0) < 10));
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
      title: 'Stok Hampir Habis',
      value: summary?.inventory?.lowStockProducts || 0,
      icon: FaBox,
      color: 'bg-red-600'
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
        {loading ? (
          [0,1,2].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-2.5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="w-11 h-11 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">{stat.title}</p>
                  <p className="text-lg md:text-xl font-black text-gray-800 italic">{stat.value}</p>
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
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
          <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-6">Tren Penjualan Mingguan</h2>
          <div className="h-[300px] md:h-[350px]">
            {loading ? (
              <div className="h-full flex flex-col justify-end gap-2 animate-pulse">
                <div className="flex items-end gap-3 h-full px-2">
                  {[60,85,45,90,55,70,40].map((h, i) => (
                    <div key={i} className="flex-1 bg-gray-200 rounded-t-md" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            ) : salesData.length > 0 ? (
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
                    tick={{fontSize: 10, fill: '#10b981', fontWeight: 'bold'}} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => `${value} Trx`}
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
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200">
            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-6">Inventory Status</h2>
            {loading ? (
              <div className="space-y-6 animate-pulse">
                {[0,1].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full"></div>
                </div>
              </div>
            ) : (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FaBox className="text-blue-500" />
                        <span className="text-sm text-gray-600">Total Produk</span>
                    </div>
                    <span className="font-bold text-gray-800">{summary?.inventory?.totalProducts || 0}</span>
                </div>
                <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between items-center mb-1">
                         <span className="text-xs font-bold text-gray-500">Kesehatan Stok</span>
                         <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">{lowStockItems.length} Produk Menipis</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-3">
                        <div 
                            className="bg-red-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min(100, (lowStockItems.length / (summary?.inventory?.totalProducts || 1)) * 100)}%` }}
                        ></div>
                    </div>

                    {/* Low Stock Detailed List */}
                    {lowStockItems.length === 0 ? (
                      <p className="text-xs text-emerald-600 font-bold italic pt-1">✓ Semua stok produk dalam keadaan aman</p>
                    ) : (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Rincian Stok Menipis (&lt; 10):</p>
                        <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                          {lowStockItems.map((item) => (
                            <div key={item._id} className="flex justify-between items-center p-2.5 bg-red-50/60 rounded-xl border border-red-100">
                              <div className="flex items-center gap-2">
                                {item.stock === 0 ? (
                                  <FaTimesCircle className="text-red-600 shrink-0" size={14} />
                                ) : (
                                  <FaExclamationTriangle className="text-amber-500 shrink-0" size={14} />
                                )}
                                <div>
                                  <p className="text-xs font-bold text-slate-800 leading-tight">{item.name}</p>
                                  {item.variantName && (
                                    <p className="text-[10px] text-slate-500 font-medium italic">{item.variantName}</p>
                                  )}
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black italic ${
                                item.stock === 0 ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {item.stock === 0 ? 'Habis (0)' : `Sisa ${item.stock}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
