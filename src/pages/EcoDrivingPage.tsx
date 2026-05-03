import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Activity, Calendar, MapPin, Map, Leaf, ChevronDown,
  ChevronLeft, ChevronRight, BarChart3, AlertTriangle, AlertCircle, Filter, FilterX, Route
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchEcoViolations, computeDriverRankings, computeViolationsByDate, EcoViolation } from '../services/ecoDataFetcher';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Marker Icons for different violation types
const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const iconMap = {
  'Akselerasi Mendadak': createCustomIcon('#1e3a8a'), // navy
  'Perlambatan Mendadak': createCustomIcon('#3b82f6'), // blue-medium
  'Kecepatan Melebihi Batas': createCustomIcon('#60a5fa'), // blue-light
  'Tikungan Tajam': createCustomIcon('#93c5fd'), // blue-young
  'default': createCustomIcon('#64748b'), // slate-500
};

// Map Bounds Updater Component
const MapUpdater = ({ violations }: { violations: EcoViolation[] }) => {
  const map = useMap();
  useEffect(() => {
    if (violations.length > 0) {
      const validCoords = violations.map(v => {
        if (v.koordinat) {
          const parts = v.koordinat.split(',');
          if (parts.length === 2) {
            const lat = parseFloat(parts[0].trim());
            const lng = parseFloat(parts[1].trim());
            if (!isNaN(lat) && !isNaN(lng)) return [lat, lng] as [number, number];
          }
        }
        return null;
      }).filter(Boolean) as [number, number][];

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [violations, map]);
  return null;
};


export default function EcoDrivingPage() {
  const [filterMode, setFilterMode] = useState<'month' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]); 
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState('ALL');
  const [violations, setViolations] = useState<EcoViolation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Custom Dropdown State
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const customerRef = useRef<HTMLDivElement>(null);
  
  // Cross-Filtering State
  const [cfDriver, setCfDriver] = useState<string | null>(null);
  const [cfType, setCfType] = useState<string | null>(null);
  const [cfDate, setCfDate] = useState<string | null>(null);
  
  // Pagination
  const [rankPage, setRankPage] = useState(1);
  const rankPerPage = 10;

  useEffect(() => {
    loadData();
  }, [filterMode, selectedMonth, startDate, endDate, selectedArea, selectedCustomer]);

  // Handle clicking outside custom dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (areaRef.current && !areaRef.current.contains(event.target as Node)) setAreaDropdownOpen(false);
      if (customerRef.current && !customerRef.current.contains(event.target as Node)) setCustomerDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear cross-filters when main data changes
  useEffect(() => {
    setCfDriver(null);
    setCfType(null);
    setCfDate(null);
  }, [violations]);

  const getMonthFilter = () => {
    const monthMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (filterMode === 'month') {
      const d = new Date(selectedMonth + '-01');
      return `%-${monthMap[d.getMonth()]}-${d.getFullYear().toString().slice(-2)}`;
    } else {
      const d1 = new Date(startDate);
      const d2 = new Date(endDate);
      if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
        return `%-${monthMap[d1.getMonth()]}-${d1.getFullYear().toString().slice(-2)}`;
      }
      return undefined; // span months
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    const mFilter = getMonthFilter();
    
    const rawData = await fetchEcoViolations({
      area: selectedArea,
      customer: selectedCustomer,
      monthFilter: mFilter
    });
    
    const filtered = rawData.filter(v => {
      if (!v.tanggal) return false;
      const parts = v.tanggal.split('-');
      if (parts.length !== 3) return false;
      const monthMap: any = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
      const d = new Date(2000 + parseInt(parts[2]), monthMap[parts[1]], parseInt(parts[0]));
      
      if (filterMode === 'month') {
        const target = new Date(selectedMonth + '-01');
        return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
      } else {
        const start = new Date(startDate); start.setHours(0,0,0,0);
        const end = new Date(endDate); end.setHours(23,59,59,999);
        return d >= start && d <= end;
      }
    }).map(v => {
      // Data Pre-Processing Optimization: Calculate types once on load to avoid string scanning on every filter click
      const j = v.jenis_peringatan?.toLowerCase() || '';
      let optType = 'Lainnya';
      if (j.includes('akselerasi')) optType = 'Akselerasi';
      else if (j.includes('perlambatan')) optType = 'Perlambatan';
      else if (j.includes('kecepatan')) optType = 'Kecepatan';
      else if (j.includes('tikungan')) optType = 'Tikungan';
      return { ...v, _optimizedType: optType };
    });
    
    setViolations(filtered);
    setIsLoading(false);
    setRankPage(1);
  };


  const checkFilter = (v: any, checkDriver: boolean, checkType: boolean, checkDate: boolean) => {
    if (checkDriver && cfDriver && v.pengemudi !== cfDriver) return false;
    if (checkDate && cfDate && !v.tanggal.startsWith(cfDate)) return false;
    if (checkType && cfType && v._optimizedType !== cfType) return false;
    return true;
  };

  // Fully filtered for the Map & Total incident count
  const activeViolations = useMemo(() => violations.filter(v => checkFilter(v, true, true, true)), [violations, cfDriver, cfType, cfDate]);
  
  // For Driver Rankings / Top 10 (ignores cfDriver so context remains)
  const driverViolations = useMemo(() => violations.filter(v => checkFilter(v, false, true, true)), [violations, cfType, cfDate]);
  const rankings = useMemo(() => computeDriverRankings(driverViolations), [driverViolations]);
  
  // For Daily Trend Chart (ignores cfDate so context remains)
  const dateViolations = useMemo(() => violations.filter(v => checkFilter(v, true, true, false)), [violations, cfDriver, cfType]);
  const dateTrend = useMemo(() => computeViolationsByDate(dateViolations), [dateViolations]);
  
  // For Pie Chart & Scorecards (ignores cfType so context remains)
  const typeViolations = useMemo(() => violations.filter(v => checkFilter(v, true, false, true)), [violations, cfDriver, cfDate]);
  
  // Prepare data for Pie Chart
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    typeViolations.forEach(v => {
      const type = v._optimizedType || 'Lainnya';
      counts[type] = (counts[type] || 0) + 1;
    });
    const colors: any = { 'Akselerasi': '#1e3a8a', 'Perlambatan': '#3b82f6', 'Kecepatan': '#60a5fa', 'Tikungan': '#93c5fd', 'Lainnya': '#64748b' };
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: colors[name] }));
  }, [typeViolations]);

  // Prepare data for Driver Bar Chart
  const driverBarData = useMemo(() => {
    return rankings.slice(0, 10).map((r, i) => ({
      name: r.driver.split(' ')[0] + '\u200B'.repeat(i), // Zero-width space trick for unique keys
      fullName: r.driver,
      total: r.total
    }));
  }, [rankings]);

  const totalViolations = activeViolations.length;
  
  const countType = (typeStr: string) => typeViolations.filter(v => {
    const t = v._optimizedType?.toLowerCase() || '';
    return typeStr === 'perlambatan' ? t === 'perlambatan' : t === typeStr;
  }).length;

  return (
    <div className="space-y-6 pb-20">
      {/* ── HEADER & FILTERS ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <Leaf className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Eco Driving</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fleet Safety Analytics</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Filter Toggle Mode */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto shadow-inner shrink-0">
              <button
                onClick={() => setFilterMode('month')}
                className={`flex-1 sm:w-24 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  filterMode === 'month' 
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Bulan
              </button>
              <button
                onClick={() => setFilterMode('range')}
                className={`flex-1 sm:w-24 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  filterMode === 'range' 
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Tanggal
              </button>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3 w-full sm:w-auto">
              {filterMode === 'month' ? (
                <div className="relative group w-full sm:w-auto">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    onClick={(e) => 'showPicker' in e.currentTarget && (e.currentTarget as any).showPicker()}
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-full sm:w-auto pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/50 outline-none uppercase tracking-widest transition-all cursor-pointer shadow-sm select-none"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={(e) => 'showPicker' in e.currentTarget && (e.currentTarget as any).showPicker()}
                    onMouseDown={(e) => e.preventDefault()}
                    className="flex-1 sm:w-auto sm:flex-none px-2 py-1 bg-transparent text-[10px] font-black text-slate-700 dark:text-slate-300 outline-none uppercase tracking-widest cursor-pointer select-none"
                  />
                  <span className="text-slate-400 font-bold text-xs">-</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onClick={(e) => 'showPicker' in e.currentTarget && (e.currentTarget as any).showPicker()}
                    onMouseDown={(e) => e.preventDefault()}
                    className="flex-1 sm:w-auto sm:flex-none px-2 py-1 bg-transparent text-[10px] font-black text-slate-700 dark:text-slate-300 outline-none uppercase tracking-widest cursor-pointer select-none"
                  />
                </div>
              )}

              {/* Custom Area Dropdown */}
              <div className="relative group w-full sm:w-auto" ref={areaRef}>
                <button
                  onClick={() => setAreaDropdownOpen(!areaDropdownOpen)}
                  className="w-full sm:w-36 flex items-center justify-between pl-4 pr-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-slate-700 dark:text-slate-300 outline-none uppercase tracking-widest transition-all shadow-sm"
                >
                  <span className="truncate">{selectedArea === 'ALL' ? 'Semua Area' : selectedArea}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </button>
                <AnimatePresence>
                  {areaDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 py-1"
                    >
                      {[
                        { val: 'ALL', label: 'Semua Area' },
                        { val: 'JBK', label: 'JBK' },
                        { val: 'NGORO', label: 'NGORO' },
                        { val: 'SUMATERA', label: 'SUMATERA' },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => { setSelectedArea(opt.val); setAreaDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${selectedArea === opt.val ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Custom Customer Dropdown */}
              <div className="relative group w-full sm:w-auto" ref={customerRef}>
                <button
                  onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                  className="w-full sm:w-40 flex items-center justify-between pl-4 pr-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-slate-700 dark:text-slate-300 outline-none uppercase tracking-widest transition-all shadow-sm"
                >
                  <span className="truncate">{selectedCustomer === 'ALL' ? 'Semua Customer' : selectedCustomer}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </button>
                <AnimatePresence>
                  {customerDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 py-1"
                    >
                      {[
                        { val: 'ALL', label: 'Semua Customer' },
                        { val: 'TMMIN', label: 'TMMIN' },
                        { val: 'TAM', label: 'TAM' },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => { setSelectedCustomer(opt.val); setCustomerDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${selectedCustomer === opt.val ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Filter Indicator */}
      {(cfDriver || cfType || cfDate) && (
        <div className="flex flex-wrap items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <Filter className="w-4 h-4 shrink-0" />
          <span>Active Filter:</span>
          {cfDriver && <span className="bg-white dark:bg-emerald-900/50 px-2 py-1 rounded-lg shadow-sm">Driver: {cfDriver}</span>}
          {cfType && <span className="bg-white dark:bg-emerald-900/50 px-2 py-1 rounded-lg shadow-sm">Tipe: {cfType}</span>}
          {cfDate && <span className="bg-white dark:bg-emerald-900/50 px-2 py-1 rounded-lg shadow-sm">Tanggal: {cfDate}</span>}
          <button 
            onClick={() => { setCfDriver(null); setCfType(null); setCfDate(null); }}
            className="ml-auto underline hover:text-emerald-900 dark:hover:text-emerald-300 whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Analyzing Safety Data...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* ── SUMMARY STATS ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 hover:border-emerald-500 transition-colors cursor-pointer" onClick={() => { setCfDriver(null); setCfType(null); setCfDate(null); }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pelanggaran</p>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{totalViolations}</p>
              </div>
              <div className={`bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border transition-colors cursor-pointer ${cfType === 'Akselerasi' ? 'border-blue-800 ring-2 ring-blue-800/20' : 'border-slate-100 dark:border-slate-800 hover:border-blue-800'}`} onClick={() => setCfType(cfType === 'Akselerasi' ? null : 'Akselerasi')}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akselerasi</p>
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-900 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{countType('akselerasi')}</p>
              </div>
              <div className={`bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border transition-colors cursor-pointer ${cfType === 'Perlambatan' ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-100 dark:border-slate-800 hover:border-blue-600'}`} onClick={() => setCfType(cfType === 'Perlambatan' ? null : 'Perlambatan')}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rem Mendadak</p>
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{countType('perlambatan')}</p>
              </div>
              <div className={`bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border transition-colors cursor-pointer ${cfType === 'Kecepatan' ? 'border-blue-400 ring-2 ring-blue-400/20' : 'border-slate-100 dark:border-slate-800 hover:border-blue-400'}`} onClick={() => setCfType(cfType === 'Kecepatan' ? null : 'Kecepatan')}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overspeed</p>
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{countType('kecepatan')}</p>
              </div>
              <div className={`bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border transition-colors cursor-pointer ${cfType === 'Tikungan' ? 'border-blue-300 ring-2 ring-blue-300/20' : 'border-slate-100 dark:border-slate-800 hover:border-blue-300'}`} onClick={() => setCfType(cfType === 'Tikungan' ? null : 'Tikungan')}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tikungan Tajam</p>
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-300 flex items-center justify-center">
                    <Route className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{countType('tikungan')}</p>
              </div>
            </div>

            {/* ── CHARTS SECTION ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Trend Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Pelanggaran per Hari</h3>
                <div className="h-72 w-full focus:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none" style={{ outline: 'none' }}>
                  <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" style={{ outline: 'none' }}>
                    <BarChart 
                      data={dateTrend} 
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      style={{ outline: 'none' }}
                      className="cursor-pointer focus:outline-none"
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                        tickFormatter={(val) => {
                          const d = new Date(val);
                          return isNaN(d.getTime()) ? val : d.getDate().toString();
                        }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1">{label}</p>
                                {payload.map((entry, index) => (
                                  Number(entry.value) > 0 && (
                                    <div key={index} className="flex items-center gap-2 mb-1">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{entry.name}: {entry.value}</span>
                                    </div>
                                  )
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="akselerasi" name="Akselerasi" stackId="a" radius={[0, 0, 0, 0]} activeBar={false}
                        onClick={(data: any) => setCfDate(cfDate === data.payload.date ? null : data.payload.date)} 
                      >
                        {dateTrend.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#1e3a8a" opacity={cfDate && cfDate !== entry.date ? 0.3 : 1} />
                        ))}
                      </Bar>
                      <Bar 
                        dataKey="perlambatan" name="Perlambatan" stackId="a" radius={[0, 0, 0, 0]} activeBar={false}
                        onClick={(data: any) => setCfDate(cfDate === data.payload.date ? null : data.payload.date)} 
                      >
                        {dateTrend.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#3b82f6" opacity={cfDate && cfDate !== entry.date ? 0.3 : 1} />
                        ))}
                      </Bar>
                      <Bar 
                        dataKey="kecepatan" name="Kecepatan" stackId="a" radius={[0, 0, 0, 0]} activeBar={false}
                        onClick={(data: any) => setCfDate(cfDate === data.payload.date ? null : data.payload.date)} 
                      >
                        {dateTrend.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#60a5fa" opacity={cfDate && cfDate !== entry.date ? 0.3 : 1} />
                        ))}
                      </Bar>
                      <Bar 
                        dataKey="tikungan" name="Tikungan" stackId="a" radius={[4, 4, 0, 0]} activeBar={false}
                        onClick={(data: any) => setCfDate(cfDate === data.payload.date ? null : data.payload.date)} 
                      >
                        {dateTrend.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#93c5fd" opacity={cfDate && cfDate !== entry.date ? 0.3 : 1} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Persentase Pelanggaran</h3>
                <div className="h-64 w-full focus:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none" style={{ outline: 'none' }}>
                  <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" style={{ outline: 'none' }}>
                    <PieChart style={{ outline: 'none' }} className="focus:outline-none">
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        onClick={(data) => setCfType(cfType === data.name ? null : data.name)}
                        className="cursor-pointer outline-none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} opacity={cfType && cfType !== entry.name ? 0.3 : 1} className="hover:opacity-80 transition-opacity" />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const val = Number(payload[0].value);
                            const total = pieData.reduce((acc, curr) => acc + curr.value, 0);
                            const percentage = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
                            return (
                              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                                <div>
                                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">{payload[0].name}</p>
                                  <p className="text-sm font-black text-slate-900 dark:text-white">{percentage}% <span className="text-[10px] text-slate-500 font-bold">({val} kasus)</span></p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full mt-4 flex flex-wrap justify-center gap-3">
                  {pieData.map((entry, idx) => (
                    <div key={idx} className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${cfType && cfType !== entry.name ? 'opacity-30' : 'opacity-100 hover:opacity-80'}`} onClick={() => setCfType(cfType === entry.name ? null : entry.name)}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── MAP & RANKING SECTION ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map View */}
              <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 lg:col-span-2 flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Peta Persebaran Pelanggaran</h3>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      Showing <span className="text-emerald-600">{Math.min(activeViolations.length, 1000)}</span> 
                      {activeViolations.length > 1000 ? ` of ${activeViolations.length}` : ''} incidents
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 min-h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-0">
                  <MapContainer 
                    center={[-2.5489, 118.0149]} 
                    zoom={5} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    <MapUpdater violations={activeViolations} />
                    
                    <MarkerClusterGroup
                      chunkedLoading
                      maxClusterRadius={40}
                      showCoverageOnHover={false}
                    >
                      {activeViolations.slice(0, 1000).map((v, i) => {
                        if (!v.koordinat) return null;
                        const parts = v.koordinat.split(',');
                        if (parts.length !== 2) return null;
                        const lat = parseFloat(parts[0].trim());
                        const lng = parseFloat(parts[1].trim());
                        if (isNaN(lat) || isNaN(lng)) return null;

                        const iconKey = v.jenis_peringatan || 'default';
                        let selectedIcon = iconMap['default'];
                        if (iconKey.includes('Akselerasi')) selectedIcon = iconMap['Akselerasi Mendadak'];
                        else if (iconKey.includes('Perlambatan')) selectedIcon = iconMap['Perlambatan Mendadak'];
                        else if (iconKey.includes('Kecepatan')) selectedIcon = iconMap['Kecepatan Melebihi Batas'];
                        else if (iconKey.includes('Tikungan')) selectedIcon = iconMap['Tikungan Tajam'];

                        return (
                          <Marker 
                            key={`marker-${i}`} 
                            position={[lat, lng]}
                            icon={selectedIcon}
                            eventHandlers={{
                              click: (e) => {
                                const m = e.target._map;
                                if (m) {
                                  if (m.getZoom() < 16) {
                                    m.flyTo([lat, lng], 16, { duration: 1.2 });
                                  } else {
                                    m.panTo([lat, lng]);
                                  }
                                }
                              }
                            }}
                          >
                            <Popup className="custom-popup">
                              <div className="p-1 min-w-[200px]">
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase mb-2 ${
                                  iconKey.includes('Akselerasi') ? 'bg-blue-900 text-blue-100' :
                                  iconKey.includes('Perlambatan') ? 'bg-blue-600 text-blue-50' :
                                  iconKey.includes('Kecepatan') ? 'bg-blue-400 text-blue-900' :
                                  'bg-blue-200 text-blue-800'
                                }`}>{v.jenis_peringatan}</span>
                                <p className="text-[10px] text-slate-500 font-bold line-clamp-2">{v.lokasi}</p>
                                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{v.pengemudi}</span>
                                  <span className="text-[9px] font-bold text-slate-400">{v.tanggal}</span>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                    </MarkerClusterGroup>
                  </MapContainer>
                </div>
              </div>

              {/* Ranking Table */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                <div className="p-6 md:p-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    Driver Rankings
                  </h3>
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 shadow-sm">
                        <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest">Rank</th>
                        <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest">Driver</th>
                        <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {rankings.slice((rankPage - 1) * rankPerPage, rankPage * rankPerPage).map((r, i) => {
                        const rankNum = (rankPage - 1) * rankPerPage + i + 1;
                        return (
                          <tr 
                            key={i} 
                            onClick={() => setCfDriver(cfDriver === r.driver ? null : r.driver)}
                            className={`transition-colors cursor-pointer ${cfDriver === r.driver ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                          >
                            <td className="px-6 py-3">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black ${
                                rankNum === 1 ? 'bg-red-100 text-red-600' :
                                rankNum === 2 ? 'bg-orange-100 text-orange-600' :
                                rankNum === 3 ? 'bg-amber-100 text-amber-600' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}>
                                {rankNum}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <p className={`font-black ${cfDriver === r.driver ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{r.driver}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{r.plat}</p>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <span className="font-black text-slate-900 dark:text-white text-sm">{r.total}</span>
                            </td>
                          </tr>
                        );
                      })}
                      {rankings.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-bold italic">
                            No violations found for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {rankings.length > rankPerPage && (
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                      Total: {rankings.length}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        disabled={rankPage === 1}
                        onClick={() => setRankPage(p => p - 1)}
                        className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm disabled:opacity-50 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        disabled={rankPage >= Math.ceil(rankings.length / rankPerPage)}
                        onClick={() => setRankPage(p => p + 1)}
                        className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm disabled:opacity-50 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── TOP 10 VIOLATORS (FULL WIDTH) ── */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 mt-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  Top 10 Violators
                </h3>
              </div>
              <div className="h-[350px] w-full focus:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none" style={{ outline: 'none' }}>
                <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" style={{ outline: 'none' }}>
                  <BarChart data={driverBarData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }} style={{ outline: 'none' }} className="focus:outline-none">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.3} />
                    <XAxis 
                      type="number"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                      width={80}
                    />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1">{payload[0].payload.fullName}</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white">{payload[0].value} <span className="text-xs text-slate-500">Pelanggaran</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="total" 
                      radius={[0, 6, 6, 0]} 
                      activeBar={false}
                      onClick={(data: any) => setCfDriver(cfDriver === data.fullName ? null : data.fullName)}
                      className="cursor-pointer focus:outline-none"
                      style={{ outline: 'none' }}
                    >
                      {driverBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={cfDriver === entry.fullName ? '#1e40af' : cfDriver ? '#bfdbfe' : '#3b82f6'} className="hover:opacity-80 transition-opacity focus:outline-none" style={{ outline: 'none' }}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
