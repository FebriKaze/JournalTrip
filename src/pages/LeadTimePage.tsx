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
  ChevronLeft,
  Circle,
  Navigation,
  Map as MapIcon,
  Flag,
  CalendarDays,
  BarChart3,
  ListFilter,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { leadtimeService, LeadTimeData } from '../services/leadtimeService';

const STATUS_COLORS = {
  ontime: '#10b981', // Emerald/Green
  advance: '#f59e0b', // Amber/Yellow
  delay: '#ef4444',   // Red
  navy: '#1e3a8a',
  slate: '#94a3b8'
};

const ITEMS_PER_PAGE = 15;

const TIMELINE_FLOWS: Record<string, string[]> = {
  'JBK': ['OutPool', 'InPDC', 'OutPDC', 'Unloading'],
  'TMMIN': ['OutPool', 'InPDC', 'OutPDC', 'Unloading'],
  'NGORO': [
    'OutPool', 'InPDC', 'OutPDC', 
    'KM 166', 'KM 379A', 'KM 575A', 
    'Unloading', 
    'KM 575B', 'KM 360B', 'KM 164B', 
    'InPool'
  ],
  'DEFAULT': ['OutPool', 'InPDC', 'OutPDC', 'Unloading']
};

const KEY_MAP: Record<string, {actual: string[], plan: string[], stage: string}> = {
  'OutPool': { actual: ['Actual (LeadTime)', 'keluar pool', 'outpool', 'abnormalty'], plan: ['plan outpool', 'rencana keluar'], stage: 'outpool' },
  'InPDC': { actual: ['Actual (LeadTime)', 'IN PDC', 'inpdc', 'in pdc'], plan: ['plan inpdc', 'PLAN'], stage: 'inpdc' },
  'OutPDC': { actual: ['Out PDC', 'out pdc', 'outpdc'], plan: ['plan outpdc'], stage: 'outpdc' },
  'Unloading': { actual: ['Actual (Unloading)', 'Unloading PDC POLYGON', 'aktual unloading', 'aktual bongkar'], plan: ['plan bongkar'], stage: 'delivery' },
  'KM 166': { actual: ['KM 166'], plan: [], stage: 'unknown' },
  'KM 379A': { actual: ['KM 379A'], plan: [], stage: 'unknown' },
  'KM 575A': { actual: ['KM 575A'], plan: [], stage: 'unknown' },
  'KM 575B': { actual: ['KM 575B'], plan: [], stage: 'unknown' },
  'KM 360B': { actual: ['KM 360B'], plan: [], stage: 'unknown' },
  'KM 164B': { actual: ['KM 164B'], plan: [], stage: 'unknown' },
  'InPool': { actual: ['Actual (BackToPool)', 'BACK TO POOL', 'inpool', 'in pool'], plan: ['Plan (BackToPool)', 'plan backtopool'], stage: 'unknown' }
};

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
  
  const [activeFilter, setActiveFilter] = useState<{stage: string, status: string} | null>(null);
  const [reasonFilter, setReasonFilter] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<{title: string, reason: string, count: number} | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<LeadTimeData | null>(null);

  const areas = ['ALL', 'JBK', 'NGORO', 'TMMIN', 'SUMATERA'];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedReason(null);
        setSelectedTrip(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

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
    const areaName = item.area?.toUpperCase() || '';
    const info = item.status_info || {};
    const points = item.checkpoints || {};

    const findExactOrInclude = (obj: any, keys: string[]) => {
      for (const k of keys) {
        if (obj[k]) return obj[k].toString();
        for (const key in obj) {
          if (key.toLowerCase().includes(k.toLowerCase())) return obj[key].toString();
        }
      }
      return '';
    };

    if (stage === 'outpool') {
      const val = findExactOrInclude(info, ['Evaluasi Keluar Pool', 'Abnormalty']).toLowerCase();
      if (val.includes('delay')) return 'Delay';
      return 'OnTime';
    }

    if (stage === 'inpdc') {
      const val = findExactOrInclude(info, ['Evaluasi Kedatangan CC']).toLowerCase();
      if (val.includes('advance')) return 'Advance';
      if (val.includes('delay')) return 'Delay';
      if (val.includes('ontime') || val.includes('on time') || val.includes('ok')) return 'OnTime';
      const fall = findExactOrInclude(info, ['Keterangan']).toLowerCase();
      if (fall.includes('advance')) return 'Advance';
      if (fall.includes('delay')) return 'Delay';
      if (fall.includes('ontime') || fall.includes('on time') || fall.includes('ok')) return 'OnTime';
      return 'Unknown';
    }

    if (stage === 'delivery') {
      let val = '';
      if (areaName === 'JBK') val = (findExactOrInclude(points, ['LeadTime Delivery']) || findExactOrInclude(info, ['Leadtime delivery'])).toLowerCase();
      else if (areaName === 'NGORO') val = findExactOrInclude(info, ['Status Leadtime Delivery']).toLowerCase();
      else if (areaName === 'TMMIN') val = findExactOrInclude(info, ['Status Leadtime']).toLowerCase();
      else if (areaName === 'SUMATERA') {
        const durationStr = findExactOrInclude(points, ['LeadTime Delivery']);
        if (!durationStr || durationStr === '-' || durationStr.length < 2) return 'Unknown';
        let totalHours = 0;
        const dayMatch = durationStr.match(/(\d+)\s*hari/);
        const hourMatch = durationStr.match(/(\d+)\s*jam/);
        if (dayMatch) totalHours += parseInt(dayMatch[1]) * 24;
        if (hourMatch) totalHours += parseInt(hourMatch[1]);
        return totalHours >= 20 ? 'Delay' : 'OnTime';
      }
      if (val.includes('delay')) return 'Delay';
      if (val.includes('ontime') || val.includes('on time') || val.includes('ok')) return 'OnTime';
      return 'Unknown';
    }
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
        for (const key in item.status_info) {
          if (reasonKeywords.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
            const val = item.status_info[key];
            if (val && !val.toLowerCase().includes('ontime') && !val.toLowerCase().includes('ok') && val !== '-' && !val.toLowerCase().includes('tidak ada')) {
              reasons[val] = (reasons[val] || 0) + 1;
            }
          }
        }
      });

      const total = counts.OnTime + counts.Delay + counts.Advance;
      const chartData = Object.entries(counts).map(([name, value]) => ({ 
        name, value, percentage: total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%'
      }));

      return {
        chartData, total, reasons: Object.entries(reasons).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 8)
      };
    };

    const dailyData: Record<string, any> = {};
    data.forEach(item => {
      const date = new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      if (!dailyData[date]) dailyData[date] = { date, OnTime: 0, Delay: 0, Advance: 0, Total: 0 };
      const status = getRowStatus(item, 'inpdc');
      if (dailyData[date][status] !== undefined) dailyData[date][status]++;
      dailyData[date].Total++;
    });

    const trendChartData = Object.values(dailyData).map(d => ({
      ...d, onTimeRate: d.Total > 0 ? parseFloat((((d.OnTime + d.Advance) / d.Total) * 100).toFixed(1)) : 0
    })).sort((a,b) => {
      const d1 = new Date(data.find(x => new Date(x.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) === a.date)?.tanggal || '');
      const d2 = new Date(data.find(x => new Date(x.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) === b.date)?.tanggal || '');
      return d1.getTime() - d2.getTime();
    });

    return {
      outpool: getStageStats('outpool', ['Evaluasi Keluar Pool', 'Abnormalty']),
      inpdc: getStageStats('inpdc', ['Evaluasi Kedatangan CC', 'delay inpdc']),
      delivery: getStageStats('delivery', ['Leadtime delivery', 'status leadtime', 'delay delivery']),
      trend: trendChartData
    };
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.driver?.toLowerCase().includes(q) || 
        item.no_polisi?.toLowerCase().includes(q)
      );
    }
    if (reasonFilter) {
      const q = reasonFilter.toLowerCase();
      result = result.filter(item => {
        const info = item.status_info || {};
        const points = item.checkpoints || {};
        return Object.values(info).some(v => v?.toString().toLowerCase() === q) || 
               Object.values(points).some(v => v?.toString().toLowerCase() === q);
      });
    }
    if (activeFilter) {
      result = result.filter(item => getRowStatus(item, activeFilter.stage) === activeFilter.status);
    }
    return result;
  }, [data, searchQuery, activeFilter, reasonFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const calculateEfficiency = (stage: string) => {
    const s = (stats as any)?.[stage];
    if (!s) return "0%";
    const total = s.total;
    if (total === 0) return "0%";
    const onTime = s.chartData.find((d: any) => d.name === 'OnTime')?.value || 0;
    const advance = s.chartData.find((d: any) => d.name === 'Advance')?.value || 0;
    return (((onTime + advance) / total) * 100).toFixed(1) + "%";
  };

  const getStatusValue = (item: LeadTimeData, stage: string) => {
    const info = item.status_info || {};
    const points = item.checkpoints || {};
    if (stage === 'outpool') return info['Evaluasi Keluar Pool'] || info['Abnormalty'] || '-';
    if (stage === 'inpdc') return info['Evaluasi Kedatangan CC'] || info['Keterangan'] || '-';
    if (stage === 'delivery') {
      const areaName = item.area?.toUpperCase();
      if (areaName === 'JBK') return points['LeadTime Delivery'] || info['Leadtime delivery'] || '-';
      if (areaName === 'NGORO') return info['Status Leadtime Delivery'] || '-';
      if (areaName === 'TMMIN') return info['Status Leadtime'] || '-';
      if (areaName === 'SUMATERA') return points['LeadTime Delivery'] || '-';
    }
    return '-';
  };

  const getTimelineEvents = (item: LeadTimeData) => {
    const areaKey = item.area?.toUpperCase() || 'DEFAULT';
    const flowSteps = TIMELINE_FLOWS[areaKey] || TIMELINE_FLOWS['DEFAULT'];
    const points = item.checkpoints || {};
    const statusInfo = item.status_info || {};
    return flowSteps.map(step => {
      const config = KEY_MAP[step] || { actual: [step.toLowerCase()], plan: [], stage: 'unknown' };
      let actual = '', plan = '';
      for (const key in points) { if (config.actual.some(k => key.toLowerCase().includes(k.toLowerCase()))) { actual = points[key]?.toString() || ''; break; } }
      if (!actual) { for (const key in statusInfo) { if (config.actual.some(k => key.toLowerCase().includes(k.toLowerCase()))) { const val = statusInfo[key]?.toString() || ''; const match = val.match(/\d{2}:\d{2}/); if (match) actual = match[0]; break; } } }
      for (const key in points) { if (config.plan.some(k => key.toLowerCase().includes(k.toLowerCase()))) { plan = points[key]?.toString() || ''; break; } }
      if (!plan) { for (const key in statusInfo) { if (config.plan.some(k => key.toLowerCase().includes(k.toLowerCase()))) { const val = statusInfo[key]?.toString() || ''; const match = val.match(/\d{2}:\d{2}/); if (match) plan = match[0]; break; } } }
      const status = config.stage !== 'unknown' ? getRowStatus(item, config.stage) : 'OnTime';
      return { label: step, actual, plan, status };
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-10 pb-20 w-full max-w-[100vw] overflow-x-hidden px-1 sm:px-4 lg:px-6 box-border">
      {/* ── HEADER SECTION ── */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-3 sm:p-8 rounded-[20px] sm:rounded-[32px] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-blue-500/5 mt-1 sm:mt-0 w-full max-w-full overflow-hidden box-border">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0 max-w-full overflow-hidden">
            <div className="w-9 h-9 sm:w-16 sm:h-16 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
              <Truck className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <h1 className="text-sm sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight truncate">LeadTime Center</h1>
              <p className="text-[8px] sm:text-sm text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 mt-0.5 sm:mt-1 uppercase tracking-widest truncate">
                <Timer className="w-2.5 h-2.5" /> Operational Analytics
              </p>
            </div>
          </div>
          
          <div className="flex flex-col xs:flex-row items-stretch gap-2 w-full lg:w-auto shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 flex-1 min-w-0">
              <div className="flex flex-1 items-center gap-1 px-2 py-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 min-w-0 overflow-hidden">
                <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
                <div className="flex items-center gap-1 w-full min-w-0 overflow-hidden">
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none text-[8px] font-bold focus:ring-0 text-slate-700 dark:text-slate-200 p-0 w-full" />
                  <span className="text-slate-300">/</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none text-[8px] font-bold focus:ring-0 text-slate-700 dark:text-slate-200 p-0 w-full" />
                </div>
              </div>
            </div>
            <div className="relative w-full lg:w-[150px] shrink-0">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 z-10" />
              <select value={area} onChange={(e) => { setArea(e.target.value); setCurrentPage(1); }} className="w-full pl-8 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-[8px] font-black focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-200 appearance-none cursor-pointer uppercase transition-all">
                {areas.map(a => <option key={a} value={a}>{a === 'ALL' ? 'ALL AREA' : a}</option>)}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-10">
          {[1,2,3].map(i => <div key={i} className="h-[300px] sm:h-[400px] bg-slate-100 dark:bg-slate-800/50 rounded-[24px] sm:rounded-[32px] animate-pulse" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:gap-12 w-full max-w-full overflow-hidden box-border">
          {/* ── STAGE BOXES ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-10 w-full max-w-full overflow-hidden box-border">
            <StageBox title="OUTPOOL" icon={<Truck />} stats={stats?.outpool} eff={calculateEfficiency('outpool')} stage="outpool" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <StageBox title="IN-PDC" icon={<Package />} stats={stats?.inpdc} eff={calculateEfficiency('inpdc')} stage="inpdc" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <StageBox title="DELIVERY" icon={<CheckCircle2 />} stats={stats?.delivery} eff={calculateEfficiency('delivery')} stage="delivery" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          </div>

          {/* ── DELAY ANALYSIS CENTER ── */}
          <div className="bg-slate-900 rounded-[20px] sm:rounded-[40px] p-4 sm:p-10 shadow-2xl shadow-blue-500/10 border border-slate-800 w-full max-w-full overflow-hidden box-border">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 sm:mb-10 gap-6 overflow-hidden">
              <div className="min-w-0 overflow-hidden">
                <h3 className="text-base sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2 sm:gap-3 truncate">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" /> Delay Analysis
                </h3>
                <p className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">Deep-dive into operational abnormalities</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 text-[10px] font-black text-blue-400 uppercase tracking-widest shrink-0">
                <Info className="w-3.5 h-3.5" /> Top Reasons Breakdown
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-12 w-full max-w-full overflow-hidden">
              <ReasonSection title="OUTPOOL DELAYS" reasons={stats?.outpool?.reasons} color="text-amber-500" onSelect={(r) => setSelectedReason({title: 'OUTPOOL DELAY', reason: r.name, count: r.value})} />
              <ReasonSection title="IN-PDC ANALYSIS" reasons={stats?.inpdc?.reasons} color="text-blue-500" onSelect={(r) => setSelectedReason({title: 'IN-PDC ANALYSIS', reason: r.name, count: r.value})} />
              <ReasonSection title="DELIVERY DELAYS" reasons={stats?.delivery?.reasons} color="text-red-500" onSelect={(r) => setSelectedReason({title: 'DELIVERY DELAY', reason: r.name, count: r.value})} />
            </div>
          </div>

          {/* ── PERFORMANCE TREND ── */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[20px] sm:rounded-[40px] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-blue-500/5 p-4 sm:p-8 w-full max-w-full overflow-hidden box-border">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4 sm:gap-6 overflow-hidden">
              <div className="min-w-0 flex-1 overflow-hidden">
                <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight truncate">Performance Trend</h3>
                <p className="text-[7px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">Daily Efficiency (OnTime + Advance)</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                <LegendItem color={STATUS_COLORS.ontime} label="OnTime" />
                <LegendItem color={STATUS_COLORS.advance} label="Advance" />
                <LegendItem color={STATUS_COLORS.delay} label="Delay" />
                <LegendItem color={STATUS_COLORS.advance} label="Rate (%)" isLine />
              </div>
            </div>
            <div className="h-[200px] sm:h-[400px] w-full min-w-0 overflow-hidden relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <ComposedChart data={stats?.trend} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.1} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#94a3b8' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#f59e0b' }} />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <Bar yAxisId="left" dataKey="OnTime" stackId="a" fill={STATUS_COLORS.ontime} barSize={16} />
                  <Bar yAxisId="left" dataKey="Advance" stackId="a" fill={STATUS_COLORS.advance} barSize={16} />
                  <Bar yAxisId="left" dataKey="Delay" stackId="a" fill={STATUS_COLORS.delay} radius={[2, 2, 0, 0]} barSize={16} />
                  <Line yAxisId="right" type="monotone" dataKey="onTimeRate" stroke={STATUS_COLORS.advance} strokeWidth={2} dot={{ fill: STATUS_COLORS.advance, r: 2.5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── DATA DETAILS ── */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-[20px] sm:rounded-[40px] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-blue-500/5 w-full max-w-full overflow-hidden box-border">
            <div className="p-4 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 min-w-0 flex-1 overflow-hidden">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">LeadTime Details</h3>
                  <p className="text-[8px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wider truncate">
                    Showing <span className="font-black text-blue-600">{filteredData.length}</span> records
                  </p>
                </div>
                {(activeFilter || reasonFilter) && (
                  <button onClick={() => { setActiveFilter(null); setReasonFilter(null); }} className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg text-[7px] font-black border border-blue-100 dark:border-blue-500/20 uppercase tracking-widest shrink-0 transition-all">
                    RESET <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <div className="relative w-full lg:w-[250px] shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="text" placeholder="Quick search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-[9px] font-bold focus:ring-2 focus:ring-blue-500 shadow-inner uppercase" />
              </div>
            </div>
            
            <div className="w-full overflow-x-auto scrollbar-hide max-w-full block">
              <table className="w-full text-left min-w-[600px] border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 uppercase text-[7px] sm:text-[9px] font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-4 py-5 w-[100px]">Tgl / Area</th>
                    <th className="px-4 py-5 w-[120px]">Driver Info</th>
                    <th className="px-4 py-5 w-[100px]">Vehicle</th>
                    <th className="px-4 py-5 w-[100px]">OutPool</th>
                    <th className="px-4 py-5 w-[100px]">InPDC</th>
                    <th className="px-4 py-5 w-[100px]">Delivery</th>
                    <th className="px-4 py-5 w-[60px] text-right pr-6 sm:pr-10">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedData.map((item) => (
                    <tr key={item.id} onClick={() => setSelectedTrip(item)} className="hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all group cursor-pointer">
                      <td className="px-4 py-4 overflow-hidden">
                        <div className="text-[9px] sm:text-[11px] font-black text-slate-900 dark:text-white uppercase truncate">{new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</div>
                        <div className="text-[7px] sm:text-[8px] text-blue-600 dark:text-blue-400 font-black mt-0.5 tracking-wider uppercase truncate">{item.area}</div>
                      </td>
                      <td className="px-4 py-4 overflow-hidden">
                        <div className="text-[9px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase truncate">{item.driver}</div>
                        <div className="text-[7px] sm:text-[8px] text-blue-500 font-black mt-0.5 uppercase tracking-widest truncate">RIT {item.ritase_ke || '-'}</div>
                      </td>
                      <td className="px-4 py-4 overflow-hidden">
                        <div className="text-[9px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase truncate">{item.no_polisi}</div>
                        <div className="text-[7px] sm:text-[8px] text-slate-400 font-bold uppercase tracking-tight mt-0.5 truncate">Realtime</div>
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={getRowStatus(item, 'outpool')} label={getStatusValue(item, 'outpool')} /></td>
                      <td className="px-4 py-4"><StatusBadge status={getRowStatus(item, 'inpdc')} label={getStatusValue(item, 'inpdc')} /></td>
                      <td className="px-4 py-4"><StatusBadge status={getRowStatus(item, 'delivery')} label={getStatusValue(item, 'delivery')} /></td>
                      <td className="px-4 py-4 text-right pr-6 sm:pr-10 overflow-hidden">
                        <div className="inline-flex p-1.5 sm:p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-700">
                          <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex flex-col xs:flex-row items-center justify-between gap-3 overflow-hidden">
              <p className="text-[7px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Page {currentPage} of {totalPages || 1}
              </p>
              <div className="flex items-center gap-2">
                <button disabled={currentPage === 1} onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev - 1); }} className="p-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-all">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button disabled={currentPage === totalPages || totalPages === 0} onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev + 1); }} className="p-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 disabled:opacity-30 transition-all">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      <AnimatePresence>
        {selectedReason && (
          <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedReason(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[20px] sm:rounded-[40px] shadow-2xl p-5 sm:p-10 border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <ModalHeader title={selectedReason.title} onClose={() => setSelectedReason(null)} />
              <div className="space-y-6 sm:space-y-8">
                <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 sm:mb-3">Detailed Analysis</p>
                  <p className="text-xs sm:text-base font-bold text-slate-800 dark:text-slate-200 leading-relaxed uppercase tracking-tight">{selectedReason.reason}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Occurrences</p>
                    <p className="text-xl font-black text-red-600 tracking-tighter truncate">{selectedReason.count} <span className="text-[9px] text-slate-400 ml-1 uppercase tracking-widest">Trips</span></p>
                  </div>
                  <button onClick={() => { setReasonFilter(selectedReason.reason); setSelectedReason(null); setCurrentPage(1); }} className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl sm:rounded-2xl text-[10px] font-black shadow-lg shadow-blue-600/20 uppercase tracking-widest">View Trips</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
        {selectedTrip && (
          <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTrip(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 100, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.95 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-[20px] sm:rounded-[40px] shadow-2xl p-5 sm:p-10 border border-slate-100 dark:border-slate-800 overflow-y-auto max-h-[90vh]">
              <ModalHeader title="Trip Timeline" onClose={() => setSelectedTrip(null)} />
              <div className="flex flex-col sm:flex-row justify-between mb-8 sm:mb-10 gap-6 overflow-hidden">
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h4 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none truncate">{selectedTrip.driver}</h4>
                  <p className="text-blue-600 font-black text-[8px] sm:text-xs uppercase mt-1.5 sm:mt-3 tracking-widest truncate">
                    RITASE {selectedTrip.ritase_ke} • {selectedTrip.area}
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 sm:p-3 rounded-2xl shrink-0 overflow-hidden">
                  <div className="text-right min-w-0 overflow-hidden">
                    <p className="text-[7px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Vehicle</p>
                    <p className="text-[9px] sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{selectedTrip.no_polisi}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-7 sm:space-y-10 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800 overflow-hidden">
                {getTimelineEvents(selectedTrip).map((event, i) => (
                  <div key={i} className="flex gap-4 sm:gap-6 relative z-10 group min-w-0 overflow-hidden">
                    <div className={`w-9 h-9 rounded-full bg-white dark:bg-slate-900 border-4 ${event.actual ? 'border-blue-50 dark:border-blue-900/40' : 'border-slate-50 dark:border-slate-800'} flex items-center justify-center shadow-sm transition-all shrink-0`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${event.actual ? (event.status === 'Delay' ? 'bg-red-500' : event.status === 'Advance' ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-300 dark:bg-slate-700'}`} />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between mb-1 sm:mb-2 gap-2 overflow-hidden">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 overflow-hidden">
                          <p className={`text-[8px] sm:text-xs font-black uppercase tracking-tight truncate ${event.actual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{event.label}</p>
                          {event.actual && event.status !== 'OnTime' && (
                            <span className={`px-1.5 py-0.5 rounded-lg text-[5px] sm:text-[8px] font-black uppercase tracking-widest shrink-0 ${event.status === 'Delay' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-600'}`}>
                              {event.status}
                            </span>
                          )}
                        </div>
                        <p className={`text-[9px] sm:text-sm font-black shrink-0 ${event.status === 'Delay' ? 'text-red-500' : event.status === 'Advance' ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {event.actual || '--:--'}
                        </p>
                      </div>
                      {event.plan && (
                        <div className="flex items-center gap-1.5 mt-1 sm:mt-2 opacity-70 overflow-hidden">
                          <CalendarDays className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                          <p className="text-[6px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Plan: {event.plan}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button onClick={() => setSelectedTrip(null)} className="w-full sm:w-auto px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl sm:rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">Close Window</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageBox({ title, icon, stats, eff, stage, activeFilter, setActiveFilter }: any) {
  const onTimeData = stats?.chartData?.find((d: any) => d.name === 'OnTime');
  const delayData = stats?.chartData?.find((d: any) => d.name === 'Delay');
  const advanceData = stats?.chartData?.find((d: any) => d.name === 'Advance');
  const isInPdc = title === 'IN-PDC';
  
  return (
    <div className="bg-white dark:bg-slate-900/60 rounded-[16px] sm:rounded-[32px] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-blue-500/5 p-3 sm:p-8 flex flex-col h-full hover:border-blue-500/30 transition-all duration-500 group overflow-hidden w-full max-w-full box-border">
      <div className="flex items-center gap-2.5 sm:gap-4 mb-4 sm:mb-8 overflow-hidden">
        <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h2 className="text-xs sm:text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase truncate">{title}</h2>
      </div>
      
      {/* IMPROVED SCORECARD GRID: Better spacing and alignment on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-4 mb-6 sm:mb-10 w-full">
        <StatusCard onClick={() => setActiveFilter({stage, status: 'OnTime'})} active={activeFilter?.stage === stage && activeFilter?.status === 'OnTime'} type="OnTime" eff={onTimeData?.percentage} count={onTimeData?.value} />
        {isInPdc ? (
          <>
            <StatusCard onClick={() => setActiveFilter({stage, status: 'Advance'})} active={activeFilter?.stage === stage && activeFilter?.status === 'Advance'} type="Advance" eff={advanceData?.percentage} count={advanceData?.value} />
            <div className="col-span-2">
              <StatusCard onClick={() => setActiveFilter({stage, status: 'Delay'})} active={activeFilter?.stage === stage && activeFilter?.status === 'Delay'} type="Delay" eff={delayData?.percentage} count={delayData?.value} />
            </div>
          </>
        ) : (
          <StatusCard onClick={() => setActiveFilter({stage, status: 'Delay'})} active={activeFilter?.stage === stage && activeFilter?.status === 'Delay'} type="Delay" eff={delayData?.percentage} count={delayData?.value} />
        )}
      </div>
      
      <div className="h-28 sm:h-56 relative flex items-center justify-center mt-auto overflow-hidden w-full max-w-full">
        <div className="w-28 h-28 sm:w-full sm:h-full sm:max-w-[200px] shrink-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie data={stats?.chartData} cx="50%" cy="50%" innerRadius="70%" outerRadius="95%" paddingAngle={8} dataKey="value" animationDuration={1000}>
                <Cell fill={STATUS_COLORS.ontime} cursor="pointer" onClick={() => setActiveFilter({stage, status: 'OnTime'})} />
                <Cell fill={STATUS_COLORS.delay} cursor="pointer" onClick={() => setActiveFilter({stage, status: 'Delay'})} />
                <Cell fill={STATUS_COLORS.advance} cursor="pointer" onClick={() => setActiveFilter({stage, status: 'Advance'})} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{eff}</span>
          <span className="text-[6px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1">Efficiency</span>
        </div>
      </div>
    </div>
  );
}

function ReasonSection({ title, reasons, color, onSelect }: any) {
  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-hidden box-border">
      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
        <div className={`w-1 sm:w-1.5 h-4 sm:h-6 rounded-full bg-current ${color} shrink-0`} />
        <h4 className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest truncate">{title}</h4>
      </div>
      <div className="flex flex-col gap-2 sm:gap-3 w-full overflow-hidden">
        {reasons?.length > 0 ? reasons.map((r: any, i: number) => (
          <button key={i} onClick={() => onSelect(r)} className="w-full group bg-slate-800/40 hover:bg-slate-800 border border-slate-700/30 hover:border-slate-600 p-2.5 sm:p-3.5 rounded-xl transition-all flex items-center justify-between min-w-0 overflow-hidden">
            <span className="text-[8px] sm:text-[11px] font-bold text-slate-400 group-hover:text-white truncate pr-2 text-left uppercase flex-1">{r.name}</span>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0 overflow-hidden">
              <div className="w-8 sm:w-16 h-1 bg-slate-700 rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${Math.min((r.value / (reasons[0]?.value || 1)) * 100, 100)}%` }} />
              </div>
              <span className="text-[8px] sm:text-[11px] font-black text-white w-4 text-right shrink-0">{r.value}</span>
            </div>
          </button>
        )) : (
          <div className="py-4 sm:py-8 text-center text-[7px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest border border-dashed border-slate-800 rounded-xl flex flex-col items-center gap-1.5 overflow-hidden">
            <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-500/20 shrink-0" /> No Abnormalities
          </div>
        )}
      </div>
    </div>
  );
}

function StatusCard({ onClick, active, type, eff, count }: any) {
  const isDelay = type === 'Delay';
  const isAdvance = type === 'Advance';
  return (
    <button onClick={onClick} className={`w-full rounded-xl border transition-all text-left shadow-sm p-3 overflow-hidden shrink-0 ${active ? (isDelay ? 'bg-red-600 text-white border-red-700' : isAdvance ? 'bg-amber-500 text-white border-amber-600' : 'bg-emerald-500 text-white border-emerald-600') : (isDelay ? 'bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/20' : isAdvance ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/20' : 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20')}`}>
      <span className={`block text-[6px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5 truncate ${active ? 'opacity-90' : (isDelay ? 'text-red-500' : isAdvance ? 'text-amber-500' : 'text-emerald-600')}`}>{type}</span>
      <div className={`text-[11px] sm:text-2xl font-black uppercase tracking-tighter leading-none truncate`}>{eff || '0%'}</div>
      <div className={`text-[7px] sm:text-[9px] font-bold opacity-70 uppercase mt-2 truncate tracking-tight`}>{count || 0} Trips</div>
    </button>
  );
}

function StatusBadge({ status, label }: { status: string, label: string }) {
  const isSuccess = status === 'OnTime';
  const isWarning = status === 'Advance';
  const isDanger = status === 'Delay';
  return (
    <div className={`inline-flex flex-col px-1.5 py-0.5 rounded-md text-[7px] sm:text-[10px] font-black tracking-widest border transition-all shadow-sm overflow-hidden ${isSuccess ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : isWarning ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : isDanger ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
      <span className="uppercase truncate max-w-[40px] sm:max-w-none">{status}</span>
      <span className="text-[6px] sm:text-[8px] opacity-60 truncate max-w-[40px] sm:max-w-[80px] font-black uppercase mt-0.5">{label || '-'}</span>
    </div>
  );
}

function ModalHeader({ title, onClose }: any) {
  return (
    <div className="flex items-center justify-between mb-6 sm:mb-10 w-full overflow-hidden">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 overflow-hidden">
        <div className="w-1 h-5 sm:w-2 sm:h-8 bg-blue-600 rounded-full shrink-0" />
        <h3 className="text-sm sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none truncate">{title}</h3>
      </div>
      <button onClick={onClose} className="p-1.5 sm:p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-all shrink-0">
        <X className="w-5 h-5 sm:w-7 sm:h-7" />
      </button>
    </div>
  );
}

function LegendItem({ color, label, isLine }: any) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 shrink-0 overflow-hidden">
      <div className={isLine ? `w-3 h-0.5 sm:w-5 sm:h-1 rounded-full shrink-0` : `w-2 h-2 sm:w-3.5 sm:h-3.5 rounded-sm sm:rounded-md shrink-0`} style={{ backgroundColor: color }} />
      <span className="text-[6px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</span>
    </div>
  );
}

function CustomTrendTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-2xl border border-slate-800 min-w-[110px] sm:min-w-[160px] overflow-hidden">
        <p className="text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1.5 truncate">{label}</p>
        <div className="space-y-1.5 overflow-hidden">
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-3 sm:gap-4 overflow-hidden">
              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: p.color || p.fill }} />
                <span className="text-[7px] sm:text-[10px] font-black text-slate-300 uppercase tracking-tight truncate">{p.name}</span>
              </div>
              <span className="text-[9px] sm:text-xs font-black text-white shrink-0">{p.value}{p.name === 'onTimeRate' ? '%' : ''}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}
