import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Leaf, Droplets, Fuel, DollarSign, Zap, TreePine, TrendingUp,
  Calendar, MapPin, Route as RouteIcon, Edit2, Check, X, ChevronDown,
  BarChart2, PieChart as PieIcon
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { fetchCarbonFootprintForDriver, CarbonSummary, treesEquivalent, fetchCarbonTrend } from '../services/carbonFootprintService';
import { fetchActiveDrivers } from '../services/dataFetcher';
import { Driver } from '../types';

const COLORS = ['#10b981', '#059669', '#047857', '#065f46'];

export default function CarbonNeutralPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [carbonData, setCarbonData] = useState<CarbonSummary | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendStartDate, setTrendStartDate] = useState(`${new Date().getFullYear()}-01-01`);
  const [trendEndDate, setTrendEndDate] = useState(() => new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [granularity, setGranularity] = useState<'daily' | 'monthly'>('monthly');
  const [trendMode, setTrendMode] = useState<'area' | 'driver'>('area');
  const [isLoading, setIsLoading] = useState(false);
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [driverDropdownOpen, setDriverDropdownOpen] = useState(false);
  const [areaPos, setAreaPos] = useState({ top: 0, left: 0, width: 0 });
  const [driverPos, setDriverPos] = useState({ top: 0, left: 0, width: 0 });
  const areaBtnRef = useRef<HTMLButtonElement>(null);
  const driverBtnRef = useRef<HTMLButtonElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);
  const driverDropdownRef = useRef<HTMLDivElement>(null);

  const areas = ['ALL', 'TAM', 'TMMIN', 'JBK', 'NGORO', 'SUMATERA'];

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (areaDropdownOpen && areaDropdownRef.current && !areaDropdownRef.current.contains(target) && areaBtnRef.current && !areaBtnRef.current.contains(target)) {
        setAreaDropdownOpen(false);
      }
      if (driverDropdownOpen && driverDropdownRef.current && !driverDropdownRef.current.contains(target) && driverBtnRef.current && !driverBtnRef.current.contains(target)) {
        setDriverDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [areaDropdownOpen, driverDropdownOpen]);

  // Load drivers on mount and when area/date changes
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const data = await fetchActiveDrivers(selectedDate, selectedArea);
        setDrivers(data);
        if (data.length > 0 && !selectedDriverId) {
          setSelectedDriverId(data[0].id);
        }
      } catch (error) {
        console.error('Error loading drivers in CarbonNeutral:', error);
        setDrivers([]);
      }
    };
    loadDrivers();
  }, [selectedDate, selectedArea]);

  // Load carbon data
  useEffect(() => {
    const loadCarbonData = async () => {
      if (!selectedDriverId) return;
      setIsLoading(true);
      const data = await fetchCarbonFootprintForDriver(selectedDate, selectedDriverId, selectedArea);
      setCarbonData(data);
      setIsLoading(false);
    };
    loadCarbonData();
  }, [selectedDate, selectedDriverId, selectedArea]);

  // Load trend data
  useEffect(() => {
    const loadTrend = async () => {
      const driverId = trendMode === 'driver' ? selectedDriverId : undefined;
      const data = await fetchCarbonTrend(selectedArea, trendStartDate, trendEndDate, granularity, driverId);
      setTrendData(data);
    };
    loadTrend();
  }, [trendStartDate, trendEndDate, selectedArea, granularity, trendMode, selectedDriverId]);

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end gap-4 w-full"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-end gap-4 w-full">
          {/* Date Picker */}
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 inline mr-2" />
              Tanggal
            </label>
            <input
              type="date"
              value={selectedDate}
              onClick={(e) => 'showPicker' in e.currentTarget && (e.currentTarget as any).showPicker()}
              onMouseDown={(e) => e.preventDefault()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all shadow-sm select-none"
            />
          </div>

          {/* Area Dropdown */}
          <div className="relative group min-w-0">
            <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 inline mr-2" />
              Area
            </label>
            <button
              ref={areaBtnRef}
              onClick={() => {
                if (areaBtnRef.current) {
                  const r = areaBtnRef.current.getBoundingClientRect();
                  const isMob = window.innerWidth < 640;
                  setAreaPos({ 
                    top: r.bottom + 8, 
                    left: isMob ? Math.max(8, r.left) : r.left,
                    width: Math.max(r.width, isMob ? window.innerWidth - 16 : 160)
                  });
                }
                setAreaDropdownOpen(!areaDropdownOpen);
              }}
              className="w-full sm:w-40 flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              <span className="truncate">{selectedArea}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${areaDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {areaDropdownOpen && createPortal(
              <div className="fixed inset-0 z-11000 pointer-events-none">
                <AnimatePresence>
                  <motion.div
                    ref={areaDropdownRef}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    style={{
                      position: 'fixed',
                      top: areaPos.top,
                      left: areaPos.left,
                      width: areaPos.width,
                      maxWidth: 320,
                    }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-auto"
                  >
                    {areas.map(area => (
                      <button
                        key={area}
                        onClick={() => { setSelectedArea(area); setAreaDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                          selectedArea === area
                            ? 'bg-green-500 text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>,
              document.body
            )}
          </div>

          {/* Driver Dropdown */}
          <div className="relative group lg:w-64">
            <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Driver
            </label>
            <button
              ref={driverBtnRef}
              onClick={() => {
                if (driverBtnRef.current) {
                  const r = driverBtnRef.current.getBoundingClientRect();
                  const isMob = window.innerWidth < 640;
                  setDriverPos({ 
                    top: r.bottom + 8, 
                    left: isMob ? Math.max(8, r.left) : r.left,
                    width: Math.max(r.width, isMob ? window.innerWidth - 16 : 256)
                  });
                }
                setDriverDropdownOpen(!driverDropdownOpen);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              <span className="truncate">
                {drivers.find(d => d.id === selectedDriverId)?.name || 'Pilih Driver'}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${driverDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {driverDropdownOpen && createPortal(
              <div className="fixed inset-0 z-11000 pointer-events-none">
                <AnimatePresence>
                  <motion.div
                    ref={driverDropdownRef}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    style={{
                      position: 'fixed',
                      top: driverPos.top,
                      left: driverPos.left,
                      width: driverPos.width,
                      maxWidth: 320,
                    }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-auto max-h-64 overflow-y-auto"
                  >
                    {drivers.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 italic">
                        No drivers available
                      </div>
                    ) : (
                      drivers.map(driver => (
                        <button
                          key={driver.id}
                          onClick={() => { setSelectedDriverId(driver.id); setDriverDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b border-slate-100 dark:border-slate-700 last:border-b-0 ${
                            selectedDriverId === driver.id
                              ? 'bg-green-500 text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{driver.name}</span>
                            {driver.noPolisi && <span className="text-[9px] ml-2 px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded truncate shrink-0">{driver.noPolisi}</span>}
                          </div>
                        </button>
                      ))
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>,
              document.body
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          </motion.div>
        ) : carbonData && selectedDriver ? (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard
                icon={Leaf}
                label="Total CO₂"
                value={carbonData.totalCO2.toFixed(2)}
                unit="kg"
                color="text-green-600"
                bgColor="bg-green-50 dark:bg-green-900/20"
              />
              <SummaryCard
                icon={TreePine}
                label="Trees Equivalent"
                value={treesEquivalent(carbonData.totalCO2).toFixed(2)}
                unit="pohon"
                color="text-green-600"
                bgColor="bg-green-50 dark:bg-green-900/20"
              />
              <SummaryCard
                icon={Fuel}
                label="Fuel Used"
                value={carbonData.totalFuel.toFixed(2)}
                unit="L"
                color="text-orange-600"
                bgColor="bg-orange-50 dark:bg-orange-900/20"
              />
              <SummaryCard
                icon={DollarSign}
                label="Fuel Cost"
                value={(carbonData.totalCost / 1000).toFixed(1)}
                unit="Rb"
                color="text-red-600"
                bgColor="bg-red-50 dark:bg-red-900/20"
              />
            </div>
            
            {/* Monthly Trend Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-widest">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Tren Emisi CO₂
                  </h3>
                  
                  {/* Mode Toggle */}
                  <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800 rounded-xl">
                    <button
                      onClick={() => setTrendMode('area')}
                      className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                        trendMode === 'area' 
                          ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Per Area ({selectedArea})
                    </button>
                    <button
                      disabled={!selectedDriverId}
                      onClick={() => setTrendMode('driver')}
                      className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-30 ${
                        trendMode === 'driver' 
                          ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Per Driver ({selectedDriver?.name?.split(' ')[0] || 'Selected'})
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Granularity Toggle */}
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      onClick={() => setGranularity('daily')}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        granularity === 'daily' 
                          ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Harian
                    </button>
                    <button
                      onClick={() => setGranularity('monthly')}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        granularity === 'monthly' 
                          ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Bulanan
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={trendStartDate}
                      onChange={(e) => setTrendStartDate(e.target.value)}
                      className="px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg border-none focus:ring-1 focus:ring-green-500"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      type="date"
                      value={trendEndDate}
                      onChange={(e) => setTrendEndDate(e.target.value)}
                      className="px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg border-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={420}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#94a3b8" 
                    tick={{ fontSize: 10, fontWeight: 'bold' }} 
                    axisLine={false} 
                    tickLine={false} 
                    interval={granularity === 'daily' ? 'preserveStartEnd' : 0}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    tick={{ fontSize: 10, fontWeight: 'bold' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatValue}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderColor: '#e2e8f0', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                    itemStyle={{ color: '#1e293b' }}
                    formatter={(value: number) => [`${formatValue(value)} CO₂`, 'Total Emisi']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="co2" 
                    stroke="#10b981" 
                    strokeWidth={4}
                    name="CO₂ (kg)" 
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Emissions Bar Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50 shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-orange-500" />
                  CO₂ per Ritase
                </h3>
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={carbonData.footprints}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="ritaseNo" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Bar dataKey="co2Emissions" fill="#f59e0b" name="CO₂ (kg)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Emissions Pie Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50 shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-emerald-500" />
                  Kontribusi CO₂
                </h3>
                <ResponsiveContainer width="100%" height={420}>
                  <PieChart>
                    <Pie
                      data={carbonData.footprints}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ ritaseNo, co2Emissions }: any) => `${ritaseNo}: ${co2Emissions.toFixed(1)}kg`}
                      outerRadius={120}
                      dataKey="co2Emissions"
                    >
                      {carbonData.footprints.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Detailed Ritase Table with Edit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50 overflow-x-auto"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Detail Ritase & Carbon Footprint
              </h3>

              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Ritase</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Rute</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Jarak (km)</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">CO₂ (kg)</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Bahan Bakar (L)</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Biaya (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {carbonData.footprints.map((footprint, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {footprint.ritaseNo}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                        {footprint.route}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-slate-900 dark:text-slate-100 font-medium">
                          {footprint.distance.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-semibold">
                        {footprint.co2Emissions.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-orange-600 dark:text-orange-400 font-semibold">
                        {footprint.fuelConsumption.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold">
                        Rp {(footprint.cost / 1000).toFixed(0)}k
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl p-6"
            >
              <h4 className="font-bold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Informasi Carbon Footprint
              </h4>
              <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                <li>• CO₂ dihitung berdasarkan standar Heavy Truck Car Carrier (~880g CO₂/km)</li>
                <li>• Jarak dihitung otomatis <b>BOLAK-BALIK (x2)</b> (Pool → PDC → Tujuan → Pool)</li>
                <li>• Estimasi konsumsi bahan bakar 1 liter untuk 3 km (33 L/100km)</li>
                <li>• 1 pohon menyerap ~20kg CO₂ per tahun</li>
                <li>• Biaya bahan bakar menggunakan rata-rata harga Rp 6.800/liter</li>
              </ul>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Leaf className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Pilih driver untuk melihat carbon footprint</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const formatValue = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)} jt`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)} rb`;
  return val.toString();
};

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  color: string;
  bgColor: string;
}

function SummaryCard({ icon: Icon, label, value, unit, color, bgColor }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${bgColor} rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>
            {value} <span className="text-lg">{unit}</span>
          </p>
        </div>
        <Icon className={`w-10 h-10 ${color} opacity-20`} />
      </div>
    </motion.div>
  );
}
