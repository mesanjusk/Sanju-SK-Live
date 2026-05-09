import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaWhatsapp, FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import api from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [User_name, setUser_Name] = useState('');
  const [Password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/users/login', { User_name, Password });
      if (data.status === 'notexist') { setError('User not found. Please check your username.'); return; }
      if (data.status === 'invalid')  { setError('Incorrect password. Please try again.'); return; }
      localStorage.setItem('User_name', User_name);
      if (data.token) localStorage.setItem('authToken', data.token);
      navigate('/admin', { state: { id: User_name } });
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-hero px-4 py-12">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#25D366]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#C9A227]/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo card */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#25D366] shadow-lg">
            <FaWhatsapp className="text-3xl text-white" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white">SK Admin Panel</h1>
          <p className="mt-1 text-sm text-white/60">Sign in to manage your store</p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl bg-white/10 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/20">
          <form onSubmit={submit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/70">
                Username
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                <input
                  type="text"
                  value={User_name}
                  onChange={(e) => setUser_Name(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="off"
                  required
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none transition focus:border-[#25D366] focus:bg-white/15 focus:ring-2 focus:ring-[#25D366]/30"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/70">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={Password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="off"
                  required
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-11 text-sm text-white placeholder-white/40 outline-none transition focus:border-[#25D366] focus:bg-white/15 focus:ring-2 focus:ring-[#25D366]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-500/20 px-4 py-2.5 text-xs font-medium text-red-200 ring-1 ring-red-400/30">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#25D366] py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#128C7E] active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
