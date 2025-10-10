import { useState, useEffect } from 'react';
import { dashboardAPI, exportAPI } from '../services/api';
import { FaFileExcel, FaFilePdf, FaCalendar } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

const Laporan = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesReport, setSalesReport] = useState(null);
  const [stockReport, setStockReport] = useState(null);
  const [transactionReport, setTransactionReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [sales, stock, transactions] = await Promise.all([
        dashboardAPI.getSalesReport(dateRange),
        dashboardAPI.getStockReport(),
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
        response = format === 'excel'
          ? await exportAPI.salesExcel(dateRange)
          : await exportAPI.salesPDF(dateRange);
        downloadFile(response.data, `Laporan_Penjualan_${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      } else if (type === 'stock') {
        response = format === 'excel'
          ? await exportAPI.stockExcel()
          : await exportAPI.stockPDF();
        downloadFile(response.data, `Laporan_Stok_${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      } else if (type === 'transactions') {
        response = format === 'excel'
          ? await exportAPI.transactionsExcel(dateRange)
          : await exportAPI.transactionsPDF(dateRange);
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
    { id: 'sales', label: 'Laporan Penjualan' },
    { id: 'stock', label: 'Laporan Stok' },
    { id: 'transactions', label: 'Laporan Transaksi' }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Laporan</h1>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <FaCalendar className="text-gray-600 text-xl" />
          <div className="flex space-x-4 flex-1">
            <div>
              <label className="block text-sm font-medium mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {/* Sales Report */}
              {activeTab === 'sales' && salesReport && (
                <div>
                  <div className="flex justify-end space-x-2 mb-6">
                    <button
                      onClick={() => handleExport('sales', 'excel')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2"
                    >
                      <FaFileExcel />
                      <span>Export Excel</span>
                    </button>
                    <button
                      onClick={() => handleExport('sales', 'pdf')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center space-x-2"
                    >
                      <FaFilePdf />
                      <span>Export PDF</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-1">Total Penjualan</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(salesReport.summary.totalSales)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-1">Total Keuntungan</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(salesReport.summary.totalProfit)}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-1">Total Modal</p>
                      <p className="text-2xl font-bold text-yellow-600">{formatCurrency(salesReport.summary.totalCapital)}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-1">Total Transaksi</p>
                      <p className="text-2xl font-bold text-purple-600">{salesReport.summary.totalTransactions}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No Transaksi</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kasir</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Keuntungan</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {salesReport.transactions.slice(0, 20).map((trx, index) => (
                          <tr key={trx._id}>
                            <td className="px-6 py-4">{index + 1}</td>
                            <td className="px-6 py-4 font-medium">{trx.transactionNumber}</td>
                            <td className="px-6 py-4">{formatDate(trx.createdAt)}</td>
                            <td className="px-6 py-4">{trx.cashierName}</td>
                            <td className="px-6 py-4 text-right font-semibold">{formatCurrency(trx.total)}</td>
                            <td className="px-6 py-4 text-right font-semibold text-green-600">{formatCurrency(trx.totalProfit)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Stock Report */}
              {activeTab === 'stock' && stockReport && (
                <div>
                  <div className="flex justify-end space-x-2 mb-6">
                    <button
                      onClick={() => handleExport('stock', 'excel')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2"
                    >
                      <FaFileExcel />
                      <span>Export Excel</span>
                    </button>
                    <button
                      onClick={() => handleExport('stock', 'pdf')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center space-x-2"
                    >
                      <FaFilePdf />
                      <span>Export PDF</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-1">Total Produk</p>
                      <p className="text-2xl font-bold text-blue-600">{stockReport.summary.totalProducts}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-1">Total Stok</p>
                      <p className="text-2xl font-bold text-green-600">{stockReport.summary.totalStock}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-1">Total Nilai</p>
                      <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stockReport.summary.totalValue)}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-1">Stok Hampir Habis</p>
                      <p className="text-2xl font-bold text-red-600">{stockReport.summary.lowStockCount}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3">Barang Terlaris</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Produk</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty Terjual</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Penjualan</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Keuntungan</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stockReport.bestSellers.map((item) => (
                            <tr key={item.productId}>
                              <td className="px-6 py-4 font-medium">{item.productName}</td>
                              <td className="px-6 py-4 text-right">{item.totalQuantity}</td>
                              <td className="px-6 py-4 text-right font-semibold">{formatCurrency(item.totalSales)}</td>
                              <td className="px-6 py-4 text-right font-semibold text-green-600">{formatCurrency(item.totalProfit)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-3">Stok Barang Hampir Habis</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Produk</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stok</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga Beli</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stockReport.lowStockProducts.map((product) => (
                            <tr key={product._id}>
                              <td className="px-6 py-4 font-medium">{product.name}</td>
                              <td className="px-6 py-4 text-right">
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded">{product.stock}</span>
                              </td>
                              <td className="px-6 py-4 text-right">{formatCurrency(product.purchasePrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Report */}
              {activeTab === 'transactions' && transactionReport && (
                <div>
                  <div className="flex justify-end space-x-2 mb-6">
                    <button
                      onClick={() => handleExport('transactions', 'excel')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2"
                    >
                      <FaFileExcel />
                      <span>Export Excel</span>
                    </button>
                    <button
                      onClick={() => handleExport('transactions', 'pdf')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center space-x-2"
                    >
                      <FaFilePdf />
                      <span>Export PDF</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-1">Total Transaksi</p>
                      <p className="text-2xl font-bold text-blue-600">{transactionReport.summary.totalTransactions}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-1">Total Penjualan</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(transactionReport.summary.totalSales)}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded">
                      <p className="text-sm text-gray-600 mb-1">Rata-rata Transaksi</p>
                      <p className="text-2xl font-bold text-yellow-600">{formatCurrency(transactionReport.summary.averageTransaction)}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3">Transaksi Per Kasir</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {transactionReport.byCashier.map((cashier) => (
                        <div key={cashier.cashierName} className="bg-gray-50 p-4 rounded">
                          <h4 className="font-bold mb-2">{cashier.cashierName}</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Jumlah Transaksi:</span>
                              <span className="font-semibold">{cashier.transactionCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Penjualan:</span>
                              <span className="font-semibold">{formatCurrency(cashier.totalSales)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Keuntungan:</span>
                              <span className="font-semibold text-green-600">{formatCurrency(cashier.totalProfit)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No Transaksi</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kasir</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Items</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactionReport.transactions.slice(0, 20).map((trx, index) => (
                          <tr key={trx._id}>
                            <td className="px-6 py-4">{index + 1}</td>
                            <td className="px-6 py-4 font-medium">{trx.transactionNumber}</td>
                            <td className="px-6 py-4">{formatDate(trx.createdAt)}</td>
                            <td className="px-6 py-4">{trx.cashierName}</td>
                            <td className="px-6 py-4 text-right">{trx.items.length}</td>
                            <td className="px-6 py-4 text-right font-semibold">{formatCurrency(trx.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Laporan;
