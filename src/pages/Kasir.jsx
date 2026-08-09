import { useState, useEffect } from 'react';
import { menuAPI, kasirAPI, inventoryAPI } from '../services/api';
import { FaPlus, FaMinus, FaTrash, FaShoppingCart, FaReceipt, FaPrint, FaSearch, FaTimes, FaImage, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import { jsPDF } from 'jspdf';

const Kasir = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', '');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await inventoryAPI.getForKasir();
      // Map Inventory products to a structure Kasir page expects
      const mappedProducts = response.data.data.map(item => ({
        ...item,
        _id: item._id,
        name: item.name + (item.variantName ? ` - ${item.variantName}` : ''),
        price: item.purchasePrice || 0, // Default selling price to latest purchase price
        image: null, // Inventory doesn't have images
        variants: [], // Inventory variants are handled in name
        wholesalePrices: [], // Inventory doesn't have wholesale rules
        inventory: {
          _id: item._id,
          stock: item.stock
        }
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mengambil data produk inventory');
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (item, qty) => {
    if (!item.wholesalePrices || item.wholesalePrices.length === 0) return item.price;
    const sortedRules = [...item.wholesalePrices].sort((a, b) => b.minQty - a.minQty);
    const rule = sortedRules.find(r => qty >= r.minQty);
    return rule ? rule.price : item.price;
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product._id === product._id);
    if (existing) {
      const newQty = (existing.quantity || 0) + 1;
      const newPrice = getPrice(product, newQty);
      updateCart(existing.product._id, newQty, newPrice);
    } else {
      const price = getPrice(product, 1);
      setCart([...cart, {
        product,
        quantity: 1,
        sellingPrice: price
      }]);
    }
  };

  const updateCart = (productId, quantity, sellingPrice) => {
    const parsedQty = quantity === '' ? '' : parseInt(quantity);
    const parsedPrice = sellingPrice === '' ? '' : parseInt(sellingPrice);

    if (parsedQty !== '' && parsedQty <= 0) {
      toast.warning('Jumlah harus lebih dari 0');
      return;
    }

    const itemObj = products.find(p => p._id === productId);
    if (!itemObj) return;

    const stockAvailable = itemObj.inventory?.stock || 0;

    if (parsedQty !== '' && parsedQty > stockAvailable) {
      toast.warning(`Stok ${itemObj.name} tidak cukup! Tersedia: ${stockAvailable}`);
      return;
    }

    // Auto-calculate wholesale price if quantity changed but price was at previous default/wholesale
    let finalPrice = parsedPrice;
    const currentItem = cart.find(item => item.product._id === productId);
    if (currentItem && quantity !== currentItem.quantity) {
      // If the cashier hasn't manually overridden with a random price 
      // (or if we just want to re-apply rules whenever qty changes)
      finalPrice = getPrice(itemObj, parsedQty || 1);
    }

    setCart(cart.map(item =>
      item.product._id === productId
        ? { ...item, quantity: parsedQty, sellingPrice: finalPrice }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => {
      const qty = typeof item.quantity === 'number' ? item.quantity : 0;
      const price = typeof item.sellingPrice === 'number' ? item.sellingPrice : 0;
      return sum + (qty * price);
    }, 0);
  };

  const isCartValid = () => {
    if (cart.length === 0) return false;
    return cart.every(item => item.quantity > 0 && item.sellingPrice >= 0);
  };

  const handleOpenCheckoutModal = () => {
    if (!isCartValid()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmCheckout = async () => {
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    // The backend expects productId from Inventory model
    const items = cart.map(item => ({
      productId: item.product.inventory._id,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice
    }));

    try {
      const response = await kasirAPI.createTransaction({ items });
      setLastTransaction(response.data.data);
      await new Promise(r => setTimeout(r, 450));
      setShowConfirmModal(false);
      setShowReceipt(true);
      setCart([]);
      fetchProducts();
      toast.success('Transaksi Kasir Berhasil!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatInputNumber = (val) => {
    if (val === undefined || val === null || val === '') return '';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseInputNumber = (val) => {
    return val.replace(/\./g, '').replace(/\D/g, '');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return product.name.toLowerCase().includes(searchLower);
  });

  const handlePrintInvoice = () => {
    if (!lastTransaction) return;
    const doc = new jsPDF();
    doc.text('INVOICE', 105, 20, { align: 'center' });
    doc.text(`No: ${lastTransaction.transactionNumber}`, 20, 40);
    doc.text(`Total: ${formatCurrency(lastTransaction.total)}`, 20, 60);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Kasir (Stok Inventory)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border relative">
            <FaSearch className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari barang di inventory..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col h-full animate-pulse">
                  <div className="h-32 bg-slate-200"></div>
                  <div className="p-4 space-y-2 flex-grow">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-150 rounded w-1/2"></div>
                  </div>
                  <div className="p-4 pt-0">
                    <div className="h-8 bg-slate-200 rounded-lg w-full"></div>
                  </div>
                </div>
              ))
            ) : filteredProducts.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="relative h-32 bg-gray-100 overflow-hidden">
                  {product.image ? (
                    <img
                      src={`${BASE_URL}/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FaImage size={24} />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white px-2 py-1 text-[10px] font-bold backdrop-blur-sm">
                    Stock: {product.inventory?.stock || 0}
                  </div>
                </div>
                
                <div className="p-4 flex-grow">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-blue-600 font-black text-sm">{formatCurrency(product.price)}</p>
                  {product.variants && product.variants.length > 0 && (
                     <p className="text-[10px] text-gray-400 mt-1 truncate">{product.variants.join(', ')}</p>
                  )}
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    Pilih Barang
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white rounded-lg shadow-md border overflow-hidden flex flex-col h-fit sticky top-6">
            <div className="p-4 bg-gray-50 border-b flex items-center gap-2">
                <FaShoppingCart className="text-blue-600" />
                <h2 className="font-bold text-gray-800">Keranjang</h2>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
                {cart.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">Keranjang kosong</p>
                ) : (
                    cart.map(item => (
                        <div key={item.product._id} className="flex justify-between items-center text-sm border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex-1 pr-4">
                                <p className="font-bold text-gray-800 leading-tight">{item.product.name}</p>
                                <div className="flex flex-col gap-2 mt-2">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateCart(item.product._id, Math.max(1, (Number(item.quantity) || 1) - 1), item.sellingPrice)} className="text-gray-400 hover:text-blue-500"><FaMinus size={10} /></button>
                                        <input 
                                            type="number" 
                                            value={item.quantity} 
                                            onChange={(e) => updateCart(item.product._id, e.target.value, item.sellingPrice)}
                                            className="font-bold w-12 text-center border rounded py-0.5 text-xs"
                                        />
                                        <button onClick={() => updateCart(item.product._id, (Number(item.quantity) || 0) + 1, item.sellingPrice)} className="text-gray-400 hover:text-blue-500"><FaPlus size={10} /></button>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-bold">Rp</span>
                                        <input 
                                            type="text" 
                                            value={formatInputNumber(item.sellingPrice)}
                                            onChange={(e) => updateCart(item.product._id, item.quantity, parseInputNumber(e.target.value))}
                                            className="w-full pl-7 pr-2 py-1 border rounded text-xs font-bold text-blue-600 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col justify-between h-full min-h-[60px]">
                                <button onClick={() => removeFromCart(item.product._id)} className="text-red-400 hover:text-red-600 self-end"><FaTrash size={12} /></button>
                                <div>
                                    <p className="text-[9px] text-gray-600 uppercase font-bold">Subtotal</p>
                                    <p className="font-black text-gray-800">{formatCurrency((Number(item.quantity) || 0) * (Number(item.sellingPrice) || 0))}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="p-4 bg-gray-50 border-t">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-xl font-bold text-gray-800">{formatCurrency(getTotal())}</span>
                </div>
                <button
                    onClick={handleOpenCheckoutModal}
                    disabled={!isCartValid()}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300"
                >
                    Checkout
                </button>
            </div>
        </div>
      </div>

      {/* Checkout Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            {/* Modal Header */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/30">
                  <FaShoppingCart size={18} />
                </div>
                <div>
                  <h3 className="font-black text-lg italic tracking-tight">Konfirmasi Transaksi</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Periksa Rincian Belanja Kasir</p>
                </div>
              </div>
              <button 
                onClick={() => !isSubmitting && setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-white disabled:opacity-30 p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Ringkasan Barang ({cart.length} Jenis)</p>
                <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.product._id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 font-black text-[10px] flex items-center justify-center border border-blue-100">
                          {item.quantity}
                        </span>
                        <span className="font-bold text-slate-700">{item.product.name}</span>
                      </div>
                      <span className="font-black text-slate-900 italic">
                        {formatCurrency((Number(item.quantity) || 0) * (Number(item.sellingPrice) || 0))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pembayaran</p>
                  <p className="text-xl font-black text-blue-700 italic tracking-tight">{formatCurrency(getTotal())}</p>
                </div>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Tunai / Kasir
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 disabled:opacity-50 transition-all italic"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmCheckout}
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 italic"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle size={14} />
                    <span>Konfirmasi & Bayar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-center mb-4 text-green-600 flex items-center justify-center gap-2">
                <FaReceipt /> Transaksi Berhasil
            </h2>
            <div className="space-y-2 text-sm border-y py-4 mb-4">
                {lastTransaction.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                        <span>{item.productName} x{item.quantity}</span>
                        <span className="font-bold">{formatCurrency(item.subtotal)}</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-between font-black text-lg mb-6">
                <span>TOTAL</span>
                <span className="text-blue-700">{formatCurrency(lastTransaction.total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={handlePrintInvoice} className="bg-gray-800 text-white py-2 rounded font-bold hover:bg-gray-900 flex items-center justify-center gap-2">
                    <FaPrint size={14} /> Cetak
                </button>
                <button onClick={() => setShowReceipt(false)} className="bg-white border text-gray-600 py-2 rounded font-bold hover:bg-gray-50">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kasir;
