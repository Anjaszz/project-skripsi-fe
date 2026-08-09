import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

import Pagination from '../components/Pagination';

const DaftarPelanggan = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [displayLimit, setDisplayLimit] = useState(15);
    const toast = useToast();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await authAPI.getCustomers();
            setCustomers(res.data.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Gagal mengambil daftar pelanggan');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c => 
        (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.phone || '').includes(searchTerm)
    );

    const paginatedCustomers = filteredCustomers.slice(0, displayLimit);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Daftar Akun Pelanggan</h1>
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
                    Total: {customers.length} Pelanggan
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative mb-6">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Cari nama, email, atau nomor telepon..."
                        className="w-full pl-12 pr-6 py-3 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setDisplayLimit(15);
                        }}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                <th className="py-4 px-4">Nama & Akun</th>
                                <th className="py-4 px-4">Kontak</th>
                                <th className="py-4 px-4">Alamat</th>
                                <th className="py-4 px-4">Bergabung</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-5 px-4"><div className="h-10 bg-slate-200 rounded-xl w-3/4"></div></td>
                                        <td className="py-5 px-4"><div className="h-8 bg-slate-150 rounded-lg w-1/2"></div></td>
                                        <td className="py-5 px-4"><div className="h-8 bg-slate-200 rounded-lg w-2/3"></div></td>
                                        <td className="py-5 px-4"><div className="h-6 bg-slate-150 rounded-lg w-1/3"></div></td>
                                    </tr>
                                ))
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-400 font-bold italic text-sm">
                                        Tidak ada pelanggan ditemukan
                                    </td>
                                </tr>
                            ) : (
                                paginatedCustomers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">
                                                    {(customer.name || customer.username).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 leading-tight">{customer.name || 'No Name'}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-1">@{customer.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                                    <FaPhone size={10} className="text-blue-400" /> {customer.phone || '-'}
                                                </p>
                                                <p className="text-xs font-medium text-slate-400 flex items-center gap-2">
                                                    <FaEnvelope size={10} className="text-slate-300" /> {customer.email || '-'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="max-w-[200px]">
                                                <p className="text-xs font-bold text-slate-600 line-clamp-2 leading-relaxed">
                                                    <FaMapMarkerAlt size={10} className="inline mr-2 text-blue-400" />
                                                    {customer.address || 'Alamat Belum Diisi'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4 text-xs font-bold text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <FaCalendarAlt size={10} className="text-slate-300" />
                                                {new Date(customer.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    displayLimit={displayLimit}
                    totalItems={filteredCustomers.length}
                    onLoadMore={() => setDisplayLimit(prev => prev + 15)}
                />
            </div>
        </div>
    );
};

export default DaftarPelanggan;
