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
  ChevronRight as ChevronRightIcon,
  TrendingUp,
  Activity,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { fetchDriverProfile } from '../services/dataFetcher';
import { fetchEcoViolations, EcoViolation } from '../services/ecoDataFetcher';
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
  const [ecoViolations, setEcoViolations] = useState<EcoViolation[]>([]);
  const [showEcoModal, setShowEcoModal] = useState(false);
  const [ecoPage, setEcoPage] = useState(1);
  const ecoItemsPerPage = 5;
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadProfile = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    const data = await fetchDriverProfile(id, selectedMonth);
    if (data) {
      setDriver(data.driver);
      setRitases(data.ritases);
      
      // Fetch Eco Violations for this driver
      const driverId = data.driver.id;
      const driverName = data.driver.name;
      
      const ecoData = await fetchEcoViolations({
        driverId: driverId,
        driverName: driverName
      });

      // Helper to match month from "DD-Mon-YY" (e.g. 01-Jan-26) with "YYYY-MM" (e.g. 2026-01)
      const matchesMonth = (dbDate: string, targetMonth: string) => {
        if (!dbDate || !targetMonth) return false;
        // dbDate example: "01-Jan-26"
        // targetMonth example: "2026-04"
        const [year, month] = targetMonth.split('-');
        const monthMap: any = { 
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
          'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        const dbParts = dbDate.split('-');
        if (dbParts.length !== 3) return false;
        const dbMonth = monthMap[dbParts[1]];
        const dbYear = '20' + dbParts[2]; // assuming 20xx
        return dbYear === year && dbMonth === month;
      };

      const driverViolations = ecoData.filter(v => {
        const isThisDriver = v.driver_id === driverId || v.pengemudi?.toLowerCase() === driverName.toLowerCase();
        const isThisMonth = matchesMonth(v.tanggal, selectedMonth);
        return isThisDriver && isThisMonth;
      });
      
      console.log('--- ECO DRIVING DIAGNOSTIC ---');
      console.log('Driver ID:', driverId);
      console.log('Driver Name:', driverName);
      console.log('Selected Month:', selectedMonth);
      console.log('Raw Data Samples:', ecoData.slice(0, 3));
      console.log('Matched for Driver (total):', ecoData.filter(v => v.driver_id === driverId || v.pengemudi?.toLowerCase() === driverName.toLowerCase()).length);
      console.log('Matched for Month (total):', ecoData.filter(v => matchesMonth(v.tanggal, selectedMonth)).length);
      console.log('Final Filtered Result:', driverViolations.length);
      
      setEcoViolations(driverViolations);
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

            <div 
              onClick={() => setShowEcoModal(true)}
              className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl shadow-sm cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all border border-transparent hover:border-orange-200"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Pelanggaran</p>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {ecoViolations.length} 
                <span className="text-sm font-bold text-slate-400 italic ml-2">This Month</span>
              </p>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-black text-orange-600 uppercase tracking-tighter">
                View Details <TrendingUp className="w-3 h-3" />
              </div>
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

              {/* Eco Driving Summary Card */}
              <div className="pt-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  Eco Driving Summary
                </h3>
                <div 
                  onClick={() => setShowEcoModal(true)}
                  className="bg-linear-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Activity className="w-32 h-32 text-white" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Safety Performance</p>
                    <h4 className="text-2xl font-black text-white mb-4">Analysis Report</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Total Incidents</p>
                        <p className="text-xl font-black text-white">{ecoViolations.length}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-right">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Trend Status</p>
                        <p className={`text-xs font-black ${ecoViolations.length > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {ecoViolations.length > 5 ? 'High Risk' : 'Healthy'}
                        </p>
                      </div>
                    </div>
                    <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all border border-white/5">
                      Open Detailed Analysis
                    </button>
                  </div>
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
      {/* ── ECO DRIVING DETAIL MODAL ── */}
      <AnimatePresence>
        {showEcoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEcoModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-y-auto border border-slate-200/60 dark:border-slate-800"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[24px] bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                      <Activity className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">Eco Driving Analysis</h3>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Detail Pelanggaran & Tren Mengemudi</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowEcoModal(false)}
                    className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Analysis Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                  <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Violation Trend</h4>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-sky-500" />
                          <span className="text-[9px] font-black text-slate-500 uppercase">Pelanggaran</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={(() => {
                          const daily = ecoViolations.reduce((acc: any, v) => {
                            const day = new Date(v.tanggal).getDate();
                            acc[day] = (acc[day] || 0) + 1;
                            return acc;
                          }, {});
                          // Generate array for all days in month
                          return Array.from({ length: 31 }, (_, i) => ({
                            day: i + 1,
                            count: daily[i + 1] || 0
                          }));
                        })()}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.1} />
                            <XAxis 
                              dataKey="day" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                              interval={4}
                              tickFormatter={(val) => val}
                            />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                            allowDecimals={false}
                          />
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 p-3 rounded-2xl shadow-2xl border border-slate-800">
                                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{label} April 2026</p>
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-sky-500 rounded-full" />
                                      <p className="text-sm font-black text-white">{payload[0].value} <span className="text-[10px] text-slate-400">Pelanggaran</span></p>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            name="Jumlah Pelanggaran"
                            type="monotone" 
                            dataKey="count" 
                            stroke="#0ea5e9" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorCount)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 bg-sky-50 dark:bg-sky-950/20 rounded-[24px] border border-sky-100 dark:border-sky-900/30">
                      <p className="text-[10px] font-black text-sky-600 uppercase mb-1">Most Frequent</p>
                      <h5 className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {(() => {
                          const counts: any = {};
                          ecoViolations.forEach(v => counts[v.jenis_peringatan] = (counts[v.jenis_peringatan] || 0) + 1);
                          return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'None';
                        })()}
                      </h5>
                    </div>
                    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Violation Breakdown</p>
                      <div className="space-y-3">
                        {['Akselerasi', 'Perlambatan', 'Kecepatan', 'Tikungan'].map(cat => {
                          const count = ecoViolations.filter(v => v.jenis_peringatan.includes(cat)).length;
                          const pct = ecoViolations.length ? (count / ecoViolations.length) * 100 : 0;
                          return (
                            <div key={cat}>
                              <div className="flex justify-between text-[9px] font-black uppercase mb-1">
                                <span className="text-slate-500">{cat}</span>
                                <span className="text-slate-900 dark:text-white">{count}</span>
                              </div>
                              <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* History Table */}
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Historical Events</h4>
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 mb-6">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800">
                        <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                        <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest">Jenis Pelanggaran</th>
                        <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest">Lokasi</th>
                        <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-right">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {ecoViolations.slice((ecoPage - 1) * ecoItemsPerPage, ecoPage * ecoItemsPerPage).map((v, i) => (
                        <tr key={i} className="hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-black text-slate-900 dark:text-white">
                              {new Date(v.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{v.waktu}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                              v.jenis_peringatan.toLowerCase().includes('akselerasi') ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                              v.jenis_peringatan.toLowerCase().includes('perlambatan') ? 'bg-red-100 text-red-700 border border-red-200' :
                              v.jenis_peringatan.toLowerCase().includes('kecepatan') ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                v.jenis_peringatan.toLowerCase().includes('akselerasi') ? 'bg-orange-500' :
                                v.jenis_peringatan.toLowerCase().includes('perlambatan') ? 'bg-red-500' :
                                v.jenis_peringatan.toLowerCase().includes('kecepatan') ? 'bg-amber-500' :
                                'bg-blue-500'
                              }`} />
                              {v.jenis_peringatan}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-500 dark:text-slate-400 line-clamp-1 text-[10px]">{v.lokasi}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-black text-slate-900 dark:text-white">{v.plat_nomor}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Eco Pagination */}
                {ecoViolations.length > ecoItemsPerPage && (
                  <div className="flex justify-center items-center gap-2 mb-8">
                    <button 
                      disabled={ecoPage === 1}
                      onClick={() => setEcoPage(p => p - 1)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl disabled:opacity-30 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, Math.ceil(ecoViolations.length / ecoItemsPerPage)) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setEcoPage(pageNum)}
                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                              ecoPage === pageNum 
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-400/20' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button 
                      disabled={ecoPage >= Math.ceil(ecoViolations.length / ecoItemsPerPage)}
                      onClick={() => setEcoPage(p => p + 1)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl disabled:opacity-30 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-all"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center sticky bottom-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Data updated monthly from telematics logs.</p>
                <button 
                  onClick={() => setShowEcoModal(false)}
                  className="px-8 py-3 bg-red-600 rounded-2xl text-xs font-black text-white shadow-xl shadow-red-500/30 hover:bg-red-700 transition-all uppercase tracking-widest"
                >
                  Close Analysis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
