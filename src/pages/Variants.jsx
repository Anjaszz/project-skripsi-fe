import { useState, useEffect } from 'react';
import { variantAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const Variants = () => {
  const [variants, setVariants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchVariants();
  }, [showInactive]);

  const fetchVariants = async () => {
    try {
      const response = await variantAPI.getAll({ includeInactive: showInactive });
      setVariants(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mengambil data variant');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await variantAPI.update(editingId, formData);
        toast.success('Variant berhasil diupdate');
      } else {
        await variantAPI.create(formData);
        toast.success('Variant berhasil ditambahkan');
      }
      setShowModal(false);
      resetForm();
      fetchVariants();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan variant');
    }
  };

  const handleEdit = (variant) => {
    setEditingId(variant._id);
    setFormData({
      name: variant.name,
      description: variant.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await variantAPI.delete(deleteId);
      toast.success('Variant berhasil dihapus');
      fetchVariants();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus variant');
    }
  };

  const handleToggle = async (id) => {
    try {
      await variantAPI.toggle(id);
      toast.success('Status variant berhasil diubah');
      fetchVariants();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mengubah status variant');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setEditingId(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Variant Produk</h1>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded"
            />
            <span>Tampilkan Tidak Aktif</span>
          </label>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <FaPlus />
            <span>Tambah Variant</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Variant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {variants.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  Belum ada data variant
                </td>
              </tr>
            ) : (
              variants.map((variant, index) => (
                <tr key={variant._id}>
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium">{variant.name}</td>
                  <td className="px-6 py-4 text-gray-600">{variant.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${variant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {variant.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggle(variant._id)}
                        className={`${variant.isActive ? 'text-green-600 hover:text-green-900' : 'text-gray-400 hover:text-gray-600'}`}
                        title={variant.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {variant.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                      </button>
                      <button
                        onClick={() => handleEdit(variant)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(variant._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit Variant' : 'Tambah Variant'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nama Variant *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Rasa, Ukuran, Warna"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi variant (opsional)"
                  rows="3"
                />
              </div>
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
        message="Apakah Anda yakin ingin menghapus variant ini? Variant yang sedang digunakan oleh produk tidak dapat dihapus."
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default Variants;
