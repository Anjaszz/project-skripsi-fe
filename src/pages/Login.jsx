import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaTimesCircle } from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    password: ''
  });

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Staff Login | Amanah Hub';
    if (user) {
      if (user.role === 'customer') {
        navigate('/');
      } else if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/kasir');
      }
    }
  }, [user, navigate]);

  const validateForm = () => {
    const errors = {
      username: '',
      password: ''
    };
    let isValid = true;

    if (!username.trim()) {
      errors.username = 'Username tidak boleh kosong';
      isValid = false;
    } else if (username.length < 3) {
      errors.username = 'Username minimal 3 karakter';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password tidak boleh kosong';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        // Navigation will be handled by useEffect
        console.log('Login berhasil, menunggu redirect...');
      } else {
        setError(result.message);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error saat login:', error);
      setError('Terjadi kesalahan saat login');
      setLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (validationErrors.username) {
      setValidationErrors({ ...validationErrors, username: '' });
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors({ ...validationErrors, password: '' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/30 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden p-10 border border-white/20">
          <div className="text-center mb-10">
             <div className="inline-flex items-center gap-3 mb-6 group">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
                    <FaLock size={24} />
                </div>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase leading-none">
                Amanah <span className="text-blue-600">Hub</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3 italic">Management Portal</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl mb-8 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
              <FaTimesCircle className="flex-shrink-0" />
              <span className="text-xs font-black uppercase tracking-tight italic">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                  <FaUser size={14} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className={`w-full pl-14 pr-6 py-4 bg-slate-50 border-0 rounded-2xl outline-none ring-2 ring-transparent transition-all duration-300 focus:ring-blue-600 focus:bg-white font-bold text-sm ${
                    validationErrors.username ? 'ring-red-500 bg-red-50' : ''
                  }`}
                  placeholder="admin.office"
                />
              </div>
              {validationErrors.username && <p className="text-[9px] text-red-500 font-black uppercase tracking-widest ml-1 italic">{validationErrors.username}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Kata Sandi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                  <FaLock size={14} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full pl-14 pr-14 py-4 bg-slate-50 border-0 rounded-2xl outline-none ring-2 ring-transparent transition-all duration-300 focus:ring-blue-600 focus:bg-white font-bold text-sm ${
                    validationErrors.password ? 'ring-red-500 bg-red-50' : ''
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {validationErrors.password && <p className="text-[9px] text-red-500 font-black uppercase tracking-widest ml-1 italic">{validationErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 px-6 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-600 active:scale-95 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 italic flex items-center justify-center gap-3 group mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Mengautentikasi...</span>
                </div>
              ) : (
                <>
                    <span>Masuk ke Dashboard</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] mt-10 italic">
            © 2026 Amanah Lintang Hub — v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
