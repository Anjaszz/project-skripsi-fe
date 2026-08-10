import { useState, useEffect } from 'react';
import { inventoryAPI, kasirAPI } from '../services/api';
import { FaPlus, FaMinus, FaTrash, FaShoppingCart, FaReceipt, FaPrint, FaSearch, FaTimes, FaImage, FaSpinner, FaCheckCircle, FaMoneyBillWave, FaDownload } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import { printThermalReceipt, downloadReceiptPDF } from '../utils/receiptGenerator';

const Kasir = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cash paid & change states
  const [cashPaidInput, setCashPaidInput] = useState('');

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
        price: item.purchasePrice || 0,
        image: null,
        variants: [],
        wholesalePrices: [],
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

    let finalPrice = parsedPrice;
    const currentItem = cart.find(item => item.product._id === productId);
    if (currentItem && quantity !== currentItem.quantity) {
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

  const formatInputNumber = (val) => {
    if (val === undefined || val === null || val === '') return '';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseInputNumber = (val) => {
    if (!val) return '';
    return val.toString().replace(/\./g, '').replace(/\D/g, '');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleOpenCheckoutModal = () => {
    if (!isCartValid()) return;
    const total = getTotal();
    setCashPaidInput(total.toString());
    setShowConfirmModal(true);
  };

  const getNumericCashPaid = () => {
    const raw = parseInputNumber(cashPaidInput);
    return raw ? parseInt(raw, 10) : 0;
  };

  const getCalculatedChange = () => {
    const total = getTotal();
    const cash = getNumericCashPaid();
    return Math.max(0, cash - total);
  };

  const handleConfirmCheckout = async () => {
    if (cart.length === 0 || isSubmitting) return;

    const total = getTotal();
    const cashPaid = getNumericCashPaid();

    if (cashPaid < total) {
      toast.warning('Uang tunai kurang dari total pembayaran!');
      return;
    }

    const change = cashPaid - total;

    setIsSubmitting(true);
    const items = cart.map(item => ({
      productId: item.product.inventory._id,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice
    }));

    try {
      const response = await kasirAPI.createTransaction({
        items,
        cashPaid,
        change,
        paymentMethod: 'TUNAI'
      });

      const trxData = {
        ...response.data.data,
        cashPaid,
        change
      };

      setLastTransaction(trxData);
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

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return product.name.toLowerCase().includes(searchLower);
  });

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
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                >
                    Checkout
                </button>
            </div>
        </div>
      </div>

      {/* Checkout Confirmation & Cash Payment Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            {/* Modal Header */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/30">
                  <FaShoppingCart size={18} />
                </div>
                <div>
                  <h3 className="font-black text-lg italic tracking-tight">Konfirmasi Transaksi</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Periksa Rincian & Pembayaran</p>
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
              {/* Ringkasan Item */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                  Daftar Pembelian ({cart.length} Jenis Barang)
                </p>
                <div className="max-h-[140px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
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

              {/* Total Belanja */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-inner">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Belanja</p>
                  <p className="text-2xl font-black text-emerald-400 italic tracking-tight">{formatCurrency(getTotal())}</p>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  Tunai / Cash
                </div>
              </div>

              {/* Input Uang Tunai / Dibayar */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <FaMoneyBillWave className="text-emerald-600" />
                    Uang Tunai / Dibayar:
                  </label>
                  {getNumericCashPaid() < getTotal() && (
                    <span className="text-[10px] font-bold text-red-500 animate-pulse">Kurang!</span>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">Rp</span>
                  <input
                    type="text"
                    value={formatInputNumber(cashPaidInput)}
                    onChange={(e) => setCashPaidInput(parseInputNumber(e.target.value))}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-lg font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>

                {/* Quick Cash Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCashPaidInput(getTotal().toString())}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    Uang Pas
                  </button>
                  {[10000, 20000, 50000, 100000].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCashPaidInput(num.toString())}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {formatCurrency(num)}
                    </button>
                  ))}
                </div>

                {/* Calculation breakdown: Kembalian */}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600">Kembalian:</span>
                  <span className={`font-black text-sm ${getNumericCashPaid() >= getTotal() ? 'text-blue-700' : 'text-red-500'}`}>
                    {formatCurrency(getCalculatedChange())}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 disabled:opacity-50 transition-all italic"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmCheckout}
                disabled={isSubmitting || getNumericCashPaid() < getTotal()}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 italic"
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

      {/* Supermarket Thermal Receipt Preview Modal */}
      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Top Banner */}
            <div className="bg-emerald-600 px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <FaCheckCircle size={20} className="text-emerald-200" />
                <div>
                  <h3 className="font-black text-base italic leading-tight">Transaksi Berhasil</h3>
                  <p className="text-[10px] text-emerald-100 uppercase tracking-widest font-bold">Struk Kasir Siap Dicetak</p>
                </div>
              </div>
              <button 
                onClick={() => setShowReceipt(false)}
                className="text-emerald-100 hover:text-white p-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Thermal Receipt Paper Card Visual */}
            <div className="p-6 overflow-y-auto flex-grow bg-slate-100">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 font-mono text-xs text-slate-900 space-y-4 relative">
                
                {/* Header Toko */}
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
                  <p className="font-black text-sm uppercase tracking-wider">PD. AMANAH LINTANG</p>
                  <p className="text-[10px] text-slate-600 font-sans leading-tight">Distributor & Grosir Air Mineral</p>
                  <p className="text-[9px] text-slate-500 font-sans leading-tight">Jl. Desa Ciasem Tengah, Subang, Jawa Barat</p>
                  <p className="text-[9px] text-slate-500 font-sans">Telp: 0813-2040-2004</p>
                </div>

                {/* Metadata Transaksi */}
                <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-400">
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. Struk</span>
                    <span className="font-bold">{lastTransaction.transactionNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Waktu</span>
                    <span>{new Date(lastTransaction.createdAt).toLocaleDateString('id-ID')} {new Date(lastTransaction.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kasir</span>
                    <span>{lastTransaction.cashierName || 'Kasir'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Metode</span>
                    <span className="font-bold">{lastTransaction.paymentMethod || 'TUNAI'}</span>
                  </div>
                </div>

                {/* Rincian Items */}
                <div className="space-y-2 pb-3 border-b border-dashed border-slate-400">
                  {lastTransaction.items?.map((item, index) => (
                    <div key={index} className="space-y-0.5">
                      <p className="font-bold text-slate-800">
                        {item.productName}{item.variantName ? ` (${item.variantName})` : ''}
                      </p>
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>{item.quantity} x {formatCurrency(item.sellingPrice)}</span>
                        <span className="font-bold text-slate-900">{formatCurrency(item.subtotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="space-y-1.5 pt-1 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Item</span>
                    <span className="font-bold">
                      {lastTransaction.items?.reduce((sum, item) => sum + (item.quantity || 0), 0)} Pcs
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-200">
                    <span>TOTAL BELANJA</span>
                    <span className="text-blue-700">{formatCurrency(lastTransaction.total)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>TUNAI / BAYAR</span>
                    <span>{formatCurrency(lastTransaction.cashPaid || lastTransaction.total)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>KEMBALIAN</span>
                    <span>{formatCurrency(lastTransaction.change || 0)}</span>
                  </div>
                </div>

                {/* Receipt Footer */}
                <div className="text-center pt-4 border-t border-dashed border-slate-400 space-y-1 text-[10px] text-slate-500">
                  <p className="font-bold text-slate-800">*** TERIMA KASIH ***</p>
                  <p>Barang yang sudah dibeli</p>
                  <p>tidak dapat ditukar / dikembalikan.</p>
                  <p className="text-[8px] pt-1 text-slate-400">Struk ini merupakan bukti pembayaran sah.</p>
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-3 gap-2 shrink-0">
              <button
                onClick={() => printThermalReceipt(lastTransaction)}
                className="col-span-1 py-3 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <FaPrint size={14} />
                <span>Cetak POS</span>
              </button>

              <button
                onClick={() => downloadReceiptPDF(lastTransaction)}
                className="col-span-1 py-3 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <FaDownload size={14} />
                <span>PDF Struk</span>
              </button>

              <button
                onClick={() => setShowReceipt(false)}
                className="col-span-1 py-3 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all text-center"
              >
                Selesai
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Kasir;
