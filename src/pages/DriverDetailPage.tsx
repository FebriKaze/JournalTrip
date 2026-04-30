import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Shield, 
  MapPin, 
  Truck, 
  User, 
  Calendar,
  AlertTriangle,
  BarChart3,
  Search,
  ChevronDown,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { fetchDriverProfile } from '../services/dataFetcher';
import { Driver, Ritase } from '../types';
import RitaseItem from '../components/dashboard/RitaseItem';

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const monthInputRef = useRef<HTMLInputElement>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [driver, setDriver] = useState<Driver | null>(location.state?.driver || null);
  const [ritases, setRitases] = useState<(Ritase & { tanggal: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Sweet spot between 5 and 10

  const loadProfile = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    const data = await fetchDriverProfile(id, selectedMonth);
    if (data) {
      setDriver(data.driver);
      setRitases(data.ritases);
    }
    setIsLoading(false);
  }, [id, selectedMonth]);

  useEffect(() => {
    loadProfile();
    setCurrentPage(1); // Reset page on month change
  }, [loadProfile]);

  const toggleRitase = (ritaseId: string | number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(ritaseId)) {
        next.delete(ritaseId);
      } else {
        next.add(ritaseId);
      }
      return next;
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(ritases.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ritases.slice(indexOfFirstItem, indexOfLastItem);

  // Group current items by date
  const groupedRitases = currentItems.reduce((acc: Record<string, (Ritase & { tanggal: string })[]>, curr) => {
    if (!acc[curr.tanggal]) acc[curr.tanggal] = [];
    acc[curr.tanggal].push(curr);
    return acc;
  }, {} as Record<string, (Ritase & { tanggal: string })[]>);

  if (isLoading && !driver) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Back button skeleton */}
        <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        
        <div className="bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl pb-12">
          {/* Hero background skeleton */}
          <div className="h-40 md:h-64 bg-slate-100 dark:bg-slate-800" />
          
          <div className="px-6 md:px-12 -mt-16 md:-mt-24 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-10">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[40px] bg-slate-200 dark:bg-slate-800 ring-8 ring-white dark:ring-slate-900" />
              <div className="flex-1 pb-4">
                <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl mb-3" />
                <div className="flex gap-2">
                  <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
              ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
              <div className="lg:col-span-2 h-96 bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!driver) return <div>Driver not found</div>;

  return (
    <div className="space-y-6">
      {/* ── BACK BUTTON & NAVIGATION ── */}
      <button 
        onClick={() => navigate('/drivers')}
        className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-bold text-sm group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Data
      </button>

      {/* ── PROFILE HERO ── */}
      <div className="relative bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl">
        {/* Header Background */}
        <div className="h-40 md:h-64 bg-linear-to-br from-red-600 via-red-700 to-red-900 dark:bg-linear-to-br dark:from-slate-900 dark:via-slate-950 dark:to-black relative overflow-hidden">
          <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(at_top_right,rgba(220,38,38,0.2)_0%,transparent_50%)]" />
          <div className="absolute inset-0 dark:hidden bg-[radial-gradient(at_top_left,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
          
          {/* Animated Elements */}
          <motion.div
            animate={{ x: [-50, 400, -50], y: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/3 left-0 text-white/20 text-4xl"
          >
            🚚
          </motion.div>
          
          <div className="absolute inset-0 bg-linear-to-t from-black/30 dark:from-black/50 to-transparent" />
        </div>

        {/* Profile Content */}
        <div className="px-6 md:px-12 pb-10 -mt-16 md:-mt-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-10">
            {driver.avatar ? (
              <img src={driver.avatar} alt={driver.name} className="w-32 h-32 md:w-48 md:h-48 rounded-[40px] object-cover ring-8 ring-white dark:ring-slate-900 shadow-2xl" />
            ) : (
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[40px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center ring-8 ring-white dark:ring-slate-900 shadow-xl">
                <User className="w-16 h-16 text-slate-300" />
              </div>
            )}
            <div className="pb-4 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">{driver.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">DRIVER AKTIF</span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm">BASE POOL A</span>
              </div>
            </div>
          </div>

          {/* ── SUMMARY STATS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Ritase</p>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{driver.totalRitaseMonth || 0} <span className="text-sm font-bold text-slate-400 italic">This Month</span></p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Pelanggaran</p>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{driver.totalViolations || 0} <span className="text-sm font-bold text-slate-400 italic">Total</span></p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status SIM</p>
              </div>
              <p className={`text-2xl font-black ${driver.simStatus === 'Valid' ? 'text-green-600' : 'text-red-500'}`}>{driver.simStatus?.toUpperCase()}</p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Unit Utama</p>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{driver.noPolisi || '---'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Personal Data */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full" />
                Personal Registry
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-3xl p-6 shadow-inner space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">NIK</p>
                  <p className="font-bold text-slate-900 dark:text-white">{driver.nik || '---'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Alamat</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{driver.alamat || '---'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">SIM Expiry</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {driver.simExpiry ? new Date(driver.simExpiry).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '---'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Journal Trip History */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full" />
                  Journal Trip History
                </h3>
                
                {/* Month Picker Solution */}
                <div 
                  onClick={() => monthInputRef.current?.showPicker()}
                  className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  <div className="px-3 py-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <input 
                      ref={monthInputRef}
                      type="month" 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-transparent border-none text-xs font-black text-slate-900 dark:text-white focus:ring-0 cursor-pointer outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Ritase History List with Min Height for Stability */}
              <div className="space-y-8 min-h-[850px]">
                {Object.keys(groupedRitases).length > 0 ? (
                  (Object.entries(groupedRitases) as [string, (Ritase & { tanggal: string })[]][]).map(([date, trips]) => (
                    <div key={date} className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {trips.map((ritase) => (
                          <RitaseItem 
                            key={ritase.id} 
                            ritase={ritase} 
                            isExpanded={expandedIds.has(ritase.id)}
                            onToggle={() => toggleRitase(ritase.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/20 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 font-bold">No trips recorded for this month</p>
                  </div>
                )}
              </div>

              {/* ── PAGINATION ── */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 pt-8">
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 min-w-[320px] justify-between px-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all outline-none"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    
                    <div className="flex items-center justify-center flex-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (
                          pageNum === 1 || 
                          pageNum === totalPages || 
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-xl text-xs font-black transition-all flex items-center justify-center outline-none ${
                                currentPage === pageNum 
                                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' 
                                  : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return <span key={pageNum} className="px-1 text-slate-300 dark:text-slate-600 font-black">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all outline-none"
                    >
                      <ChevronRightIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                  
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, ritases.length)} of {ritases.length} Trips
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
