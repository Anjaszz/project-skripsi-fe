import { useState, useEffect } from 'react';
import { inventoryAPI, kasirAPI } from '../services/api';
import { FaPlus, FaTrash, FaShoppingCart, FaReceipt, FaPrint, FaSearch } from 'react-icons/fa';
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await inventoryAPI.getForKasir();
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product._id === product._id);
    if (existing) {
      updateCart(existing.product._id, existing.quantity + 1, existing.sellingPrice);
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        sellingPrice: Math.ceil(product.purchasePrice * 1.3) // Default margin 30%
      }]);
    }
  };

  const updateCart = (productId, quantity, sellingPrice) => {
    // Parse values, handle empty string
    const parsedQty = quantity === '' ? '' : parseInt(quantity);
    const parsedPrice = sellingPrice === '' ? '' : parseInt(sellingPrice);

    // Validate quantity if not empty
    if (parsedQty !== '' && parsedQty <= 0) {
      toast.warning('Jumlah harus lebih dari 0');
      return;
    }

    const product = products.find(p => p._id === productId);
    if (parsedQty !== '' && parsedQty > product.stock) {
      toast.warning(`Stok ${product.name} tidak cukup! Tersedia: ${product.stock}`);
      return;
    }

    // Validate selling price if not empty
    if (parsedPrice !== '' && parsedPrice < 0) {
      toast.warning('Harga jual tidak boleh negatif');
      return;
    }

    setCart(cart.map(item =>
      item.product._id === productId
        ? { ...item, quantity: parsedQty, sellingPrice: parsedPrice }
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

  // Check if cart is valid for checkout
  const isCartValid = () => {
    if (cart.length === 0) return false;

    return cart.every(item => {
      // Check if quantity and sellingPrice are valid numbers
      const hasValidQty = typeof item.quantity === 'number' && item.quantity > 0;
      const hasValidPrice = typeof item.sellingPrice === 'number' && item.sellingPrice >= 0;
      return hasValidQty && hasValidPrice;
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warning('Keranjang masih kosong!');
      return;
    }

    const items = cart.map(item => ({
      productId: item.product._id,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice
    }));

    try {
      const response = await kasirAPI.createTransaction({ items });
      setLastTransaction(response.data.data);
      setShowReceipt(true);
      setCart([]);
      fetchProducts(); // Refresh product stock
      toast.success('Transaksi berhasil disimpan!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan transaksi');
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

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const matchName = product.name.toLowerCase().includes(searchLower);
    const matchVariant = product.variantName && product.variantName.toLowerCase().includes(searchLower);

    return matchName || matchVariant;
  });

  const handlePrintInvoice = () => {
    if (!lastTransaction) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('INVOICE PENJUALAN', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text('Inventory & Kasir System', 105, 28, { align: 'center' });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);

    // Transaction Info
    doc.setFontSize(11);
    doc.text(`No. Transaksi: ${lastTransaction.transactionNumber}`, 20, 40);
    doc.text(`Tanggal: ${formatDate(lastTransaction.createdAt)}`, 20, 47);
    doc.text(`Kasir: ${lastTransaction.cashierName}`, 20, 54);

    // Line separator
    doc.setLineWidth(0.2);
    doc.line(20, 58, 190, 58);

    // Table Header
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Item', 20, 65);
    doc.text('Qty', 120, 65, { align: 'right' });
    doc.text('Harga', 150, 65, { align: 'right' });
    doc.text('Subtotal', 185, 65, { align: 'right' });

    doc.line(20, 67, 190, 67);

    // Table Content
    doc.setFont(undefined, 'normal');
    let yPos = 75;

    lastTransaction.items.forEach((item, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      // Product name with variant
      const productText = item.variantName
        ? `${item.productName} (${item.variantName})`
        : item.productName;

      doc.text(productText, 20, yPos);
      doc.text(item.quantity.toString(), 120, yPos, { align: 'right' });
      doc.text(formatCurrency(item.sellingPrice), 150, yPos, { align: 'right' });
      doc.text(formatCurrency(item.subtotal), 185, yPos, { align: 'right' });

      yPos += 7;
    });

    // Line before total
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 8;

    // Total
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', 120, yPos);
    doc.text(formatCurrency(lastTransaction.total), 185, yPos, { align: 'right' });

    // Footer
    yPos += 15;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Terima kasih atas pembelian Anda!', 105, yPos, { align: 'center' });

    // Save or Print
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Kasir</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaShoppingCart className="text-blue-600" />
          <span>Total Produk: <strong>{products.length}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Daftar Produk</h2>
              <span className="text-sm text-gray-600">
                {searchTerm && `Ditemukan ${filteredProducts.length} produk`}
              </span>
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari produk berdasarkan nama atau variant..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {searchTerm ? `Tidak ada produk yang cocok dengan "${searchTerm}"` : 'Belum ada produk tersedia'}
                  </p>
                </div>
              ) : (
                filteredProducts.map(product => (
                <div key={product._id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.variantName || '-'}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Stok: <strong>{product.stock}</strong></span>
                    <span className="text-sm text-gray-600">{formatCurrency(product.purchasePrice)}</span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <FaPlus />
                    <span>Tambah ke Keranjang</span>
                  </button>
                </div>
              ))
              )}
            </div>
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <div className="flex items-center space-x-2 mb-4">
              <FaShoppingCart className="text-2xl text-blue-600" />
              <h2 className="text-xl font-bold">Keranjang</h2>
            </div>

            <div className="max-h-[400px] overflow-y-auto mb-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Keranjang kosong</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product._id} className="border-b py-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium flex-1">{item.product.name} ( <span className="text-sm text-gray-600 mb-2">{item.product.variantName || '-'}</span> )</h4>
                      
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCart(item.product._id, e.target.value, item.sellingPrice)}
                          min="1"
                          max={item.product.stock}
                          className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 ${
                            item.quantity === '' || item.quantity <= 0 || item.quantity > item.product.stock
                              ? 'border-red-500 focus:ring-red-500 bg-red-50'
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Harga Jual</label>
                        <input
                          type="number"
                          value={item.sellingPrice}
                          onChange={(e) => updateCart(item.product._id, item.quantity, e.target.value)}
                          min="0"
                          className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 ${
                            item.sellingPrice === '' || item.sellingPrice < 0
                              ? 'border-red-500 focus:ring-red-500 bg-red-50'
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      {typeof item.quantity === 'number' && typeof item.sellingPrice === 'number' ? (
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.quantity * item.sellingPrice)}
                        </span>
                      ) : (
                        <span className="text-sm text-red-600 italic">
                          Input tidak valid
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">TOTAL</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(getTotal())}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={!isCartValid()}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold transition-colors"
              >
                <FaShoppingCart />
                <span>Checkout</span>
              </button>
              {cart.length > 0 && !isCartValid() && (
                <p className="text-xs text-red-600 mt-2 text-center">
                  Pastikan semua item memiliki qty dan harga yang valid
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <FaReceipt className="text-6xl text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Transaksi Berhasil!</h2>
              <p className="text-gray-600">No: {lastTransaction.transactionNumber}</p>
              <p className="text-sm text-gray-500">{formatDate(lastTransaction.createdAt)}</p>
            </div>

            <div className="border-t border-b py-4 mb-4">
              {lastTransaction.items.map((item, index) => (
                <div key={index} className="flex justify-between mb-2">
                  <div className="text-sm">
                    <span className='font-semibold'>{item.productName}</span> <span className='text-gray-700 font-normal'>({item.variantName})</span> x{item.quantity}
                  </div>
                  <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(lastTransaction.total)}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePrintInvoice}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 font-semibold"
              >
                <FaPrint />
                <span>Cetak Invoice</span>
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kasir;
