import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Truck,
  CheckCircle2,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Timer,
  LayoutDashboard,
  X,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend
} from 'recharts';
import { leadtimeService, LeadTimeData } from '../services/leadtimeService';

const BLUE_SHADES = {
  navy: '#1e3a8a',
  medium: '#3b82f6',
  light: '#60a5fa',
  young: '#93c5fd',
  slate: '#f8fafc',
  emerald: '#10b981',
  red: '#ef4444'
};

const ITEMS_PER_PAGE = 15;

export default function LeadTimePage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [area, setArea] = useState('ALL');
  const [data, setData] = useState<LeadTimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Cross-filtering states
  const [activeFilter, setActiveFilter] = useState<{stage: string, status: string} | null>(null);
  const [selectedReason, setSelectedReason] = useState<{title: string, reason: string, count: number} | null>(null);

  const areas = ['ALL', 'JBK', 'NGORO', 'TMMIN', 'SUMATERA'];

  useEffect(() => {
    loadData();
  }, [startDate, endDate, area]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await leadtimeService.getLeadTimes(startDate, endDate, area);
      setData(result);
    } catch (error) {
      console.error('Failed to fetch leadtime data:', error);
    }
    setIsLoading(false);
  };

  const getRowStatus = (item: LeadTimeData, stage: string) => {
    const info = item.status_info || {};
    const findInKeys = (keywords: string[]) => {
      for (const key in info) {
        if (keywords.some(k => key.toLowerCase().includes(k))) {
          const val = info[key]?.toString().toLowerCase() || '';
          if (val.includes('ontime') || val.includes('on time') || val.includes('ok')) return 'OnTime';
          if (val.includes('delay')) return 'Delay';
          if (val.includes('advance')) return 'Advance';
        }
      }
      return null;
    };

    if (stage === 'outpool') return findInKeys(['keluar', 'outpool', 'abnormalty']) || 'OnTime';
    if (stage === 'inpdc') return findInKeys(['kedatangan', 'inpdc', 'in pdc']) || 'Unknown';
    if (stage === 'delivery') return findInKeys(['delivery', 'pengiriman']) || 'Unknown';
    return 'Unknown';
  };

  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const getStageStats = (stage: string, reasonKeywords: string[]) => {
      const counts: Record<string, number> = { 'OnTime': 0, 'Delay': 0, 'Advance': 0 };
      const reasons: Record<string, number> = {};

      data.forEach(item => {
        const status = getRowStatus(item, stage);
        if (counts[status] !== undefined) counts[status]++;

        if (status !== 'OnTime') {
          for (const key in item.status_info) {
            if (reasonKeywords.some(k => key.toLowerCase().includes(k))) {
              const val = item.status_info[key];
              if (val && !val.toLowerCase().includes('ontime') && !val.toLowerCase().includes('ok')) {
                reasons[val] = (reasons[val] || 0) + 1;
              }
            }
          }
        }
      });

      return {
        chartData: Object.entries(counts).map(([name, value]) => ({ name, value })),
        reasons: Object.entries(reasons).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5)
      };
    };

    return {
      outpool: getStageStats('outpool', ['abnormalty', 'reason', 'keterangan']),
      inpdc: getStageStats('inpdc', ['delay inpdc', 'alasan kedatangan', 'keterangan delay']),
      delivery: getStageStats('delivery', ['delay delivery', 'alasan delay', 'pengiriman'])
    };
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.driver?.toLowerCase().includes(q) ||
        item.no_polisi?.toLowerCase().includes(q) ||
        item.no_lambung?.toLowerCase().includes(q)
      );
    }
    if (activeFilter) {
      result = result.filter(item => getRowStatus(item, activeFilter.stage) === activeFilter.status);
    }
    return result;
  }, [data, searchQuery, activeFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const calculateEfficiency = (stage: string) => {
    const s = (stats as any)?.[stage]?.chartData;
    if (!s) return "0%";
    const total = s.reduce((acc: number, curr: any) => acc + curr.value, 0);
    if (total === 0) return "0%";
    const onTime = s.find((d: any) => d.name === 'OnTime')?.value || 0;
    return ((onTime / total) * 100).toFixed(1) + "%";
  };

  return (
    <div className="space-y-6 md:space-y-10 pb-20 max-w-[1600px] mx-auto px-4 lg:px-6">
      {/* ── UNDER MAINTENANCE BANNER ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/20 p-3 md:p-4 rounded-2xl md:rounded-[24px] flex items-center justify-center gap-3 text-amber-600 dark:text-amber-400 font-bold text-xs md:text-sm shadow-sm"
      >
        <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
        Sistem LeadTime dalam tahap pengembangan (Under Maintenance)
      </motion.div>

      {/* ── HEADER ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-blue-500/5">
        <div className="flex items-center gap-4 md:gap-5">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl md:rounded-[24px] flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
            <Truck className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">LeadTime Command Center</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mt-1">
              <Timer className="w-3.5 h-3.5 md:w-4 md:h-4" /> Monitoring Performa Logistik
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex flex-1 items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none text-[11px] md:text-xs font-bold focus:ring-0 text-slate-700 dark:text-slate-200 p-0 w-full" />
              <span className="text-slate-300">/</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none text-[11px] md:text-xs font-bold focus:ring-0 text-slate-700 dark:text-slate-200 p-0 w-full" />
            </div>
          </div>
          
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 z-10" />
            <select 
              value={area} 
              onChange={(e) => { setArea(e.target.value); setCurrentPage(1); }} 
              className="w-full sm:w-[180px] pl-10 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl text-xs font-black focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200 appearance-none cursor-pointer transition-all"
            >
              {areas.map(a => <option key={a} value={a}>{a === 'ALL' ? 'ALL AREA' : a}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {[1,2,3].map(i => <div key={i} className="h-[500px] md:h-[600px] bg-slate-100 dark:bg-slate-800/50 rounded-[32px] md:rounded-[40px] animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-8 md:space-y-12">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            <StageBox title="OUTPOOL" icon={<Truck />} stats={stats?.outpool} eff={calculateEfficiency('outpool')} stage="outpool" activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSelectedReason={setSelectedReason} />
            <StageBox title="IN-PDC" icon={<Package />} stats={stats?.inpdc} eff={calculateEfficiency('inpdc')} stage="inpdc" activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSelectedReason={setSelectedReason} />
            <StageBox title="DELIVERY" icon={<CheckCircle2 />} stats={stats?.delivery} eff={calculateEfficiency('delivery')} stage="delivery" activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSelectedReason={setSelectedReason} />
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900/60 rounded-[32px] md:rounded-[40px] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-blue-500/5 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Transaction Details</h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Showing {paginatedData.length} of {filteredData.length} records
                  </p>
                </div>
                {activeFilter && (
                  <button onClick={() => setActiveFilter(null)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl text-[10px] font-black border border-blue-100 dark:border-blue-500/20">
                    FILTER: {activeFilter.status} <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 w-full md:w-[300px] shadow-inner"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                    <th className="px-6 py-4">Tgl / Area</th>
                    <th className="px-6 py-4">Driver</th>
                    <th className="px-6 py-4">Unit Info</th>
                    <th className="px-6 py-4">OutPool</th>
                    <th className="px-6 py-4">InPDC</th>
                    <th className="px-6 py-4">Delivery</th>
                    <th className="px-6 py-4 text-right pr-10">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all group">
                      <td className="px-6 py-4">
                        <div className="text-xs font-black text-slate-900 dark:text-white">{new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</div>
                        <div className="text-[9px] text-blue-600 dark:text-blue-400 font-black mt-0.5 tracking-wider uppercase">{item.area}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.driver}</div>
                        <div className="text-[9px] text-slate-400 font-medium">{item.assistant || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.no_polisi}</div>
                        <div className="text-[9px] text-slate-400 font-medium italic">{item.no_lambung || 'No Unit'}</div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={getRowStatus(item, 'outpool')} label={item.status_info?.['Evaluasi Keluar Pool'] || 'OnTime'} /></td>
                      <td className="px-6 py-4"><StatusBadge status={getRowStatus(item, 'inpdc')} label={item.status_info?.['Evaluasi Kedatangan CC'] || item.status_info?.['Keterangan Delay (InPDC)'] || '-'} /></td>
                      <td className="px-6 py-4"><StatusBadge status={getRowStatus(item, 'delivery')} label={item.status_info?.['Leadtime Delivery'] || '-'} /></td>
                      <td className="px-6 py-4 text-right pr-10">
                        <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-300 group-hover:text-blue-500">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center sm:text-left">Page {currentPage} of {totalPages || 1}</p>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(3, totalPages))].map((_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 3 && currentPage > 2) pageNum = currentPage - 2 + i + 1;
                    if (pageNum > totalPages) return null;
                    return (
                      <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500'}`}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REASON POPUP MODAL ── */}
      <AnimatePresence>
        {selectedReason && (
          <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedReason(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedReason.title}</h3>
                </div>
                <button onClick={() => setSelectedReason(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400">
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="p-5 md:p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Reason</p>
                  <p className="text-sm md:text-lg font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{selectedReason.reason}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Occurrences</p>
                    <p className="text-xl md:text-2xl font-black text-blue-600">{selectedReason.count} <span className="text-[10px] text-slate-400 ml-1">TRIPS</span></p>
                  </div>
                  <button onClick={() => { setSearchQuery(selectedReason.reason); setSelectedReason(null); }} className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl md:rounded-2xl text-[10px] font-black shadow-lg shadow-blue-600/20">
                    VIEW TRIPS
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageBox({ title, icon, stats, eff, stage, activeFilter, setActiveFilter, setSelectedReason }: any) {
  const onTimeCount = stats?.chartData?.find((d: any) => d.name === 'OnTime')?.value || 0;
  const delayCount = stats?.chartData?.find((d: any) => d.name === 'Delay')?.value || 0;

  return (
    <div className="bg-white dark:bg-slate-900/60 rounded-[32px] md:rounded-[40px] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-blue-500/5 p-6 md:p-8 flex flex-col h-full hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl md:rounded-2xl shrink-0">
          {icon}
        </div>
        <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{title}</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10">
        <button onClick={() => setActiveFilter({stage, status: 'OnTime'})} className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all text-left ${activeFilter?.stage === stage && activeFilter?.status === 'OnTime' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20'}`}>
          <span className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${activeFilter?.stage === stage && activeFilter?.status === 'OnTime' ? 'text-emerald-100' : 'text-emerald-600'}`}>ONTIME</span>
          <div className="text-xl md:text-2xl font-black">{eff}</div>
          <div className="text-[9px] font-bold mt-1 opacity-70">{onTimeCount} TRIPS</div>
        </button>

        <button onClick={() => setActiveFilter({stage, status: 'Delay'})} className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all text-left ${activeFilter?.stage === stage && activeFilter?.status === 'Delay' ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20'}`}>
          <span className={`block text-[9px] font-black uppercase tracking-widest mb-2 ${activeFilter?.stage === stage && activeFilter?.status === 'Delay' ? 'text-blue-100' : 'text-blue-600'}`}>DELAY</span>
          <div className="text-xl md:text-2xl font-black">{(100 - parseFloat(eff)).toFixed(1)}%</div>
          <div className="text-[9px] font-bold mt-1 opacity-70">{delayCount} TRIPS</div>
        </button>
      </div>

      <div className="h-48 md:h-56 relative mb-8 md:mb-10 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={stats?.chartData} cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" paddingAngle={8} dataKey="value" animationDuration={800}>
              <Cell fill={BLUE_SHADES.emerald} cursor="pointer" onClick={() => setActiveFilter({stage, status: 'OnTime'})} />
              <Cell fill={BLUE_SHADES.navy} cursor="pointer" onClick={() => setActiveFilter({stage, status: 'Delay'})} />
              <Cell fill={BLUE_SHADES.light} cursor="pointer" onClick={() => setActiveFilter({stage, status: 'Advance'})} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{eff}</span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
        </div>
      </div>

      <div className="mt-auto pt-6 md:pt-8 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">DELAY REASONS <Info className="w-3 h-3" /></h4>
        <div className="space-y-3 md:space-y-4">
          {stats?.reasons.length > 0 ? stats.reasons.map((r: any, i: number) => (
            <button key={i} onClick={() => setSelectedReason({title: `DELAY AT ${title}`, reason: r.name, count: r.value})} className="w-full flex items-center justify-between group/item hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-all">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate pr-4 text-left">{r.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-12 md:w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(r.value * 5, 100)}%` }} />
                </div>
                <span className="text-[9px] font-black text-slate-900 dark:text-white w-4 text-right">{r.value}</span>
              </div>
            </button>
          )) : (
            <div className="flex flex-col items-center justify-center py-4 gap-2 opacity-30">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <p className="text-[9px] font-bold uppercase tracking-widest">No Delay</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string, label: string }) {
  const isSuccess = status === 'OnTime';
  const isWarning = status === 'Advance';
  const isDanger = status === 'Delay';
  
  return (
    <div className={`inline-flex flex-col px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider border transition-all ${
      isSuccess ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
      isWarning ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 
      isDanger ? 'bg-red-500/10 text-red-600 border-red-500/20' :
      'bg-slate-100 text-slate-400 border-slate-200'
    }`}>
      <span className="uppercase">{status}</span>
      <span className="text-[7px] opacity-60 truncate max-w-[60px] font-bold">{label}</span>
    </div>
  );
}
