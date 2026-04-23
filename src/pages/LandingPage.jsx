import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaSearch, FaPhoneAlt, FaMapMarkerAlt, FaWhatsapp, FaTrash, FaPlus, FaMinus, FaUser, FaInfoCircle, FaBox, FaCreditCard, FaLock, FaTint, FaShieldAlt, FaTruck, FaArrowRight, FaTimes, FaCheckCircle, FaClock, FaChevronRight, FaArrowLeft, FaMoneyBillWave, FaTimesCircle, FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import heroImage from '../assets/hero-image.webp';
import logo from '../assets/logo.jpg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LandingPage = () => {
    const { user, login } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('midtrans');
    const [searchOrderId, setSearchOrderId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [orderHistory, setOrderHistory] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [guestInfo, setGuestInfo] = useState({
        name: '',
        phone: '',
        address: '',
        mapsLink: ''
    });

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        fetchMenu();
        fetchPaymentMethods();
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        
        // Handle Order Status Check from URL
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('order_id');
        if (orderId) {
            handleCheckStatus(orderId);
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCheckStatus = async (id) => {
        try {
            const res = await axios.get(`${API_URL}/orders/public/${id}`);
            setSelectedOrder(res.data.data);
            setIsStatusModalOpen(true);
        } catch (error) {
            toast.error('Pesanan tidak ditemukan');
            // Clean up URL
            window.history.replaceState({}, '', '/');
        }
    };

    useEffect(() => {
        if (isCheckoutOpen && user) {
            setGuestInfo({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                mapsLink: user.mapsLink || ''
            });
        }
    }, [isCheckoutOpen, user]);

    const fetchMenu = async () => {
        try {
            const res = await axios.get(`${API_URL}/menu?isActive=true`);
            setMenu(res.data.data);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    useEffect(() => {
        document.title = 'Pd. Amanah Lintang - Pesan Air Mineral Online';
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            const res = await axios.get(`${API_URL}/payment-methods`);
            const active = res.data.data.filter(m => m.isActive);
            setPaymentMethods(active);
            if (active.length > 0) setSelectedPaymentMethod(active[0].name);
        } catch (error) {
            console.error('Fetch payment error:', error);
        }
    };

    const addToCart = (product) => {
        const variantName = (product.variants && product.variants.length > 0) ? product.variants[0] : '';
        
        const existing = cart.find(item => item.product._id === product._id && item.variantName === variantName);
        if (existing) {
            setCart(cart.map(item => 
                (item.product._id === product._id && item.variantName === variantName)
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            ));
        } else {
            setCart([...cart, { product, quantity: 1, price: product.price, variantName: variantName || '' }]);
        }
        toast.info(`${product.name}${variantName ? ` (${variantName})` : ''} ditambahkan ke keranjang`);
    };

    const updateQuantity = (productId, delta) => {
        setCart(cart.map(item => {
            if (item.product._id === productId) {
                const newQty = Math.max(0, item.quantity + delta);
                return newQty === 0 ? null : { ...item, quantity: newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const getTotal = () => {
        return cart.reduce((sum, item) => {
            const rules = item.product.wholesalePrices || [];
            const sortedRules = [...rules].sort((a, b) => b.minQty - a.minQty);
            const rule = sortedRules.find(r => item.quantity >= r.minQty);
            const price = rule ? rule.price : item.product.price;
            return sum + (price * item.quantity);
        }, 0);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/orders`, {
                items: cart.map(item => ({ 
                    productId: item.product._id, 
                    quantity: item.quantity, 
                    priceAtOrder: getPrice(item),
                    variantName: item.variantName || ''
                })),
                guestInfo: guestInfo,
                paymentMethod: selectedPaymentMethod,
                total: getTotal()
            }, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (res.data.success) {
                const { token, orderNumber } = res.data.data;
                setIsCheckoutOpen(false);
                setCart([]);

                // Simpan ke local history untuk GUEST
                if (!user) {
                    const existingHistory = JSON.parse(localStorage.getItem('guest_orders') || '[]');
                    const newEntry = {
                        orderNumber: orderNumber,
                        total: getTotal(),
                        createdAt: new Date().toISOString(),
                        status: 'pesanan masuk',
                        paymentMethod: selectedPaymentMethod
                    };
                    localStorage.setItem('guest_orders', JSON.stringify([newEntry, ...existingHistory]));
                    loadGuestHistory();
                }
                
                if (selectedPaymentMethod === 'midtrans' && token) {
                    window.snap.pay(token, {
                        onSuccess: () => {
                            toast.success('Pembayaran Berhasil!');
                            handleCheckStatus(orderNumber);
                        },
                        onClose: () => {
                            toast.warning('Segera selesaikan pembayaran Anda');
                            handleCheckStatus(orderNumber);
                        },
                    });
                } else {
                    toast.success('Pesanan berhasil dibuat (COD)!');
                    handleCheckStatus(orderNumber);
                }
            }
        } catch (error) {
            toast.error('Gagal memproses pesanan');
        }
    };

    const loadGuestHistory = () => {
        if (!user) {
            const history = JSON.parse(localStorage.getItem('guest_orders') || '[]');
            setOrderHistory(history);
        }
    };

    useEffect(() => {
        loadGuestHistory();
    }, [user]);

    const filteredMenu = menu.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getPrice = (item) => {
        const rules = item.product.wholesalePrices || [];
        const sortedRules = [...rules].sort((a, b) => b.minQty - a.minQty);
        const rule = sortedRules.find(r => item.quantity >= r.minQty);
        return rule ? rule.price : item.product.price;
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-950">
            {/* Header Modern Clean */}
            <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group" aria-label="Pd. Amanah Lintang Home">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white rotate-3 group-hover:rotate-0 transition-transform">
                            <FaTint size={22} />
                        </div>
                        <div className="flex flex-col -space-y-1">
                             <span className="text-xl font-black italic tracking-tighter">Pd. Amanah</span>
                             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">Distributor Hub</span>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-12 text-[13px] font-black uppercase tracking-widest text-slate-600">
                        <a href="#produk" className="hover:text-slate-900 transition-colors italic">Daftar Produk</a>
                        <a href="#about" className="hover:text-slate-900 transition-colors italic">Tentang Kami</a>
                        <a href="#vision" className="hover:text-slate-900 transition-colors italic">Visi & Misi</a>
                        <a href="#contact" className="hover:text-slate-900 transition-colors italic">Kontak Logistik</a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-3 bg-slate-900 text-white rounded-xl"
                            aria-label="Toggle Mobile Menu"
                        >
                            <FaBars size={18} />
                        </button>

                        {!user && (
                            <button 
                                onClick={() => setIsHistoryOpen(true)}
                                className="hidden md:flex px-6 py-3 bg-white text-slate-800 border-2 border-slate-100 rounded-full font-black text-[10px] uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all items-center gap-2"
                            >
                                 Riwayat Pesanan
                            </button>
                        )}
                        
                        {user ? (
                           <Link to={user.role === 'customer' ? '/customer-dashboard' : (user.role === 'admin' ? '/dashboard' : '/kasir')} className="hidden sm:flex px-6 py-3 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2">
                               Dashboard <FaChevronRight size={10} />
                           </Link>
                        ) : (
                           <Link to="/auth" className="hidden sm:flex px-6 py-3 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2">
                               Masuk / Daftar <FaArrowRight size={10} />
                           </Link>
                        )}
                        <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-white border border-slate-100 rounded-xl text-slate-800 hover:bg-slate-50 transition-all" aria-label="Open Shopping Cart">
                            <FaShoppingCart size={18} />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white ring-px ring-red-200 animate-bounce">{cart.length}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 space-y-4 animate-in slide-in-from-top-4 duration-300 shadow-xl">
                        <nav className="flex flex-col gap-4 text-sm font-black uppercase tracking-widest text-slate-500">
                            <a href="#produk" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-slate-900 italic">Daftar Produk</a>
                            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-slate-900 italic">Tentang Kami</a>
                            <a href="#vision" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-slate-900 italic">Visi & Misi</a>
                            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-slate-900 italic">Kontak Logistik</a>
                        </nav>
                        <div className="pt-4 border-t border-slate-50 flex flex-col gap-3">
                            <Link to="/auth" className="w-full text-center py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Portal Akun</Link>
                            <button 
                                onClick={() => { setIsHistoryOpen(true); setIsMobileMenuOpen(false); }}
                                className="w-full text-center py-4 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400"
                            >
                                Riwayat Pesanan
                            </button>
                        </div>
                    </div>
                )}
            </header>

            <main>
            {/* Hero Section Clean */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest italic border border-blue-100">
                                <FaBox size={10} /> Gudang Distribusi Pd. Amanah Lintang
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95] italic">
                                Pusat Grosir <br /> & Distributor <span className="text-blue-600">Air Mineral</span>
                            </h1>
                            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-lg">
                                Penyuplai utama air mineral berbagai merk untuk kebutuhan toko, kantor, hingga reseller. Stok melimpah, harga grosir terbaik, kirim tepat waktu.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 pt-4">
                            <a href="#produk" className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 flex items-center gap-3">
                                Lihat Produk Grosir <FaArrowRight />
                            </a>
                            <div className="flex -space-x-3 items-center ml-2">
                                {[1,2,3,4].map(i => (
                                    <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-4 border-white" alt={`Partner Reseller ${i}`} loading="lazy" width="40" height="40" />
                                ))}
                                <span className="pl-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">DIPERCAYA 500+ RESELLER</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative animate-in fade-in zoom-in-95 duration-700">
                        <div className="absolute inset-0 bg-blue-100 rounded-[4rem] rotate-3 -z-10 translate-x-4"></div>
                        <img 
                            src={heroImage} 
                            className="w-full rounded-[4rem] shadow-2xl border-4 border-white-to-transparent" 
                            alt="Gudang Air Mineral"
                            fetchPriority="high"
                            loading="eager"
                            decoding="async"
                            width="1280"
                            height="1280"
                        />
                        <div className="absolute -bottom-6 -left-6 bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200 animate-bounce duration-[3000ms]">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">15'</div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-900">Pengiriman Cepat</p>
                                    <p className="text-[10px] text-slate-600 font-medium">Area Subang</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Row - Compact Clean */}
            <section className="bg-slate-50 py-12">
                 <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <FaBox className="text-blue-700" />, title: "Stok Melimpah", desc: "Berbagai merk ternama (Aqua, Le Minerale, VIT) ready stock setiap hari." },
                            { icon: <FaTruck className="text-sky-700" />, title: "Armada Sendiri", desc: "Pengiriman terjadwal dan gratis ongkir untuk area distributor tertentu." },
                            { icon: <FaShieldAlt className="text-emerald-700" />, title: "Harga Distributor", desc: "Harga langsung dari tangan pertama, dijamin kompetitif untuk bisnis Anda." }
                        ].map((f, i) => (
                            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm flex items-start gap-6 hover:translate-y-[-4px] transition-all">
                                <div className="p-4 bg-slate-50 rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
                                    {f.icon}
                                </div>
                                <div>
                                    <h2 className="font-black text-slate-800 uppercase tracking-tighter italic">{f.title}</h2>
                                    <p className="text-slate-600 text-sm font-medium mt-1 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </section>

            {/* Product Section Clean */}
            <section id="produk" className="max-w-7xl mx-auto px-6 py-32 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-4">
                         <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] italic">Katalog Barang</p>
                         <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">Pilihan Produk <span className="text-slate-600 font-bold">Terbaik</span></h2>
                    </div>
                    
                    <div className="relative w-full md:w-96 group">
                        <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-blue-600" />
                        <input 
                            type="text" 
                            placeholder="Cari merk air mineral..." 
                            className="w-full pl-14 pr-8 py-4 bg-slate-100/50 border-0 rounded-3xl outline-none ring-2 ring-transparent focus:ring-blue-600 focus:bg-white transition-all font-bold text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredMenu.map(item => (
                        <div key={item._id} className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden group hover:border-blue-200 transition-all flex flex-col">
                            <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                                <img 
                                    src={item.image ? (item.image.startsWith('http') ? item.image : `${API_URL.replace('/api', '')}/${item.image}`) : `https://via.placeholder.com/400x500?text=${item.name}`} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    alt={item.name} 
                                    loading="lazy"
                                    width="400"
                                    height="500"
                                />
                                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-200">
                                    {item.category || 'Air Mineral'}
                                </div>
                            </div>
                            <div className="p-4 sm:p-8 space-y-3 sm:space-y-4 flex-grow flex flex-col justify-between italic">
                                <div>
                                    <h3 className="font-black text-slate-800 text-xs sm:text-lg uppercase leading-tight tracking-tighter line-clamp-2 min-h-[1.5em] sm:min-h-0 italic">{item.name}</h3>
                                    {item.variants && item.variants.length > 0 && (
                                        <div className="mt-2">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm shadow-emerald-50 italic">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                                Spesifikasi: {item.variants[0]}
                                            </span>
                                        </div>
                                    )}
                                    <p className="hidden sm:block text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 italic">Estimasi Stok Terjamin</p>
                                </div>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-0.5 sm:gap-0">
                                        <p className="text-sm sm:text-xl font-black text-blue-600 leading-none">Rp {item.price.toLocaleString()}</p>
                                        <p className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-tighter line-through decoration-red-300">Rp {(item.price * 1.2).toLocaleString()}</p>
                                    </div>
                                    
                                    {item.wholesalePrices && item.wholesalePrices.length > 0 && (
                                        <div className="bg-blue-50/50 p-2 sm:p-3 rounded-xl border border-blue-100/50">
                                            <p className="text-[8px] sm:text-[9px] font-black text-blue-600 uppercase tracking-widest italic leading-none mb-1.5 active:scale-95 transition-all">Grosir:</p>
                                            <div className="space-y-1">
                                                {item.wholesalePrices.slice(0, 1).map((rule, idx) => (
                                                    <div key={idx} className="flex justify-between text-[8px] sm:text-[10px] font-bold text-blue-800 leading-none">
                                                        <span>Min {rule.minQty}</span>
                                                        <span>@ Rp {rule.price.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                                {item.wholesalePrices.length > 1 && <p className="text-[7px] text-blue-700 text-center font-bold italic pt-0.5">Cek Detail...</p>}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={() => addToCart(item)}
                                        className="w-full bg-slate-900 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-2 group/btn"
                                    >
                                        + <span className="sm:inline">Keranjang</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* About Section Clean */}
            <section id="about" className="py-32 overflow-hidden bg-slate-50/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                            <div className="space-y-4">
                                <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] italic">Siapa Kami?</p>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-tight">Pd. Amanah Lintang: Solusi Logistik Air Mineral Anda</h2>
                            </div>
                             <div className="space-y-6 text-slate-600 font-medium text-lg leading-relaxed italic">
                                <p>
                                    Berawal dari dedikasi untuk menyediakan akses air bersih berkualitas, Pd. Amanah Lintang kini telah berkembang menjadi salah satu distributor air mineral terkemuka di daerah subang dan sekitarnya. 
                                </p>
                                <p>
                                    Kami memahami bahwa kelancaran stok adalah nafas bisnis Anda. Oleh karena itu, kami membangun infrastruktur logistik yang kuat, memastikan setiap reseller mendapatkan produk orisinal dengan harga tangan pertama yang kompetitif.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-8 pt-4">
                                <div className="space-y-1">
                                    <p className="text-3xl font-black text-slate-900 italic">2015</p>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Berdiri Sejak</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-3xl font-black text-slate-900 italic">10k+</p>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Galon/Hari</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative group animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="absolute -inset-4 bg-slate-50 rounded-[4rem] -z-10 group-hover:rotate-1 transition-transform"></div>
                            <div className="aspect-square bg-slate-100 rounded-[3rem] shadow-2xl border-2 border-white overflow-hidden relative">
                                <img 
                                    src={logo} 
                                    className="w-full h-full object-contain grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
                                    alt="Tentang Kami" 
                                    loading="lazy"
                                    width="328"
                                    height="328"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visi & Misi Section */}
            <section id="vision" className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-20">
                        {/* Visi */}
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="space-y-4">
                                <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] italic">Masa Depan Kami</p>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-tight uppercase">Visi Kami</h2>
                            </div>
                            <div className="p-10 bg-blue-50 rounded-[3rem] border border-blue-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 text-blue-100 group-hover:text-blue-200 transition-colors">
                                    <FaTint size={120} />
                                </div>
                                <p className="text-2xl font-black text-blue-900 italic leading-relaxed relative z-10">
                                    "Menjadi usaha distribusi air mineral yang terpercaya dan profesional dalam
menyediakan produk berkualitas serta pelayanan distribusi yang tepat waktu kepada
agen dan toko."
                                </p>
                            </div>
                        </div>

                        {/* Misi */}
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            <div className="space-y-4">
                                <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] italic">Langkah Nyata</p>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-tight uppercase">Misi Kami</h2>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { title: "Produk Berkualitas", desc: "Menyediakan produk air mineral yang aman dan berkualitas sesuai dengan kebutuhan pelanggan." },
                                    { title: "Distribusi Efisien", desc: "Melaksanakan proses distribusi barang secara tepat waktu dan efisien." },
                                    { title: "Pelayanan Profesional", desc: "Memberikan pelayanan yang baik dan profesional kepada agen, toko, serta pihak terkait." },
                                    { title: "Kemitraan Strategis", desc: "Menjalin kerja sama yang baik dengan agen, toko, dan pihak terkait dalam kegiatan distribusi." }
                                ].map((misi, i) => (
                                    <div key={i} className="flex gap-6 p-6 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                        <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                                            <FaCheckCircle size={20} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-black text-slate-800 uppercase italic tracking-tighter">{misi.title}</h3>
                                            <p className="text-slate-500 text-sm font-medium leading-relaxed italic">{misi.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            </main>

            {/* Footer Modern Clean */}
            <footer id="contact" className="bg-slate-900 py-32">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-16">
                    <div className="md:col-span-2 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                                <FaTint size={24} />
                            </div>
                            <span className="text-2xl font-black text-white italic tracking-tighter">Pd. Amanah Lintang</span>
                        </div>
                        <p className="text-slate-200 text-lg font-medium leading-relaxed max-w-sm italic">
                            Mitra terpercaya distribusi air mineral kemasan sejak 2015. Komitmen pada kualitas stok dan ketepatan waktu pengiriman.
                        </p>
                        <div className="flex gap-6">
                            {[
                                { Icon: FaWhatsapp, link: "https://wa.me/6281320402004", label: "Hubungi via WhatsApp" },
                                { Icon: FaMapMarkerAlt, link: "https://maps.app.goo.gl/1nYUzLpyULRWHwiU7", label: "Lihat Lokasi di Google Maps" },
                                { Icon: FaPhoneAlt, link: "tel:081320402004", label: "Hubungi via Telepon" }
                            ].map((item, i) => (
                                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-all border border-white/10" aria-label={item.label}>
                                    <item.Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-8">
                        <h4 className="text-white font-black uppercase tracking-widest text-xs italic">Akses Cepat</h4>
                        <ul className="space-y-4 text-slate-300 text-sm font-bold">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Daftar Menjadi Reseller</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Cara Pemesanan Grosir</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Cek Status Pesanan</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Bantuan Support</a></li>
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-white font-black uppercase tracking-widest text-xs italic">Lokasi Hub</h4>
                        <div className="text-slate-300 text-sm font-bold space-y-4 ">
                            <div className="flex gap-3 hover:text-blue-400 transition-colors">
                                <FaMapMarkerAlt className="text-blue-600 shrink-0" />
                                <a href='https://maps.app.goo.gl/1nYUzLpyULRWHwiU7' className="italic">Jl. Desa Ciasem Tengah, Ciasem Tengah, Kec. Ciasem, Kabupaten Subang, Jawa Barat 41256</a>
                            </div>
                            <div className="flex gap-3">
                                <FaPhoneAlt className="text-blue-600 shrink-0" />
                                <p>0813-2040-2004</p>
                            </div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/70 pt-4">© {new Date().getFullYear()} PD AMANAH LINTANG</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Shopping Cart Drawer Clean */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
                    <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-500">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic">Keranjang Belanja</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{cart.length} Jenis Barang</p>
                            </div>
                             <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all font-bold" aria-label="Close Shopping Cart">×</button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 space-y-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-6">
                                    <FaShoppingCart size={64} className="opacity-20" />
                                    <p className="font-bold italic">Keranjang masih kosong</p>
                                    <button onClick={() => setIsCartOpen(false)} className="text-blue-600 text-xs font-black uppercase tracking-widest underline">Cari Barang Sekarang</button>
                                </div>
                            ) : (
                                cart.map(item => {
                                    const updateQuantity = (productId, delta, variantName = '') => {
                                        setCart(cart.map(item => {
                                            if (item.product._id === productId && item.variantName === variantName) {
                                                const newQuantity = Math.max(0, item.quantity + delta);
                                                return { ...item, quantity: newQuantity };
                                            }
                                            return item;
                                        }).filter(item => item.quantity > 0));
                                    };

                                    const getPrice = (item) => {
                                        const product = item.product;
                                        if (!product.wholesalePrices) return product.price;
                                        const rule = [...product.wholesalePrices]
                                            .sort((a,b) => b.minQty - a.minQty)
                                            .find(r => item.quantity >= r.minQty);
                                        return rule ? rule.price : product.price;
                                    };

                                    return (
                                        <div key={item.product._id + (item.variantName || '')} className="flex items-center gap-6 group scale-102 transition-transform">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-50">
                                                <img 
                                                    src={item.product.image ? (item.product.image.startsWith('http') ? item.product.image : `${API_URL.replace('/api', '')}/${item.product.image}`) : `https://via.placeholder.com/100?text=${item.product.name}`} 
                                                    className="w-full h-full object-cover" 
                                                    alt={item.product.name}
                                                    loading="lazy"
                                                    width="80"
                                                    height="80"
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter italic leading-tight">{item.product.name}</h4>
                                                    <button onClick={() => updateQuantity(item.product._id, -item.quantity, item.variantName)} className="text-slate-200 hover:text-red-500 transition-colors">
                                                        <FaTrash size={12} />
                                                    </button>
                                                </div>
                                                
                                                {item.variantName && (
                                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5 italic">Varian: {item.variantName}</p>
                                                )}

                                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-blue-600 font-black text-xs italic leading-none">Rp {getPrice(item).toLocaleString()}</p>
                                                        {getPrice(item) < item.product.price && (
                                                            <span className="text-[8px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-md uppercase tracking-widest italic leading-none">Grosir</span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-800 font-black text-xs italic leading-none">Total: Rp {(getPrice(item) * item.quantity).toLocaleString()}</p>
                                                </div>

                                                <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 p-1 w-fit mt-3">
                                                    <button onClick={() => updateQuantity(item.product._id, -1, item.variantName)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors" aria-label="Decrease Quantity"><FaMinus size={10} /></button>
                                                    <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product._id, 1, item.variantName)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors" aria-label="Increase Quantity"><FaPlus size={10} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pembayaran</span>
                                <span className="text-2xl font-black text-slate-900 italic">Rp {getTotal().toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsCartOpen(false);
                                    setIsCheckoutOpen(true);
                                }}
                                disabled={cart.length === 0}
                                className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                Proses Checkout <FaCreditCard size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Modal Clean */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setIsCheckoutOpen(false)}></div>
                    <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                        <div className="p-6 sm:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/10 shrink-0">
                            <div>
                                <h3 className="text-xl sm:text-3xl font-black text-slate-800 tracking-tighter italic leading-none uppercase">Informasi Pengiriman</h3>
                                <p className="text-[10px] sm:text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest italic">Lengkapi data untuk proses pengiriman</p>
                            </div>
                            <button onClick={() => setIsCheckoutOpen(false)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all text-xl font-bold italic shrink-0" aria-label="Close Checkout">×</button>
                        </div>

                        <form onSubmit={handleCheckout} className="p-6 sm:p-10 space-y-6 sm:space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nama Penerima</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input 
                                            required
                                            type="text" 
                                            value={guestInfo.name}
                                            onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                                            className="w-full pl-14 pr-8 py-5 bg-slate-50 border-0 rounded-[1.5rem] outline-none ring-2 ring-transparent focus:ring-blue-600 focus:bg-white transition-all font-bold text-sm"
                                            placeholder="Nama lengkap..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">No. WhatsApp Aktif</label>
                                    <div className="relative">
                                        <FaPhoneAlt className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input 
                                            required
                                            type="tel" 
                                            value={guestInfo.phone}
                                            onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                                            className="w-full pl-14 pr-8 py-5 bg-slate-50 border-0 rounded-[1.5rem] outline-none ring-2 ring-transparent focus:ring-blue-600 focus:bg-white transition-all font-bold text-sm tracking-widest"
                                            placeholder="08xxxxxxxxxx"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Alamat Pengiriman</label>
                                    <textarea 
                                        required
                                        rows="2"
                                        value={guestInfo.address}
                                        onChange={(e) => setGuestInfo({...guestInfo, address: e.target.value})}
                                        className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 outline-none ring-2 ring-transparent transition-all focus:ring-blue-600 focus:bg-white font-bold text-sm resize-none"
                                        placeholder="Jl. Raya No. 123..."
                                    ></textarea>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Link Google Maps (Opsional)</label>
                                    <input 
                                        type="url"
                                        value={guestInfo.mapsLink}
                                        onChange={(e) => setGuestInfo({...guestInfo, mapsLink: e.target.value})}
                                        className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 outline-none ring-2 ring-transparent transition-all focus:ring-blue-600 focus:bg-white font-bold text-sm"
                                        placeholder="https://goo.gl/maps/..."
                                    />
                                </div>
                            </div>

                            {/* Rincian Checkout */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Rincian Pesanan</label>
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    {cart.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tighter italic">{item.product.name}</p>
                                                {item.variantName && (
                                                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest italic">{item.variantName}</p>
                                                )}
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                                                    {item.quantity}x @ Rp {item.price.toLocaleString()}
                                                </p>
                                            </div>
                                            <p className="text-sm font-black text-slate-800 italic">Rp {(item.quantity * item.price).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pemilihan Metode Pembayaran */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Metode Pembayaran</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {paymentMethods.length === 0 ? (
                                        <div className="col-span-full py-4 text-center text-slate-300 font-bold italic animate-pulse">Menghubungkan layanan pembayaran...</div>
                                    ) : (
                                        paymentMethods
                                            .filter(m => !m.isRestrictedToLoggedIn || (m.isRestrictedToLoggedIn && user))
                                            .map((method) => (
                                            <div 
                                                key={method._id}
                                                onClick={() => setSelectedPaymentMethod(method.name)}
                                                className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-4 ${
                                                    selectedPaymentMethod === method.name 
                                                    ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-100' 
                                                    : 'border-slate-100 bg-white hover:border-slate-200'
                                                }`}
                                            >
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                                                    selectedPaymentMethod === method.name ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                    {method.name === 'midtrans' ? <FaCreditCard /> : <FaMoneyBillWave />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm italic uppercase leading-none">{method.displayName}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                                                        {method.name === 'midtrans' ? 'Otomatis' : 'Bayar di Tempat'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <FaLock className="text-emerald-500" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">
                                        {selectedPaymentMethod === 'midtrans' ? 'Secure Gateway \n by Midtrans Snap' : 'Manual Verification \n by Logistics Team'}
                                    </p>
                                </div>
                                <button type="submit" className="w-full sm:w-auto px-16 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 italic flex items-center gap-3">
                                    {selectedPaymentMethod === 'midtrans' ? 'Bayar Sekarang' : 'Pesan Sekarang (COD)'} Rp {getTotal().toLocaleString()} <FaArrowRight />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Riwayat Pesanan (GUEST - Lokal) */}
            {isHistoryOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setIsHistoryOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tighter italic leading-none">Riwayat Pesanan</h3>
                                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest italic">Tersimpan di Browser Anda</p>
                            </div>
                            <button onClick={() => setIsHistoryOpen(false)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all font-bold" aria-label="Close History">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {orderHistory.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto">
                                        <FaBox size={24} />
                                    </div>
                                    <p className="text-slate-400 font-bold italic">Belum ada riwayat pesanan di perangkat ini.</p>
                                    <button 
                                        onClick={() => {
                                            setIsHistoryOpen(false);
                                            setIsSearchModalOpen(true);
                                        }}
                                        className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline italic"
                                    >
                                        Gunakan ID Pesanan Secara Manual
                                    </button>
                                </div>
                            ) : (
                                orderHistory.map((order, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => {
                                            handleCheckStatus(order.orderNumber);
                                            setIsHistoryOpen(false);
                                        }}
                                        className="group p-6 bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-600 rounded-[2rem] transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm border border-slate-100 transition-colors">
                                                <FaBox />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 italic uppercase tracking-tighter">{order.orderNumber}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                                                    {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 self-end sm:self-auto">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-800 italic">Rp {order.total.toLocaleString()}</p>
                                                <p className={`text-[8px] font-black uppercase tracking-widest italic ${
                                                    order.status === 'selesai' ? 'text-emerald-500' : 'text-blue-500'
                                                }`}>
                                                    {order.status}
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-300 group-hover:text-blue-600 border border-slate-100 transition-all">
                                                <FaChevronRight size={10} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-400 italic">ID Pesanan Lainnya?</p>
                            <button 
                                onClick={() => {
                                    setIsHistoryOpen(false);
                                    setIsSearchModalOpen(true);
                                }}
                                className="px-6 py-3 bg-white border border-slate-200 text-slate-800 rounded-xl font-black uppercase text-[9px] tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all italic flex items-center gap-2"
                            >
                                <FaSearch size={10} /> Cari ID Pesanan
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Status Pesanan (Dunia Nyata) */}
            {isStatusModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => {
                        setIsStatusModalOpen(false);
                        window.history.replaceState({}, '', '/');
                    }}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <FaBox />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tighter italic">Status Pesanan</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedOrder.orderNumber}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsStatusModalOpen(false);
                                    window.history.replaceState({}, '', '/');
                                }}
                                className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all font-bold"
                                aria-label="Close Status"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Stepper Status / Pembatalan */}
                            {selectedOrder.status === 'dibatalkan' ? (
                                <div className="p-8 bg-red-50 border-2 border-red-100 rounded-[2.5rem] flex items-center gap-6 animate-in zoom-in-95 duration-500">
                                    <div className="w-16 h-16 bg-red-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                                        <FaTimesCircle size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-red-600 uppercase italic tracking-tighter">Pesanan Dibatalkan</h4>
                                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1">Alasan: {selectedOrder.cancelReason || 'Kebijakan Admin'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 gap-2">
                                    {['pesanan masuk', 'di proses', 'dikirim', 'selesai'].map((step, idx) => {
                                        const isActive = selectedOrder.status === step;
                                        const isDone = ['pesanan masuk', 'di proses', 'dikirim', 'selesai'].indexOf(selectedOrder.status) >= idx;
                                        return (
                                            <div key={step} className="flex flex-col items-center gap-2">
                                                <div className={`w-full h-1.5 rounded-full transition-all duration-500 ${isDone ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                                                <span className={`text-[8px] font-black uppercase tracking-widest text-center ${isActive ? 'text-blue-600' : 'text-slate-300'}`}>
                                                    {step}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Summary Detail */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Informasi Penerima</p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-800 italic">{selectedOrder.guestInfo?.name || selectedOrder.customer?.name}</p>
                                        <p className="text-xs font-bold text-slate-500">{selectedOrder.guestInfo?.phone || selectedOrder.customer?.phone}</p>
                                        <p className="text-xs text-slate-400 leading-relaxed">{selectedOrder.guestInfo?.address || selectedOrder.customer?.address}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Status Pembayaran</p>
                                    <div className="flex flex-col items-start gap-2">
                                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2 ${
                                            selectedOrder.paymentStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                            (selectedOrder.paymentStatus === 'failed' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100')
                                        }`}>
                                            {selectedOrder.paymentStatus === 'success' ? <FaCheckCircle /> : <FaClock />}
                                            {selectedOrder.paymentStatus.toUpperCase()}
                                        </div>
                                        {selectedOrder.paymentStatus === 'pending' && selectedOrder.midtransToken && (new Date().getTime() - new Date(selectedOrder.createdAt).getTime() < 15 * 60 * 1000) && (
                                            <button 
                                                onClick={() => {
                                                    window.snap.pay(selectedOrder.midtransToken, {
                                                        onSuccess: () => {
                                                            toast.success('Pembayaran Berhasil!');
                                                            handleCheckStatus(selectedOrder.orderNumber);
                                                        },
                                                        onClose: () => toast.warning('Segera selesaikan pembayaran Anda'),
                                                    });
                                                }}
                                                className="mt-2 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 animate-pulse italic"
                                            >
                                                <FaCreditCard size={12} /> Bayar Sekarang
                                            </button>
                                        )}
                                        <p className="text-[10px] text-slate-400 font-bold italic">Metode: {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Midtrans Secure Payment'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="space-y-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic ml-1">Rincian Produk</p>
                                <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-black text-slate-400 text-[9px] uppercase tracking-widest italic">Item</th>
                                                <th className="px-6 py-4 text-center font-black text-slate-400 text-[9px] uppercase tracking-widest italic">Qty</th>
                                                <th className="px-6 py-4 text-right font-black text-slate-400 text-[9px] uppercase tracking-widest italic">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {selectedOrder.items.map((item, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-800 italic">{item.productName}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-500">{item.quantity}x</td>
                                                    <td className="px-6 py-4 text-right font-black text-slate-800">Rp {item.subtotal.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50/80">
                                            <tr>
                                                <td colSpan="2" className="px-6 py-4 text-right font-black text-slate-400 text-[10px] uppercase italic">Total Pembayaran</td>
                                                <td className="px-6 py-4 text-right font-black text-blue-600 text-lg italic">Rp {selectedOrder.total.toLocaleString()}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 md:flex block justify-between items-center space-y-4 md:space-y-0">
                            <div className="flex items-center gap-3">
                                <FaShieldAlt className="text-blue-600" />
                                <p className="text-[9px] font-black text-slate-400 italic">Transaksi Aman & Terverifikasi <br /> Pd. Amanah Lintang</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsStatusModalOpen(false);
                                    window.history.replaceState({}, '', '/');
                                }}
                                className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all italic flex items-center justify-center gap-2"
                            >
                                Tutup <FaChevronRight size={10} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Lacak Pesanan (GUEST) */}
            {isSearchModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setIsSearchModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 md:p-14 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter italic leading-none">Lacak Pesanan</h3>
                                    <p className="text-slate-400 text-xs font-medium italic">Masukkan ID Pesanan Anda untuk melihat status terbaru.</p>
                                </div>
                                <button onClick={() => setIsSearchModalOpen(false)} className="w-12 h-12 bg-slate-50 text-slate-500 hover:text-blue-600 rounded-2xl flex items-center justify-center transition-all" aria-label="Close Search">
                                    <FaTimes size={14} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">ID Pesanan (Contoh: ORD2024...)</label>
                                    <div className="relative group">
                                        <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                        <input 
                                            type="text" 
                                            value={searchOrderId}
                                            onChange={(e) => setSearchOrderId(e.target.value)}
                                            className="w-full bg-slate-50 border-0 rounded-2xl pl-14 pr-8 py-5 outline-none ring-2 ring-transparent transition-all focus:ring-blue-600 focus:bg-white font-bold text-sm tracking-widest uppercase"
                                            placeholder="ORD..."
                                        />
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        if (searchOrderId.trim()) {
                                            window.location.href = `/?order_id=${searchOrderId}`;
                                            setIsSearchModalOpen(false);
                                        }
                                    }}
                                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Cek Status Sekarang <FaChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
