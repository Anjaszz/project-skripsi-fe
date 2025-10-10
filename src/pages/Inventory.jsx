import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI, variantAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaHistory } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
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
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan produk');
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

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await inventoryAPI.delete(deleteId);
      toast.success('Produk berhasil dihapus');
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menghapus produk');
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

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>
        <div className="space-x-2">
          <button
            onClick={() => navigate('/stock-history')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 inline-flex items-center space-x-2"
          >
            <FaHistory />
            <span>Riwayat Stok</span>
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <FaPlus />
            <span>Tambah Barang</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Beli</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Nilai</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product, index) => (
              <tr key={product._id}>
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-medium">{product.name}</td>
                <td className="px-6 py-4">{product.variantName || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded ${product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4">{formatCurrency(product.purchasePrice)}</td>
                <td className="px-6 py-4 font-semibold">{formatCurrency(product.stock * product.purchasePrice)}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit Barang' : 'Tambah Barang Masuk'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nama Barang</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                  disabled={editingId}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Variant</label>
                <select
                  value={formData.variantId}
                  onChange={(e) => setFormData({...formData, variantId: e.target.value})}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">- Tanpa Variant -</option>
                  {variants.map(variant => (
                    <option key={variant._id} value={variant._id}>
                      {variant.name}
                    </option>
                  ))}
                </select>
              </div>
              {!editingId && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Jumlah Stok Masuk</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      required
                      min="1"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Harga Beli Per Unit</label>
                    <input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      required
                      min="0"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Tanggal Masuk</label>
                    <input
                      type="date"
                      value={formData.dateAdded}
                      onChange={(e) => setFormData({...formData, dateAdded: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  {formData.quantity && formData.purchasePrice && (
                    <div className="mb-4 bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium">Total Pembelian:</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(formData.quantity * formData.purchasePrice)}
                      </p>
                    </div>
                  )}
                </>
              )}
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default Inventory;
