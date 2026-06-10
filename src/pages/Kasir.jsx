import { useState, useEffect } from 'react';
import { menuAPI, kasirAPI, inventoryAPI } from '../services/api';
import { FaPlus, FaMinus, FaTrash, FaShoppingCart, FaReceipt, FaPrint, FaSearch, FaTimes, FaImage } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import { jsPDF } from 'jspdf';

const Kasir = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // The backend expects productId from Inventory model
    const items = cart.map(item => ({
      productId: item.product.inventory._id,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice
    }));

    try {
      const response = await kasirAPI.createTransaction({ items });
      setLastTransaction(response.data.data);
      setShowReceipt(true);
      setCart([]);
      fetchProducts();
      toast.success('Transaksi berhasil!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menyimpan transaksi');
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

  if (loading) return <div className="flex justify-center py-20"><div className="spinner"></div></div>;

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
            {filteredProducts.map(product => (
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
                    onClick={handleCheckout}
                    disabled={!isCartValid()}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300"
                >
                    Checkout
                </button>
            </div>
        </div>
      </div>

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
