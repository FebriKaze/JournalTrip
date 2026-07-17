import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ship,
  MapPin, 
  Calendar,
  Clock,
  Timer,
  AlertTriangle,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { leadtimeService, LeadTimeData } from '../services/leadtimeService';

export default function RouteAnalyticsPage({ isTAM = false }: { isTAM?: boolean }) {
  const [activeTab, setActiveTab] = useState<'SUMATERA' | 'NGORO' | 'JBK' | 'TMMIN'>('SUMATERA');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<LeadTimeData[]>([]);
  const monthInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [y, m] = selectedMonth.split('-');
      const start = new Date(Number(y), Number(m) - 1, 1).toISOString().split('T')[0];
      const end = new Date(Number(y), Number(m), 0).toISOString().split('T')[0];
      
      const records = await leadtimeService.getLeadTimes(start, end, activeTab);
      setData(records);
    } catch (error) {
      console.error('Failed to fetch route analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, activeTab]);

  useEffect(() => {
    if (activeTab === 'SUMATERA') {
      loadData();
    } else {
      setData([]);
    }
  }, [loadData, activeTab]);

  // Process data for Sumatera
  const processSumateraDelay = () => {
    // Only looking for records that have both PELABUHAN MERAK and PELABUHAN BAKAUHENI
    const validData = data.filter(d => {
      const tMerak = d.checkpoints?.['PELABUHAN MERAK'];
      const tBakau = d.checkpoints?.['PELABUHAN BAKAUHENI'];
      return tMerak && tBakau;
    });

    const parsed = validData.map(d => {
      let delayHours = 0;
      const tMerakStr = d.checkpoints?.['PELABUHAN MERAK'];
      const tBakauStr = d.checkpoints?.['PELABUHAN BAKAUHENI'];
      
      if (typeof tMerakStr === 'string' && typeof tBakauStr === 'string') {
        const [hM, mM] = tMerakStr.split(':').map(Number);
        const [hB, mB] = tBakauStr.split(':').map(Number);
        
        if (!isNaN(hM) && !isNaN(hB)) {
          let merakTotalMinutes = hM * 60 + (mM || 0);
          let bakauTotalMinutes = hB * 60 + (mB || 0);
          
          // Jika waktu Bakauheni lebih kecil dari Merak, berarti nyeberang hari (lewat tengah malam)
          if (bakauTotalMinutes < merakTotalMinutes) {
            bakauTotalMinutes += 24 * 60;
          }
          
          delayHours = (bakauTotalMinutes - merakTotalMinutes) / 60;
        }
      }
      
      return {
        ...d,
        delayHours: parseFloat(delayHours.toFixed(1)),
        displayLabel: `${d.driver || 'Unknown'} (${new Date(d.tanggal).getDate()} ${new Date(d.tanggal).toLocaleString('id-ID', { month: 'short' })})`
      };
    });

    // Sort chronologically
    return parsed.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  };

  const chartData = activeTab === 'SUMATERA' ? processSumateraDelay() : [];
  const avgDelay = chartData.length > 0 
    ? (chartData.reduce((acc, curr) => acc + curr.delayHours, 0) / chartData.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-white pb-20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                Route Analytics
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black tracking-widest uppercase">Transit</span>
              </h1>
              <p className="text-xs sm:text-sm font-bold text-slate-500 flex items-center gap-2">
                Segment Performance Analysis
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div 
              onClick={() => monthInputRef.current?.showPicker()}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-sm">
                {new Date(selectedMonth).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              ref={monthInputRef}
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['SUMATERA', 'NGORO', 'JBK', 'TMMIN'].map((tab) => {
            if (isTAM && tab === 'TMMIN') return null;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 rounded-2xl text-sm font-black tracking-widest uppercase transition-all whitespace-nowrap
                  ${activeTab === tab 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
              >
                {tab} Route
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'SUMATERA' ? (
              <div className="space-y-6">
                {/* Sumatera Header */}
                <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Ship className="w-40 h-40" />
                  </div>
                  <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-black tracking-widest backdrop-blur-md">FERRY TRANSIT</span>
                      <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-black tracking-widest backdrop-blur-md">MERAK - BAKAUHENI</span>
                    </div>
                    <h2 className="text-3xl font-black mb-2">Analitik Waktu Tunggu Kapal</h2>
                    <p className="text-indigo-100 font-medium">
                      Memantau lamanya waktu armada menunggu di pelabuhan sebelum menyeberang.
                    </p>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                      <Clock className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Trip Tercatat</p>
                      <p className="text-2xl font-black">{chartData.length} <span className="text-sm text-slate-500 font-bold">Ritase</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                      <Timer className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rata-rata Waktu Tunggu</p>
                      <p className="text-2xl font-black">{avgDelay} <span className="text-sm text-slate-500 font-bold">Jam</span></p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tunggu Terlama</p>
                      <p className="text-2xl font-black">
                        {chartData.length > 0 ? Math.max(...chartData.map(d => d.delayHours)) : 0} <span className="text-sm text-slate-500 font-bold">Jam</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-black flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Tren Selisih Menunggu Kapal
                      </h3>
                      <p className="text-xs font-bold text-slate-500">Berdasarkan data {chartData.length} ritase tercatat bulan ini.</p>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="h-96 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : chartData.length > 0 ? (
                    <div className="h-96 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                          <XAxis 
                            dataKey="displayLabel" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} 
                            dy={10}
                            dx={-5}
                            angle={-45}
                            textAnchor="end"
                            interval={0}
                            height={80}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} 
                            dx={-10}
                            domain={[0, 'auto']}
                          />
                          <Tooltip
                            cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
                            formatter={(value: number) => [`${value} Jam`, 'Waktu Tunggu']}
                          />
                          <ReferenceLine y={Number(avgDelay)} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: `AVG: ${avgDelay} Jam`, fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
                          <Bar dataKey="delayHours" radius={[6, 6, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.delayHours > 4 ? '#ef4444' : entry.delayHours > 2 ? '#f59e0b' : '#3b82f6'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-96 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <Ship className="w-12 h-12 mb-4 opacity-50" />
                      <p className="font-bold">Belum ada data tunggu kapal</p>
                      <p className="text-xs">Pastikan kolom 'Menunggu Kapal' diisi di file Excel Anda.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center px-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <MapPin className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-black mb-2">Fitur {activeTab} Sedang Dibangun</h3>
                <p className="text-slate-500 font-medium max-w-md">
                  Analitik untuk rute {activeTab} (seperti titik rawan delay, kemacetan rute) akan segera ditambahkan di versi berikutnya.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
