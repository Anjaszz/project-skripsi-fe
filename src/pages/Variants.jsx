import { useState, useEffect } from 'react';
import { variantAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSpinner } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

import Pagination from '../components/Pagination';

const Variants = () => {
  const [variants, setVariants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(15);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const toast = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchVariants();
  }, [showInactive]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const response = await variantAPI.getAll({ includeInactive: showInactive });
      setVariants(response.data.data);
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast.error('Gagal mengambil data variant');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      if (editingId) {
        await variantAPI.update(editingId, formData);
        toast.success('Variant berhasil diupdate');
      } else {
        await variantAPI.create(formData);
        toast.success('Variant berhasil ditambahkan');
      }
      await new Promise(r => setTimeout(r, 450));
      setShowModal(false);
      resetForm();
      fetchVariants();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan variant');
    } finally {
      setIsSaving(false);
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

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await variantAPI.delete(deleteId);
      toast.success('Variant berhasil dihapus');
      await new Promise(r => setTimeout(r, 450));
      fetchVariants();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menghapus variant');
    } finally {
      setIsDeleting(false);
    }
  };

  const [togglingId, setTogglingId] = useState(null);

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      await variantAPI.toggle(id);
      toast.success('Status variant berhasil diubah');
      fetchVariants();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mengubah status variant');
    } finally {
      setTogglingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
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

  const paginatedVariants = variants.slice(0, displayLimit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Variant Produk</h1>
        <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => {
                      setShowInactive(e.target.checked);
                      setDisplayLimit(15);
                    }}
                />
                Tampilkan Tidak Aktif
            </label>
            {isAdmin && (
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 shadow-sm"
                >
                    <FaPlus /> <span>Tambah Variant</span>
                </button>
            )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Nama Variant</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Deskripsi</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
              {isAdmin && <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-150 rounded w-3/4"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                  {isAdmin && <td className="px-6 py-4"><div className="h-6 bg-slate-150 rounded w-20 mx-auto"></div></td>}
                </tr>
              ))
            ) : variants.length === 0 ? (
                <tr>
                    <td colSpan={isAdmin ? "4" : "3"} className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada data variant</td>
                </tr>
            ) : (
                paginatedVariants.map((v) => (
                    <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-800">{v.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{v.description || '-'}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {v.isActive ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                        </td>
                        {isAdmin && (
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => handleToggle(v._id)} disabled={togglingId === v._id} className={`${v.isActive ? 'text-green-600' : 'text-gray-400'} p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm`}>
                                        {togglingId === v._id ? <FaSpinner className="animate-spin text-blue-600" size={16} /> : (v.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />)}
                                    </button>
                                    <button onClick={() => handleEdit(v)} className="text-blue-600 p-2 rounded-lg border hover:bg-gray-50 transition-colors shadow-sm"><FaEdit /></button>
                                    <button onClick={() => handleDelete(v._id)} className="text-red-600 p-2 rounded-lg border hover:bg-gray-50 transition-colors shadow-sm"><FaTrash /></button>
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
        totalItems={variants.length}
        onLoadMore={() => setDisplayLimit(prev => prev + 15)}
      />

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 p-4 text-white font-bold text-lg">
                {editingId ? 'Edit Variant' : 'Tambah Variant'}
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Variant</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                  rows="3"
                />
              </div>
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
        title="Hapus Variant"
        message="Hapus variant ini? Pastikan tidak sedang digunakan oleh produk."
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Variants;
