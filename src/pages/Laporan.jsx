import { useState, useEffect } from 'react';
import { dashboardAPI, exportAPI } from '../services/api';
import { FaFileExcel, FaFilePdf, FaCalendar, FaEye, FaTimes } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Laporan = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesReport, setSalesReport] = useState(null);
  const [stockReport, setStockReport] = useState(null);
  const [transactionReport, setTransactionReport] = useState(null);
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 1);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [sales, stock, transactions] = await Promise.all([
        dashboardAPI.getSalesReport(dateRange),
        dashboardAPI.getStockReport(dateRange),
        dashboardAPI.getTransactionReport(dateRange)
      ]);
      setSalesReport(sales.data.data);
      setStockReport(stock.data.data);
      setTransactionReport(transactions.data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mengambil data laporan');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExport = async (type, format) => {
    try {
      let response;
      const timestamp = new Date().getTime();
      if (type === 'sales') {
        response = format === 'excel' ? await exportAPI.salesExcel(dateRange) : await exportAPI.salesPDF(dateRange);
        downloadFile(response.data, `Laporan_Penjualan_${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      } else if (type === 'stock') {
        response = format === 'excel' ? await exportAPI.stockExcel(dateRange) : await exportAPI.stockPDF(dateRange);
        downloadFile(response.data, `Laporan_Stok_${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      } else if (type === 'transactions') {
        response = format === 'excel' ? await exportAPI.transactionsExcel(dateRange) : await exportAPI.transactionsPDF(dateRange);
        downloadFile(response.data, `Laporan_Transaksi_${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      }
      toast.success('File berhasil didownload!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mendownload file');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID');
  };

  const tabs = [
    { id: 'sales', label: 'Penjualan' },
    { id: 'stock', label: 'Analisa Produk' },
    { id: 'transactions', label: 'Transaksi' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
      </div>

      {/* Tabs & Filters Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
        <div className="flex border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-bold text-sm uppercase transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <FaCalendar className="text-gray-400" />
                <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    className="border rounded px-3 py-1.5 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    className="border rounded px-3 py-1.5 text-sm"
                />
            </div>
            <div className="flex gap-2">
                <button onClick={() => handleExport(activeTab, 'excel')} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2">
                    <FaFileExcel size={14} /> EXCEL
                </button>
                <button onClick={() => handleExport(activeTab, 'pdf')} className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-700 flex items-center gap-2">
                    <FaFilePdf size={14} /> PDF
                </button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-sm border min-h-[400px]">
          <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Detail {tabs.find(t => t.id === activeTab)?.label}</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner"></div></div>
          ) : (
            <div className="p-6">
              {activeTab === 'sales' && salesReport && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <p className="text-xs text-blue-600 font-bold uppercase mb-1">Total Penjualan</p>
                          <p className="text-xl font-bold text-blue-900">{formatCurrency(salesReport.summary?.totalSales || 0)}</p>
                      </div>
                      {isAdmin && (
                          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                              <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Total Keuntungan</p>
                              <p className="text-xl font-bold text-emerald-900">{formatCurrency(salesReport.summary?.totalProfit || 0)}</p>
                          </div>
                      )}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Transaksi</p>
                          <p className="text-xl font-bold text-gray-800">{salesReport.summary?.totalTransactions || 0}</p>
                      </div>
                  </div>

                  <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b">
                              <tr>
                                  <th className="px-6 py-3 font-bold text-gray-600 uppercase">No. Transaksi</th>
                                  <th className="px-6 py-3 font-bold text-gray-600 uppercase">Tanggal</th>
                                  <th className="px-6 py-3 font-bold text-gray-600 uppercase text-right">Total</th>
                                  <th className="px-6 py-3 font-bold text-gray-600 uppercase text-center">Detail</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y">
                              {salesReport.transactions?.map((trx) => (
                                  <tr key={trx._id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 font-medium text-gray-800">{trx.transactionNumber}</td>
                                      <td className="px-6 py-4 text-gray-500">{formatDate(trx.createdAt)}</td>
                                      <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(trx.total)}</td>
                                      <td className="px-6 py-4 text-center">
                                          <button 
                                            onClick={() => { setSelectedTrx(trx); setShowDetail(true); }}
                                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                          >
                                            <FaEye />
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
                </div>
              )}

              {activeTab === 'stock' && stockReport && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Products */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                        Produk Terlaris
                      </h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-4 py-2 font-bold text-gray-600 uppercase">Produk</th>
                              <th className="px-4 py-2 font-bold text-gray-600 uppercase text-right">Terjual</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {stockReport.bestSellers?.length > 0 ? (
                              stockReport.bestSellers.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                  <td className="px-4 py-2">
                                    <p className="font-medium text-gray-800">{item.productName}</p>
                                  </td>
                                  <td className="px-4 py-2 text-right font-bold text-blue-600">{item.totalQuantity}</td>
                                </tr>
                              ))
                            ) : (
                              <tr><td colSpan="2" className="px-4 py-8 text-center text-gray-400">Belum ada data penjualan</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Low Stock */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-red-600 rounded-full"></span>
                        Stok Menipis
                      </h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-4 py-2 font-bold text-gray-600 uppercase">Produk</th>
                              <th className="px-4 py-2 font-bold text-gray-600 uppercase text-right">Sisa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {stockReport.lowStockProducts?.length > 0 ? (
                              stockReport.lowStockProducts.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                  <td className="px-4 py-2">
                                    <p className="font-medium text-gray-800">{item.name}</p>
                                    <p className="text-[10px] text-gray-400">{item.variantName || 'Regular'}</p>
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold text-xs">
                                      {item.stock}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr><td colSpan="2" className="px-4 py-8 text-center text-gray-400">Stok aman terjaga</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'transactions' && transactionReport && (
                <div className="space-y-4">
                  <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b">
                              <tr>
                                  <th className="px-6 py-3 font-bold text-gray-600 uppercase">Waktu</th>
                                  <th className="px-6 py-3 font-bold text-gray-600 uppercase">No. Transaksi</th>
                                  <th className="px-6 py-3 font-bold text-gray-600 uppercase">Kasir</th>
                                  <th className="px-6 py-3 font-bold text-gray-600 uppercase text-right">Total</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y">
                              {transactionReport.transactions?.length > 0 ? (
                                transactionReport.transactions.map((trx) => (
                                  <tr key={trx._id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-gray-500">{formatDate(trx.createdAt)}</td>
                                      <td className="px-6 py-4 font-bold text-gray-800">{trx.transactionNumber}</td>
                                      <td className="px-6 py-4 text-gray-600">{trx.cashierName}</td>
                                      <td className="px-6 py-4 text-right font-black text-blue-600">{formatCurrency(trx.total)}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">Tidak ada transaksi di periode ini</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedTrx && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Detail Transaksi</h3>
                        <p className="text-xs text-blue-100 opacity-80">{selectedTrx.transactionNumber}</p>
                    </div>
                    <button onClick={() => setShowDetail(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                        <FaTimes size={18} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                        <div>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Tanggal</p>
                            <p className="font-bold text-gray-700">{formatDate(selectedTrx.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Kasir</p>
                            <p className="font-bold text-gray-700">{selectedTrx.cashierName}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="font-black text-xs text-gray-400 uppercase tracking-widest px-1">Daftar Belanja</p>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-gray-600">Produk</th>
                                        <th className="px-4 py-3 font-bold text-gray-600 text-center">Qty</th>
                                        <th className="px-4 py-3 font-bold text-gray-600 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {selectedTrx.items?.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-gray-800">{item.productName}</p>
                                                <p className="text-[10px] text-gray-400">{formatCurrency(item.sellingPrice)}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-gray-600">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right font-black text-gray-800">{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-blue-50/50">
                                    <tr>
                                        <td colSpan="2" className="px-4 py-4 text-right font-bold text-gray-600">Total Akhir</td>
                                        <td className="px-4 py-4 text-right font-black text-lg text-blue-700">{formatCurrency(selectedTrx.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t">
                    <button 
                        onClick={() => setShowDetail(false)}
                        className="w-full bg-gray-800 text-white py-2.5 rounded-lg font-bold hover:bg-gray-900 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Laporan;
