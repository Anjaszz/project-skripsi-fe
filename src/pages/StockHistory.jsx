import { useState, useEffect } from 'react';
import { inventoryAPI, variantAPI, exportAPI } from '../services/api';
import { FaHistory, FaCalendar, FaFileExcel, FaFilePdf, FaFilter } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/Pagination';

const StockHistory = () => {
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [variantFilter, setVariantFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    productId: '',
    variantId: '',
    startDate: '',
    endDate: ''
  });
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [historyRes, productsRes, variantsRes] = await Promise.all([
        inventoryAPI.getHistory(),
        inventoryAPI.getAll(),
        variantAPI.getAll()
      ]);
      setHistory(historyRes.data.data);
      setProducts(productsRes.data.data);
      setVariants(variantsRes.data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mengambil data');
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter history based on search, product, variant, and date
  const filteredHistory = history.filter(item => {
    // Search filter
    const matchSearch = searchTerm === '' ||
                       item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (item.variantName && item.variantName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Product filter
    const matchProduct = productFilter === '' || item.productId === productFilter;

    // Variant filter
    const matchVariant = variantFilter === '' ||
                        (variantFilter === 'none' && !item.variantName) ||
                        item.variantName === variantFilter;

    // Date filter
    let matchDate = true;
    if (dateFilter.startDate || dateFilter.endDate) {
      const itemDate = new Date(item.dateAdded);
      const start = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
      const end = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

      if (start) matchDate = matchDate && itemDate >= start;
      if (end) {
        end.setHours(23, 59, 59, 999);
        matchDate = matchDate && itemDate <= end;
      }
    }

    return matchSearch && matchProduct && matchVariant && matchDate;
  });

  const paginatedHistory = filteredHistory.slice(0, displayLimit);

  // Calculate summary
  const summary = {
    totalEntries: filteredHistory.length,
    totalQuantity: filteredHistory.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: filteredHistory.reduce((sum, item) => sum + item.totalPurchase, 0)
  };

  // Export functions
  const handleExport = async (type) => {
    setExportLoading(true);
    try {
      let response;
      if (type === 'excel') {
        response = await exportAPI.stockHistoryExcel(exportFilters);
      } else {
        response = await exportAPI.stockHistoryPDF(exportFilters);
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Riwayat_Stok_${Date.now()}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Laporan berhasil diexport ke ${type.toUpperCase()}`);
      setShowExportModal(false);
      setExportFilters({ productId: '', variantId: '', startDate: '', endDate: '' });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal export laporan');
    } finally {
      setExportLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setProductFilter('');
    setVariantFilter('');
    setDateFilter({ startDate: '', endDate: '' });
  };

  const hasActiveFilters = searchTerm || productFilter || variantFilter || dateFilter.startDate || dateFilter.endDate;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaHistory className="text-blue-600" />
            Riwayat Stok Masuk
          </h1>
          <p className="text-gray-600 mt-1">Histori pembelian dan penambahan stok barang</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
          >
            <FaFileExcel />
            Export Excel
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
          >
            <FaFilePdf />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Entri</p>
              <p className="text-3xl font-bold">{summary.totalEntries}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <FaHistory className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Kuantitas</p>
              <p className="text-3xl font-bold">{summary.totalQuantity.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <FaHistory className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Nilai Pembelian</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <FaHistory className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filter Data</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Produk
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nama produk..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Barang
            </label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Barang</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Variant
            </label>
            <select
              value={variantFilter}
              onChange={(e) => setVariantFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Variant</option>
              <option value="none">Tanpa Variant</option>
              {[...new Set(history.map(h => h.variantName).filter(Boolean))].map(variant => (
                <option key={variant} value={variant}>
                  {variant}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendar className="inline mr-1" />
              Dari Tanggal
            </label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendar className="inline mr-1" />
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Menampilkan {filteredHistory.length}</span> dari {history.length} entri
            </p>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <span>Reset Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variant
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga Beli
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pembelian
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-150 rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-150 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-150 rounded w-24 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {history.length === 0 ? 'Belum ada riwayat stok masuk' : 'Tidak ada data yang sesuai dengan filter'}
                  </td>
                </tr>
              ) : (
                paginatedHistory.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.dateAdded)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.variantName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.purchasePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(item.totalPurchase)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        displayLimit={displayLimit}
        totalItems={filteredHistory.length}
        onLoadMore={() => setDisplayLimit(prev => prev + 15)}
      />

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaFileExcel className="text-green-600" />
                Export Laporan Riwayat Stok
              </h2>
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportFilters({ productId: '', variantId: '', startDate: '', endDate: '' });
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                disabled={exportLoading}
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Pilih filter untuk laporan yang ingin diexport:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Barang (Opsional)
                  </label>
                  <select
                    value={exportFilters.productId}
                    onChange={(e) => setExportFilters({...exportFilters, productId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={exportLoading}
                  >
                    <option value="">Semua Barang</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Variant (Opsional)
                  </label>
                  <select
                    value={exportFilters.variantId}
                    onChange={(e) => setExportFilters({...exportFilters, variantId: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={exportLoading}
                  >
                    <option value="">Semua Variant</option>
                    <option value="none">Tanpa Variant</option>
                    {variants.map(variant => (
                      <option key={variant._id} value={variant._id}>
                        {variant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendar className="inline mr-1" />
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={exportFilters.startDate}
                    onChange={(e) => setExportFilters({...exportFilters, startDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={exportLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendar className="inline mr-1" />
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    value={exportFilters.endDate}
                    onChange={(e) => setExportFilters({...exportFilters, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={exportLoading}
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tips:</strong> Kosongkan filter untuk export semua data riwayat stok
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportFilters({ productId: '', variantId: '', startDate: '', endDate: '' });
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={exportLoading}
              >
                Batal
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FaFileExcel />
                    <span>Export Excel</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FaFilePdf />
                    <span>Export PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockHistory;
