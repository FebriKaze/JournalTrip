import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Logo from '../image/Logo.png';
import HeroImg from '../image/20945966.webp';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Navigate to dashboard on success
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Gagal login, periksa kembali email & password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* LEFT COLUMN - FORM */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-8 bg-white relative z-10 shadow-2xl">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-16">
            <img src={Logo} alt="K Line" className="h-10 object-contain" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Email</label>
              <div className="relative">
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@kline.com"
                  required
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 pb-4">
              <input type="checkbox" id="remember" className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="remember" className="text-xs font-bold text-slate-700 cursor-pointer">
                Remember me
                <span className="block text-[10px] text-slate-400 font-medium mt-0.5">Save my login details for next time.</span>
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-16 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              &copy; 2026 PT. K Line Mobaru Diamond Indonesia
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - IMAGE (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-slate-50/50 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-50 to-transparent rounded-full opacity-50 -translate-y-1/2 translate-x-1/3" />
        
        <div className="text-center z-10 mb-16 mt-8">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-snug">
            Securely Manage And Verify <br />
            Fleet Readiness
          </h1>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight mt-2 flex items-center justify-center gap-3">
            With <img src={Logo} alt="K Line" className="h-9 object-contain inline-block" /><span className="text-blue-500">K Line !</span>
          </h2>
        </div>
        
        <img 
          src={HeroImg} 
          alt="Illustration" 
          className="w-full max-w-[500px] object-contain z-10 drop-shadow-2xl mix-blend-multiply"
        />
      </div>
    </div>
  );
}
