import { useState, useEffect } from 'react';
import { menuAPI, variantAPI, inventoryAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaImage, FaTimes, FaSearch, FaBox, FaSpinner, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

import Pagination from '../components/Pagination';

const formatInputNumber = (val) => {
  if (val === undefined || val === null || val === '') return '';
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseInputNumber = (val) => {
  if (!val) return '';
  return val.toString().replace(/\./g, '').replace(/\D/g, '');
};

const Produk = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [variants, setVariants] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(15);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    variants: '',
    isActive: true,
    inventory: '',
    wholesalePrices: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const toast = useToast();
  const { isAdmin, user } = useAuth();
  const isDev = user?.role === 'developer';
  const isKasir = user?.role === 'kasir';
  const hasAccess = isAdmin || isDev || isKasir;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', '');

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${BASE_URL}/${cleanPath}`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, variantRes, invRes] = await Promise.all([
        menuAPI.getAll(),
        variantAPI.getAll({ isActive: true }),
        inventoryAPI.getAll()
      ]);
      setMenuItems(menuRes.data.data);
      setVariants(variantRes.data.data);
      setInventoryItems(invRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleInventoryChange = (e) => {
    const invId = e.target.value;
    const invItem = inventoryItems.find(item => item._id === invId);
    
    if (invItem) {
      setFormData({
        ...formData,
        inventory: invId,
        name: invItem.name,
        variants: invItem.variantName || ''
      });
    } else {
      setFormData({
        ...formData,
        inventory: '',
        name: '',
        variants: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('variants', formData.variants);
    data.append('isActive', formData.isActive);
    data.append('inventory', formData.inventory);
    data.append('wholesalePrices', JSON.stringify(formData.wholesalePrices));
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (editingId) {
        await menuAPI.update(editingId, data);
        toast.success('Produk berhasil diupdate');
      } else {
        await menuAPI.create(data);
        toast.success('Produk berhasil ditambahkan');
      }
      await new Promise(r => setTimeout(r, 450));
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      price: item.price,
      variants: item.variants ? item.variants.join(', ') : '',
      isActive: item.isActive,
      inventory: item.inventory?._id || '',
      wholesalePrices: item.wholesalePrices || []
    });
    setImagePreview(getImageUrl(item.image));
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await menuAPI.delete(deleteId);
      toast.success('Produk berhasil dihapus');
      await new Promise(r => setTimeout(r, 450));
      fetchData();
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
      price: '',
      variants: '',
      isActive: true,
      inventory: '',
      wholesalePrices: []
    });
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedItems = filteredItems.slice(0, displayLimit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Produk (Menu)</h1>
        {hasAccess && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm font-semibold"
          >
            <FaPlus /> <span>Tambah Produk</span>
          </button>
        )}
      </div>

      {/* Global Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setDisplayLimit(15);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col h-full animate-pulse">
              <div className="h-48 bg-slate-200"></div>
              <div className="p-4 space-y-3 flex-grow">
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-150 rounded w-1/2"></div>
              </div>
              <div className="p-4 bg-gray-50 border-t flex gap-2">
                <div className="h-9 bg-slate-200 rounded-lg flex-1"></div>
                <div className="h-9 bg-slate-200 rounded-lg flex-1"></div>
              </div>
            </div>
          ))
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-lg border-2 border-dashed">
            <p className="text-gray-500">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          paginatedItems.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {item.image ? (
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <FaImage className="text-4xl" />
                  </div>
                )}
                
                {item.inventory && (
                  <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1.5 border font-black text-[10px] italic ${
                    item.inventory.stock === 0
                      ? 'bg-red-600 text-white border-red-700'
                      : item.inventory.stock < 10
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-white/90 backdrop-blur text-gray-700 border-gray-100'
                  }`}>
                    {item.inventory.stock === 0 ? (
                      <>
                        <FaTimesCircle size={12} className="text-white animate-bounce" />
                        <span>Stok Habis (0)</span>
                      </>
                    ) : item.inventory.stock < 10 ? (
                      <>
                        <FaExclamationTriangle size={12} className="text-white animate-pulse" />
                        <span>Stok Menipis ({item.inventory.stock})</span>
                      </>
                    ) : (
                      <>
                        <FaBox size={10} className="text-blue-500" />
                        <span>Stock: {item.inventory.stock}</span>
                      </>
                    )}
                  </div>
                )}

                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold shadow">
                  {formatCurrency(item.price)}
                </div>
                {!item.isActive && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Tidak Aktif</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-grow">
                <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{item.name}</h3>
                <div className="flex flex-wrap gap-2 mb-4 h-12 overflow-hidden">
                    {item.variants && item.variants.length > 0 ? (
                      item.variants.map((v, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border">
                          {v}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Tanpa varian</span>
                    )}
                </div>
              </div>

              {hasAccess && (
                <div className="p-4 bg-gray-50 border-t flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 bg-white border border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    <FaTrash /> Hapus
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Pagination
        displayLimit={displayLimit}
        totalItems={filteredItems.length}
        onLoadMore={() => setDisplayLimit(prev => prev + 15)}
      />

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload Area */}
              <div className="flex flex-col items-center">
                <div
                  onClick={() => document.getElementById('product-image-input')?.click()}
                  className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden relative"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <FaImage size={32} className="mb-2" />
                      <span className="text-sm">Klik untuk upload gambar</span>
                    </div>
                  )}
                  <input
                    id="product-image-input"
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Inventory Dropdown */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Pilih dari Gudang (Inventory)</label>
                <select
                  value={formData.inventory}
                  onChange={handleInventoryChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Pilih Barang Gudang --</option>
                  {inventoryItems.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.name} {item.variantName ? `(${item.variantName})` : ''} - Stok: {item.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Produk</label>
                  <input
                    type="text"
                    value={formData.name}
                    readOnly
                    className="w-full bg-gray-50 border rounded-lg px-4 py-2 text-gray-500"
                    placeholder="Otomatis dari gudang"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Varian</label>
                  <input
                    type="text"
                    value={formData.variants}
                    readOnly
                    className="w-full bg-gray-50 border rounded-lg px-4 py-2 text-gray-500"
                    placeholder="Otomatis dari gudang"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Harga Jual (IDR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="text"
                      value={formatInputNumber(formData.price)}
                      onChange={(e) => setFormData({...formData, price: parseInputNumber(e.target.value)})}
                      className="w-full border rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-end pb-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2 cursor-pointer">
                        <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Status Aktif
                    </label>
                </div>
              </div>

              {/* Wholesale Prices Section */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Harga Grosir (Opsional)</label>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, wholesalePrices: [...formData.wholesalePrices, { minQty: 1, price: 0 }]})}
                    className="text-[10px] font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    + Tambah Aturan
                  </button>
                </div>
                
                {formData.wholesalePrices.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">Belum ada harga grosir untuk produk ini.</p>
                ) : (
                  <div className="space-y-2">
                    {formData.wholesalePrices.map((rule, index) => (
                      <div key={index} className="flex gap-2 items-center group">
                        <div className="flex-1">
                          <input 
                            type="number"
                            placeholder="Min. Qty"
                            value={rule.minQty}
                            onChange={(e) => {
                              const newRules = [...formData.wholesalePrices];
                              newRules[index].minQty = Number(e.target.value);
                              setFormData({...formData, wholesalePrices: newRules});
                            }}
                            className="w-full text-xs font-bold border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>
                        <div className="flex-[1.5]">
                          <input 
                            type="text"
                            placeholder="Harga Satuan Grosir"
                            value={formatInputNumber(rule.price)}
                            onChange={(e) => {
                              const newRules = [...formData.wholesalePrices];
                              newRules[index].price = parseInputNumber(e.target.value);
                              setFormData({...formData, wholesalePrices: newRules});
                            }}
                            className="w-full text-xs font-bold border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            const newRules = formData.wholesalePrices.filter((_, i) => i !== index);
                            setFormData({...formData, wholesalePrices: newRules});
                          }}
                          className="text-slate-300 hover:text-red-500 p-2"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Hapus Produk"
        message="Yakin ingin menghapus produk ini?"
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Produk;
