import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowLeft, FaTint, FaChevronRight, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

const CustomerAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        name: '',
        phone: '',
        address: '',
        mapsLink: ''
    });
    const [loading, setLoading] = useState(false);
    const { login, register, user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        document.title = 'Login / Daftar Pelanggan | Amanah Hub';
        if (user) {
            navigate('/customer-dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                const res = await login(formData.username || formData.email, formData.password);
                if (res.success) {
                    toast.success('Selamat Datang Kembali!');
                    navigate('/');
                } else {
                    toast.error(res.message);
                }
            } else {
                const res = await register({
                    ...formData,
                    username: formData.email,
                    role: 'customer'
                });
                if (res.success) {
                    toast.success('Pendaftaran Berhasil! Silakan Login.');
                    setIsLogin(true);
                } else {
                    toast.error(res.message);
                }
            }
        } catch (error) {
            toast.error('Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
            {/* Soft Background Accents */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] -z-10"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/20 rounded-full blur-[120px] -z-10"></div>

            <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
                {/* Visual Side (LHS on Desktop) */}
                <div className="lg:w-5/12 bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-white/5 rotate-12 -translate-y-8 translate-x-8">
                        <FaTint size={180} />
                    </div>
                    
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <FaTint size={18} />
                        </div>
                        <span className="text-lg font-black italic tracking-tighter">Pd. Amanah Lintang</span>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <h2 className="text-3xl font-black italic leading-[1.1] tracking-tighter">
                            {isLogin ? 'Solusi Distribusi Air Mineral Terpercaya.' : 'Bergabunglah Menjadi Mitra Reseller Kami.'}
                        </h2>
                        <ul className="space-y-3">
                            {[
                                "Harga Grosir Terbaik",
                                "Update Stok Real-time",
                                "Pengiriman Terjadwal"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/60">
                                    <FaCheckCircle className="text-blue-500" /> {text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative z-10 pt-8 border-t border-white/10">
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">Terpercaya Sejak 2015</p>
                    </div>
                </div>

                {/* Form Side (RHS on Desktop) */}
                <div className="flex-1 px-8 md:px-12 py-8 md:py-10 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <button 
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all font-black text-[9px] uppercase tracking-widest group"
                        >
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Katalog
                        </button>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase text-blue-600 tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full border border-blue-100 italic">Portal v2.0</span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-xl font-black text-slate-800 tracking-tighter italic">
                            {isLogin ? 'Masuk Akun' : 'Daftar Mitra'}
                        </h3>
                        <p className="text-slate-400 text-[10px] font-medium mt-0.5 italic">
                            {isLogin 
                                ? 'Masukkan kredensial Anda untuk mengakses panel.' 
                                : 'Lengkapi data untuk memudahkan pemesanan.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {!isLogin && (
                                <div className="col-span-full md:col-span-1 space-y-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nama Lengkap</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 size-3" />
                                        <input 
                                            type="text" 
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-slate-50 border-0 rounded-xl pl-12 pr-6 py-3 outline-none ring-1 ring-slate-100 transition-all focus:ring-blue-600 focus:bg-white font-bold text-[13px]"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className={`space-y-1 ${isLogin ? 'col-span-full' : 'md:col-span-1'}`}>
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Username / Email</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 size-3" />
                                    <input 
                                        type="text" 
                                        required
                                        value={isLogin ? formData.username : formData.email}
                                        onChange={(e) => setFormData({...formData, [isLogin ? 'username' : 'email']: e.target.value})}
                                        className="w-full bg-slate-50 border-0 rounded-xl pl-12 pr-6 py-3 outline-none ring-1 ring-slate-100 transition-all focus:ring-blue-600 focus:bg-white font-bold text-[13px] tracking-tight"
                                        placeholder="me@example.com"
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="space-y-1 md:col-span-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">WhatsApp</label>
                                    <div className="relative">
                                        <FaPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 size-3" />
                                        <input 
                                            type="tel" 
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full bg-slate-50 border-0 rounded-xl pl-12 pr-6 py-3 outline-none ring-1 ring-slate-100 transition-all focus:ring-blue-600 focus:bg-white font-bold text-[13px] tracking-widest"
                                            placeholder="0812..."
                                        />
                                    </div>
                                </div>
                            )}

                            <div className={`space-y-1 ${isLogin ? 'col-span-full' : 'md:col-span-1'}`}>
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Kata Sandi</label>
                                <div className="relative">
                                    <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 size-3" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full bg-slate-50 border-0 rounded-xl pl-12 pr-12 py-3 outline-none ring-1 ring-slate-100 transition-all focus:ring-blue-600 focus:bg-white font-bold text-[13px]"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                    </button>
                                </div>
                            </div>

                            {!isLogin && (
                                <>
                                    <div className="space-y-1 col-span-full">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Alamat Pengiriman</label>
                                        <div className="relative">
                                            <FaMapMarkerAlt className="absolute left-5 top-4 text-slate-300 size-3" />
                                            <textarea 
                                                required
                                                rows="1"
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                className="w-full bg-slate-50 border-0 rounded-xl pl-12 pr-6 py-3 outline-none ring-1 ring-slate-100 transition-all focus:ring-blue-600 focus:bg-white font-bold text-[13px] min-h-[70px] resize-none"
                                                placeholder="Jl. Raya No. 123..."
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="space-y-1 col-span-full">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Link Google Maps (Opsional)</label>
                                        <div className="relative">
                                            <FaMapMarkerAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 size-3" />
                                            <input 
                                                type="url" 
                                                value={formData.mapsLink}
                                                onChange={(e) => setFormData({...formData, mapsLink: e.target.value})}
                                                className="w-full bg-slate-50 border-0 rounded-xl pl-12 pr-6 py-3 outline-none ring-1 ring-slate-100 transition-all focus:ring-blue-600 focus:bg-white font-bold text-[13px]"
                                                placeholder="https://goo.gl/maps/..."
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pt-1">
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-slate-100 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 italic flex items-center justify-center gap-3 group"
                            >
                                {loading ? 'Memproses...' : (
                                    <>
                                        {isLogin ? 'Masuk' : 'Daftar Mitra'} <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {isLogin ? "Belum memiliki akun?" : "Sudah terdaftar?"}
                            <button 
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    window.scrollTo(0,0);
                                }}
                                className="text-blue-600 font-black ml-2 hover:underline italic"
                            >
                                {isLogin ? 'Daftar Disini' : 'Login Sekarang'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] italic hidden md:block">
                © 2024 Pd. Amanah Lintang Distribution Hub
            </p>
        </div>
    );
};

export default CustomerAuth;
