import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI, variantAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaHistory, FaSearch, FaSpinner } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayLimit, setDisplayLimit] = useState(15);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    variantId: '',
    quantity: '',
    purchasePrice: '',
    dateAdded: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const toast = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchVariants();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await inventoryAPI.getAll();
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async () => {
    try {
      const response = await variantAPI.getAll({ includeInactive: false });
      setVariants(response.data.data);
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      if (editingId) {
        await inventoryAPI.update(editingId, {
          name: formData.name,
          variantId: formData.variantId || null
        });
        toast.success('Produk berhasil diupdate');
      } else {
        await inventoryAPI.create(formData);
        toast.success('Produk berhasil ditambahkan');
      }
      await new Promise(r => setTimeout(r, 450));
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      variantId: product.variant?._id || product.variant || '',
      quantity: '',
      purchasePrice: '',
      dateAdded: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await inventoryAPI.delete(deleteId);
      toast.success('Barang berhasil dihapus');
      await new Promise(r => setTimeout(r, 450));
      fetchProducts();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menghapus produk');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      variantId: '',
      quantity: '',
      purchasePrice: '',
      dateAdded: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredProducts = products.filter(p => 
    (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.variantName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const paginatedProducts = filteredProducts.slice(0, displayLimit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        {isAdmin && (
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => navigate('/stock-history')}
              className="flex-1 md:flex-none bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold flex items-center justify-center gap-2"
            >
              <FaHistory /> <span>Riwayat Stok</span>
            </button>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
            >
              <FaPlus /> <span>Tambah Barang</span>
            </button>
          </div>
        )}
      </div>

      {/* Global Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari barang atau varian..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setDisplayLimit(15);
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Nama Barang</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Variant</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Stok</th>
              {isAdmin && <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Harga Beli</th>}
              {isAdmin && <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Nilai Total</th>}
              {isAdmin && <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-150 rounded w-1/2"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                  {isAdmin && <td className="px-6 py-4"><div className="h-4 bg-slate-150 rounded w-24 ml-auto"></div></td>}
                  {isAdmin && <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28 ml-auto"></div></td>}
                  {isAdmin && <td className="px-6 py-4"><div className="h-6 bg-slate-150 rounded w-16 mx-auto"></div></td>}
                </tr>
              ))
            ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={isAdmin ? "6" : "3"} className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada data barang</td></tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                  <td className="px-6 py-4">{product.variantName || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {product.stock}
                    </span>
                  </td>
                  {isAdmin && <td className="px-6 py-4 text-right text-sm text-gray-600 font-medium">{formatCurrency(product.purchasePrice)}</td>}
                  {isAdmin && <td className="px-6 py-4 text-right font-bold text-gray-800">{formatCurrency(product.stock * product.purchasePrice)}</td>}
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(product)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg shadow-sm border"><FaEdit /></button>
                          <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg shadow-sm border"><FaTrash /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        displayLimit={displayLimit}
        totalItems={filteredProducts.length}
        onLoadMore={() => setDisplayLimit(prev => prev + 15)}
      />

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 p-4 text-white font-bold text-lg">
                {editingId ? 'Edit Barang' : 'Tambah Barang'}
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Barang</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                  disabled={editingId}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Variant</label>
                <select
                  value={formData.variantId}
                  onChange={(e) => setFormData({...formData, variantId: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">- Tanpa Variant -</option>
                  {variants.map(variant => (
                    <option key={variant._id} value={variant._id}>{variant.name}</option>
                  ))}
                </select>
              </div>
              {!editingId && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Jumlah</label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                          className="w-full border rounded-lg px-4 py-2"
                          required
                          min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Harga Beli</label>
                        <input
                          type="number"
                          value={formData.purchasePrice}
                          onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                          className="w-full border rounded-lg px-4 py-2"
                          required
                          min="0"
                        />
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-600">Total Pembelian:</span>
                      <span className="font-black text-blue-600 text-lg">
                        {formatCurrency((Number(formData.quantity) || 0) * (Number(formData.purchasePrice) || 0))}
                      </span>
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-4">
                <button type="button" disabled={isSaving} onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold disabled:opacity-50">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSaving ? (
                    <>
                      <FaSpinner className="animate-spin" size={14} />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingId ? 'Update' : 'Simpan'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Hapus Barang"
        message="Yakin ingin menghapus barang ini?"
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Inventory;
