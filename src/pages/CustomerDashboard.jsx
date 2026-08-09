import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FaBox, FaUser, FaHistory, FaShoppingBag, FaSignOutAlt, FaTint, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaChevronRight, FaCheckCircle, FaClock, FaTimesCircle, FaArrowLeft, FaReceipt, FaCreditCard, FaBars } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PaymentTimer = ({ createdAt }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            const expiryTime = new Date(createdAt).getTime() + 15 * 60 * 1000;
            const now = new Date().getTime();
            const diff = expiryTime - now;

            if (diff <= 0) {
                setTimeLeft('EXPIRED');
                return;
            }

            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            
            setIsUrgent(mins < 5);
            setTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [createdAt]);

    if (timeLeft === 'EXPIRED') return <span className="text-[10px] font-bold text-red-500">Waktu Habis</span>;

    return (
        <div className={`flex items-center gap-1.5 font-bold ${isUrgent ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
            <FaClock size={10} />
            <span className="text-[10px] tracking-tight">{timeLeft}</span>
        </div>
    );
};

const CustomerDashboard = () => {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        mapsLink: user?.mapsLink || ''
    });

    useEffect(() => {
        document.title = 'Portal Distributor | Amanah Hub';
        if (!user) {
            navigate('/auth');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                mapsLink: user.mapsLink || ''
            });
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setOrders(res.data.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await updateProfile(profileData);
            if (res.success) {
                toast.success('Profil berhasil diperbarui!');
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat menyimpan profil');
        } finally {
            setSaving(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'selesai': return 'bg-green-100 text-green-700 border-green-200';
            case 'pesanan masuk': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'di proses': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'dibatalkan': return 'bg-slate-100 text-slate-500 border-slate-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const renderOverview = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header Ringkasan: 1 Baris Kesamping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex md:flex-col justify-between items-center md:items-start">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pesanan</p>
                    <p className="text-2xl font-black text-slate-800">{orders.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex md:flex-col justify-between items-center md:items-start">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menunggu</p>
                    <p className="text-2xl font-black text-amber-600">{orders.filter(o => o.status === 'pesanan masuk' && o.paymentStatus === 'pending').length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex md:flex-col justify-between items-center md:items-start">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diproses</p>
                    <p className="text-2xl font-black text-blue-600">{orders.filter(o => o.status === 'di proses').length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex md:flex-col justify-between items-center md:items-start">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selesai</p>
                    <p className="text-2xl font-black text-emerald-600">{orders.filter(o => o.status === 'selesai').length}</p>
                </div>
            </div>

            {/* Pesanan Terbaru */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-sm">Pesanan Terbaru</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-blue-600 text-xs font-bold hover:underline">Lihat Semua</button>
                </div>
                <div className="divide-y divide-slate-50">
                    {orders.slice(0, 5).length === 0 ? (
                        <div className="p-10 text-center text-slate-300 text-sm font-bold">Belum ada pesanan</div>
                    ) : (
                        orders.slice(0, 5).map(order => (
                            <div key={order._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getStatusStyle(order.status)}`}>
                                        <FaReceipt size={14} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-xs">{order.orderNumber}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} Item</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className="font-bold text-slate-800 text-sm">Rp {order.total.toLocaleString()}</p>
                                    {order.paymentStatus === 'pending' && <PaymentTimer createdAt={order.createdAt} />}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* Quick Link Shopping */}
            <Link to="/" className="block bg-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all group">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-lg font-bold italic">Lanjut Belanja Air Mineral</p>
                        <p className="text-xs text-white/60">Lihat katalog produk kami</p>
                    </div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                        <FaShoppingBag size={18} />
                    </div>
                </div>
            </Link>
        </div>
    );

    const renderOrders = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-lg font-bold text-slate-800 px-2">Riwayat Pesanan</h3>
            <div className="grid gap-4">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center">
                        <p className="text-slate-400 font-bold">Belum ada pesanan.</p>
                        <Link to="/" className="inline-block mt-4 text-blue-600 font-bold text-sm underline">Belanja Sekarang</Link>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-800 text-sm">{order.orderNumber}</span>
                                    {order.paymentStatus === 'pending' && <PaymentTimer createdAt={order.createdAt} />}
                                </div>
                                <div className="flex items-center gap-6 text-right">
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(order.status)}`}>
                                        {order.status.toUpperCase()}
                                    </span>
                                    <p className="font-black text-slate-900 text-sm">Rp {order.total.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="px-6 py-4 flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Item</p>
                                    <div className="space-y-1">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center py-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 bg-blue-50 text-blue-600 text-[10px] flex items-center justify-center rounded-lg font-black border border-blue-100">{item.quantity}x</span>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-700 text-sm">{item.productName}</span>
                                                        {item.variantName && (
                                                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none">Varian: {item.variantName}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-gray-900 italic">Rp {item.subtotal.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:w-1/3 text-xs bg-slate-50 p-4 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Pengiriman</p>
                                    <p className="font-bold text-slate-700">{order.guestInfo?.name}</p>
                                    <p className="text-slate-400 line-clamp-2">{order.guestInfo?.address}</p>
                                </div>
                            </div>
                            {order.paymentStatus === 'pending' && order.status !== 'dibatalkan' && (new Date().getTime() - new Date(order.createdAt).getTime() < 15 * 60 * 1000) && (
                                <div className="px-6 pb-4 flex justify-end">
                                    <button 
                                        onClick={() => {
                                            if (window.snap && typeof window.snap.pay === 'function') {
                                                window.snap.pay(order.midtransToken, {
                                                    onSuccess: () => {
                                                        toast.success('Pembayaran Berhasil!');
                                                        fetchOrders();
                                                    },
                                                    onClose: () => toast.warning('Segera selesaikan pembayaran Anda')
                                                });
                                            } else {
                                                toast.info('Layanan Snap Midtrans belum siap. Silakan muat ulang halaman.');
                                            }
                                        }}
                                        className="bg-blue-600 text-white px-8 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition-all"
                                    >
                                        Bayar Sekarang
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Profil & Alamat</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Nama</label>
                        <input 
                            type="text" 
                            required
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-600 font-bold text-sm" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Email</label>
                        <input 
                            type="email" 
                            required
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-600 font-bold text-sm" 
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">No. WhatsApp</label>
                        <input 
                            type="tel" 
                            required
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-600 font-bold text-sm" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Link Google Maps (Url)</label>
                        <input 
                            type="url" 
                            value={profileData.mapsLink}
                            onChange={(e) => setProfileData({...profileData, mapsLink: e.target.value})}
                            placeholder="https://goo.gl/maps/..."
                            className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-600 font-bold text-sm" 
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Alamat Lengkap</label>
                    <textarea 
                        rows="3"
                        required
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-600 font-bold text-sm" 
                    ></textarea>
                </div>
                <button 
                    type="submit" 
                    disabled={saving}
                    className="bg-slate-900 text-white px-10 py-3 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                    {saving ? 'Menyimpan...' : 'Update Profil'}
                </button>
            </form>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar Compact */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 z-40 hidden lg:flex flex-col p-6">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <FaTint size={18} />
                    </div>
                    <span className="text-lg font-black italic">Amanah <span className="text-blue-600">Hub</span></span>
                </div>

                <nav className="flex-grow space-y-1">
                    {[
                        { id: 'overview', icon: <FaBox />, label: 'Dashboard' },
                        { id: 'orders', icon: <FaHistory />, label: 'Riwayat Pesanan' },
                        { id: 'profile', icon: <FaUser />, label: 'Profil Akun' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[13px] transition-all ${
                                activeTab === item.id 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                            }`}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                    <div className="pt-6 mt-6 border-t border-slate-50">
                        <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[13px] text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all">
                            <FaShoppingBag /> Ke Katalog
                        </Link>
                    </div>
                </nav>

                <button 
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[13px] text-red-400 hover:bg-red-50 transition-all mt-auto"
                >
                    <FaSignOutAlt /> Sign Out
                </button>
            </aside>

            {/* Main Content Compact */}
            <main className="lg:ml-64 p-6 md:p-8 pb-32 lg:pb-8">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3 lg:hidden">
                        <Link to="/" className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400"><FaArrowLeft size={16} /></Link>
                        <div className="flex flex-col -space-y-1">
                             <span className="text-sm font-black italic tracking-tighter">Pd. Amanah</span>
                             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Distributor Portal</span>
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <h2 className="text-2xl font-black text-slate-800 italic">Halo, {user?.name || user?.username}!</h2>
                        <p className="text-slate-400 text-xs font-bold -mt-1 uppercase tracking-widest">Selamat Datang di Workspace Anda</p>
                    </div>

                    <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white shadow-sm">
                        <img src={`https://ui-avatars.com/api/?name=${user?.name || user?.username}&background=2563eb&color=fff`} alt="Profile" />
                    </div>
                </header>

                <div className="max-w-5xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20 animate-pulse text-slate-300 font-bold">Memuat Data...</div>
                    ) : (
                        <>
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'orders' && renderOrders()}
                            {activeTab === 'profile' && renderProfile()}
                        </>
                    )}
                </div>
            </main>

            {/* Mobile Footer Compact - Full Width Dark Mode */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-slate-900 shadow-2xl backdrop-blur-md border-t border-white/10 p-4 flex justify-between items-center z-50">
                 <button onClick={() => setActiveTab('overview')} className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === 'overview' ? 'text-blue-400' : 'text-slate-500'}`}>
                    <FaBox size={18} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
                 </button>
                 <button onClick={() => setActiveTab('orders')} className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === 'orders' ? 'text-blue-400' : 'text-slate-500'}`}>
                    <FaHistory size={18} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Order</span>
                 </button>
                 <button onClick={() => setActiveTab('profile')} className={`flex-1 flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-blue-400' : 'text-slate-500'}`}>
                    <FaUser size={18} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Profil</span>
                 </button>
                 <div className="w-px h-6 bg-white/10 mx-2"></div>
                 <button onClick={logout} className="flex-1 flex flex-col items-center gap-1 text-red-400/80">
                    <FaSignOutAlt size={18} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Out</span>
                 </button>
            </div>
        </div>
    );
};

export default CustomerDashboard;
