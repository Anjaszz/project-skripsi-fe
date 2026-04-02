import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes, FaSpinner, FaBoxOpen, FaUser, FaPhoneAlt, FaMapMarkerAlt, FaCalendar, FaWhatsapp } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

const Pesanan = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pesanan masuk');
    const toast = useToast();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const statuses = [
        { id: 'pesanan masuk', label: 'Pesanan Masuk' },
        { id: 'di proses', label: 'Di Proses' },
        { id: 'selesai', label: 'Selesai' },
        { id: 'dibatalkan', label: 'Dibatalkan' }
    ];

    useEffect(() => {
        document.title = 'Manajemen Pesanan | Amanah Hub';
        fetchOrders(true); // First load with spinner

        // Near real-time polling every 10 seconds
        const interval = setInterval(() => {
            fetchOrders(false); // Silent update
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleWhatsAppChat = (order) => {
        const phone = order.guestInfo?.phone;
        if (!phone) {
            toast.error('Nomor telepon tidak tersedia');
            return;
        }

        // Format phone number (remove non-digits, ensure starts with 62)
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '62' + formattedPhone.slice(1);
        } else if (!formattedPhone.startsWith('62')) {
            formattedPhone = '62' + formattedPhone;
        }

        const itemsList = order.items.map(item => `- ${item.productName} (${item.quantity}x)`).join('%0A');
        const message = `Halo Bapak/Ibu *${order.guestInfo?.name}*,%0A%0AKami dari *Pd. Amanah Lintang* ingin menginformasikan bahwa pesanan Anda dengan nomor *${order.orderNumber}* telah kami terima dan sedang dalam *proses pengiriman*.%0A%0A*Detail Pesanan:*%0A${itemsList}%0A%0A*Total Pembayaran:* Rp ${order.total.toLocaleString()}%0A%0AMohon ditunggu ya, terima kasih! 🙏`;

        window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    };

    const fetchOrders = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setOrders(res.data.data);
        } catch (error) {
            console.error(error);
            // Don't show toast on polling error to avoid spamming the user
            if (showLoading) toast.error('Gagal mengambil data pesanan');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedOrderIdForReject, setSelectedOrderIdForReject] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const updateStatus = async (id, status) => {
        if (status === 'dibatalkan') {
            setSelectedOrderIdForReject(id);
            setRejectReason('');
            setIsRejectModalOpen(true);
            return;
        }

        try {
            await axios.put(`${API_URL}/orders/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success(`Pesanan ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error('Gagal mengubah status pesanan');
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Alasan penolakan harus diisi!');
            return;
        }

        try {
            await axios.put(`${API_URL}/orders/${selectedOrderIdForReject}/status`, { 
                status: 'dibatalkan', 
                cancelReason: rejectReason 
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Pesanan telah ditolak');
            setIsRejectModalOpen(false);
            fetchOrders();
        } catch (error) {
            toast.error('Gagal menolak pesanan');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pesanan masuk': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'di proses': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'selesai': return 'bg-green-100 text-green-700 border-green-200';
            case 'dibatalkan': return 'bg-red-100 text-red-600 border-red-200';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const isOrderValidForProcessing = (order) => {
        if (order.status !== 'pesanan masuk') return true; // Other statuses are already filtered
        return order.paymentStatus === 'success' || order.paymentMethod === 'cod';
    };

    const filteredOrders = orders.filter(order => order.status === activeTab && isOrderValidForProcessing(order));

    if (loading) return <div className="flex justify-center items-center h-full"><FaSpinner className="animate-spin text-3xl text-blue-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center bg-white p-6 lg:p-8 rounded-[32px] shadow-sm border gap-6">
                <div>
                   <h1 className="text-2xl font-black text-gray-800 tracking-tight italic">Manajemen Pesanan</h1>
                   <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Pantau & Kelola Masuknya Pesanan Pelanggan</p>
                </div>
                
                {/* Status Tabs */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 rounded-2xl">
                    {statuses.map(status => {
                        const count = orders.filter(o => o.status === status.id && isOrderValidForProcessing(o)).length;
                        return (
                            <button
                                key={status.id}
                                onClick={() => setActiveTab(status.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                                    activeTab === status.id 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                }`}
                            >
                                {status.label}
                                {count > 0 && <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === status.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>{count}</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.length === 0 ? (
                    <div className="col-span-full py-24 text-center bg-white rounded-[32px] border-2 border-dashed border-gray-100 shadow-sm">
                        <FaBoxOpen className="mx-auto text-5xl text-gray-200 mb-6" />
                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">Tidak ada pesanan valid dengan status "{activeTab}"</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-[24px] overflow-hidden shadow-sm border hover:shadow-lg transition-all flex flex-col group">
                            <div className="p-4 border-b bg-gray-50 flex justify-between items-start gap-4">
                                <div className="space-y-2">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full border italic ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <p className="text-sm font-black text-gray-800 uppercase tracking-tighter italic">{order.orderNumber}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest italic ${order.paymentMethod === 'cod' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                        {order.paymentMethod === 'cod' ? 'Metode: COD' : 'Metode: Online'}
                                    </div>
                                    <span className={`font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-widest ${order.paymentStatus === 'success' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {order.paymentMethod === 'cod' ? 'Bayar di Tempat' : (order.paymentStatus === 'success' ? 'Lunas (Midtrans)' : 'Menunggu Bayar')}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-grow space-y-5">
                                {/* Customer Info */}
                                <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 font-black flex items-center gap-2 tracking-widest uppercase"><FaUser /> Pelanggan</p>
                                        <p className="font-black text-gray-800 line-clamp-1">{order.guestInfo?.name || 'Customer'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 font-black flex items-center gap-2 tracking-widest uppercase"><FaPhoneAlt /> Hubungi</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-gray-800">{order.guestInfo?.phone || '-'}</p>
                                            {order.guestInfo?.phone && (
                                                <button 
                                                    onClick={() => handleWhatsAppChat(order)}
                                                    className="bg-emerald-500 text-white p-1.5 rounded-lg hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-100"
                                                    title="Chat WhatsApp"
                                                >
                                                    <FaWhatsapp size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-1 pt-2 border-t border-gray-100 mt-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] text-gray-400 font-black flex items-center gap-2 tracking-widest uppercase"><FaMapMarkerAlt /> Alamat Kirim</p>
                                            {order.guestInfo?.mapsLink && (
                                                <a 
                                                    href={order.guestInfo.mapsLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-600 hover:text-white transition-all italic uppercase tracking-tighter"
                                                >
                                                    <FaMapMarkerAlt size={10} /> Buka Maps
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-gray-600 leading-relaxed">{order.guestInfo?.address || '-'}</p>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Item Belanja</p>
                                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
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
                            </div>

                            <div className="p-5 bg-gray-50 border-t flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Harga</p>
                                    <p className="text-2xl font-black text-blue-700 italic tracking-tighter">Rp {order.total.toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    {order.status === 'pesanan masuk' && (
                                        <>
                                            <button 
                                                onClick={() => updateStatus(order._id, 'di proses')}
                                                className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                                                title="Terima Pesanan"
                                            >
                                                <FaCheck />
                                            </button>
                                            <button 
                                                onClick={() => updateStatus(order._id, 'dibatalkan')}
                                                className="bg-red-500 text-white p-3 rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all hover:scale-105"
                                                title="Tolak Pesanan"
                                            >
                                                <FaTimes />
                                            </button>
                                        </>
                                    )}
                                    {order.status === 'di proses' && (
                                        <button 
                                            onClick={() => updateStatus(order._id, 'selesai')}
                                            className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all hover:scale-105"
                                        >
                                            Selesaikan <FaCheck className="inline ml-1" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Custom Reject Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsRejectModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center text-2xl mx-auto shadow-lg shadow-red-100">
                                    <FaTimes />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter mt-4">Tolak Pesanan</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Berikan alasan penolakan untuk pelanggan.</p>
                            </div>

                            <div className="space-y-4">
                                <textarea 
                                    className="w-full h-32 bg-slate-50 border-0 rounded-[1.5rem] p-6 outline-none ring-2 ring-transparent focus:ring-red-500 focus:bg-white transition-all font-bold text-sm italic placeholder:text-slate-300"
                                    placeholder="Contoh: Stok barang kosong, Alamat di luar jangkauan..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => setIsRejectModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all italic"
                                >
                                    Batalkan
                                </button>
                                <button 
                                    onClick={handleConfirmReject}
                                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 shadow-xl shadow-red-200 transition-all italic"
                                >
                                    Tolak Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pesanan;
