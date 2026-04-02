import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaUserLock, FaToggleOn, FaToggleOff, FaArrowLeft, FaSave } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminPaymentSettings = () => {
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Pengaturan Pembayaran | Amanah Hub';
        fetchMethods();
    }, []);

    const fetchMethods = async () => {
        try {
            const res = await axios.get(`${API_URL}/payment-methods`);
            if (res.data.data.length === 0) {
                // Auto init if empty
                await axios.post(`${API_URL}/payment-methods/init`, {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchMethods();
                return;
            }
            setMethods(res.data.data);
        } catch (error) {
            toast.error('Gagal memuat pengaturan pembayaran');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id, field, value) => {
        try {
            const method = methods.find(m => m._id === id);
            const updatedData = { ...method, [field]: value };
            
            const res = await axios.put(`${API_URL}/payment-methods/${id}`, updatedData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.data.success) {
                setMethods(methods.map(m => m._id === id ? res.data.data : m));
                toast.success('Pengaturan diperbarui');
            }
        } catch (error) {
            toast.error('Gagal memperbarui pengaturan');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors mb-4">
                            <FaArrowLeft /> Kembali
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Pengaturan Pembayaran</h1>
                        <p className="text-slate-400 text-sm font-medium italic">Kelola metode pembayaran yang tersedia untuk pelanggan.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center animate-pulse text-slate-300 font-black italic uppercase tracking-widest">Memuat Pengaturan...</div>
                ) : (
                    <div className="grid gap-6">
                        {methods.map((method) => (
                            <div key={method._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl shadow-lg ${
                                            method.name === 'midtrans' ? 'bg-blue-50 text-blue-600 shadow-blue-100' : 'bg-emerald-50 text-emerald-600 shadow-emerald-100'
                                        }`}>
                                            {method.name === 'midtrans' ? <FaCreditCard /> : <FaMoneyBillWave />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">{method.displayName}</h3>
                                            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest italic">
                                                {method.name === 'midtrans' ? 'Otomatis via Midtrans (QRIS, VA, Kartu)' : 'Bayar manual saat barang sampai'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 md:gap-10 border-t md:border-t-0 border-slate-50 pt-6 md:pt-0 w-full md:w-auto">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleToggle(method._id, 'isActive', !method.isActive)}
                                                className={`text-3xl transition-colors ${method.isActive ? 'text-blue-600' : 'text-slate-200'}`}
                                            >
                                                {method.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                            </button>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Status Aktif</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleToggle(method._id, 'isRestrictedToLoggedIn', !method.isRestrictedToLoggedIn)}
                                                className={`text-3xl transition-colors ${method.isRestrictedToLoggedIn ? 'text-amber-500' : 'text-slate-200'}`}
                                            >
                                                {method.isRestrictedToLoggedIn ? <FaToggleOn /> : <FaToggleOff />}
                                            </button>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">Khusus User</span>
                                                <span className="text-[8px] text-slate-300 font-bold uppercase italic mt-1">Harus Login</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="p-8 bg-blue-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <FaShieldAlt className="text-blue-300 text-xl" />
                        </div>
                        <div>
                            <p className="font-black italic text-lg leading-none">Sistem Pembayaran Terproteksi</p>
                            <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1 italic">Semua perubahan diterapkan secara real-time</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPaymentSettings;
