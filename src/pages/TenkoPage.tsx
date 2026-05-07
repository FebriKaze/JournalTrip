import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, Heart, Thermometer, Wine, Eye, Moon, AlertCircle,
  Calendar, MapPin, Search, ChevronDown, CheckCircle2, XCircle,
  TrendingUp, BarChart3, PieChart as PieIcon, ClipboardList
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Area
} from 'recharts';
import { fetchTenkoData, fetchTenkoTrend, TenkoSummary, TenkoRecord } from '../services/tenkoService';

const COLORS = {
  normal: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  neutral: '#94a3b8'
};

const TENSI_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function TenkoPage() {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [summary, setSummary] = useState<TenkoSummary | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const areas = ['ALL', 'TAM', 'TMMIN', 'JBK', 'NGORO', 'SUMATERA'];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [dataSummary, trend] = await Promise.all([
        fetchTenkoData(startDate, endDate, selectedArea),
        fetchTenkoTrend(startDate, endDate, selectedArea)
      ]);
      setSummary(dataSummary);
      setTrendData(trend);
      setIsLoading(false);
    };
    loadData();
  }, [startDate, endDate, selectedArea]);

  const filteredRecords = useMemo(() => {
    if (!summary?.raw) return [];
    return summary.raw.filter(r => 
      r.driver_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nopol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [summary, searchQuery]);

  const tensiPieData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Normal', value: summary.tensi.normal },
      { name: 'Hipotensi', value: summary.tensi.hipotensi },
      { name: 'Hipertensi', value: summary.tensi.hipertensi }
    ];
  }, [summary]);

  return (
    <div className="space-y-8 pb-20 px-1">
      {/* ── UNDER DEVELOPMENT BANNER ── */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3"
      >
        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Dalam proses develop</p>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
            Halaman Tenko sedang dalam tahap develop ya
          </p>
        </div>
      </motion.div>

      {/* ── HEADER & FILTERS ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-blue-500/5"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Tenko Daily Dashboard</h1>
              <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-1 uppercase tracking-widest">
                <ClipboardList className="w-3 h-3" /> Driver Health & Safety Check
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/50">
              <Calendar className="w-4 h-4 text-blue-500 ml-2" />
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-[11px] font-black focus:ring-0 text-slate-700 dark:text-slate-200" 
              />
              <span className="text-slate-400 font-bold">-</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-[11px] font-black focus:ring-0 text-slate-700 dark:text-slate-200" 
              />
            </div>

            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
              <select 
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer uppercase transition-all shadow-sm"
              >
                {areas.map(a => <option key={a} value={a}>{a === 'ALL' ? 'ALL AREA' : a}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Activity} 
          label="Total Checkups" 
          value={summary?.totalCheckups || 0} 
          sub="Drivers verified"
          color="text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <StatCard 
          icon={Heart} 
          label="Abnormal Tensi" 
          value={(summary?.tensi.hipertensi || 0) + (summary?.tensi.hipotensi || 0)} 
          sub="Requires monitoring"
          color="text-red-500"
          bgColor="bg-red-500/10"
          trend={summary ? `${((((summary.tensi.hipertensi + summary.tensi.hipotensi) / summary.totalCheckups) || 0) * 100).toFixed(1)}%` : '0%'}
        />
        <StatCard 
          icon={Thermometer} 
          label="Body Temp Alert" 
          value={summary?.suhu.demam || 0} 
          sub="Over 37.5°C"
          color="text-orange-500"
          bgColor="bg-orange-500/10"
        />
        <StatCard 
          icon={Wine} 
          label="Alcohol Check" 
          value={summary?.alkohol.positif || 0} 
          sub="Positive cases"
          color={summary?.alkohol.positif ? 'text-red-600' : 'text-emerald-500'}
          bgColor={summary?.alkohol.positif ? 'bg-red-500/10' : 'bg-emerald-500/10'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ── TENSI ANALYSIS ── */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" /> Blood Pressure Analysis
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Daily Systolic & Diastolic Monitoring</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#10b981]" /><span className="text-[10px] font-black text-slate-400 uppercase">Normal</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#f59e0b]" /><span className="text-[10px] font-black text-slate-400 uppercase">Hipo</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ef4444]" /><span className="text-[10px] font-black text-slate-400 uppercase">Hiper</span></div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                  tickFormatter={(val: string) => val.split('-').slice(1).reverse().join('/')}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="normal" stackId="a" fill={COLORS.normal} barSize={40} radius={[0, 0, 0, 0]} />
                <Bar dataKey="hipotensi" stackId="a" fill={COLORS.warning} barSize={40} />
                <Bar dataKey="hipertensi" stackId="a" fill={COLORS.danger} barSize={40} radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── DISTRIBUTION PIE ── */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center justify-center"
        >
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8 text-center">Tensi Percentage</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tensiPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {tensiPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TENSI_COLORS[index % TENSI_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{summary?.totalCheckups || 0}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase">Total Cek</span>
            </div>
          </div>
          <div className="grid grid-cols-1 w-full gap-2 mt-8">
            {tensiPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TENSI_COLORS[idx] }} />
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── SECONDARY HEALTH GRIDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Suhu & Alcohol Grid */}
        <div className="space-y-8">
          <HealthMiniCard 
            title="Body Temperature" 
            icon={Thermometer} 
            data={[
              { label: 'Normal (< 37.5°C)', value: summary?.suhu.normal || 0, color: 'bg-emerald-500' },
              { label: 'Demam (≥ 37.5°C)', value: summary?.suhu.demam || 0, color: 'bg-red-500' }
            ]} 
          />
          <HealthMiniCard 
            title="Alcohol Screening" 
            icon={Wine} 
            data={[
              { label: 'Negative (0%)', value: summary?.alkohol.negatif || 0, color: 'bg-emerald-500' },
              { label: 'Positive (> 0%)', value: summary?.alkohol.positif || 0, color: 'bg-red-600' }
            ]} 
          />
        </div>

        {/* Fatigue & Rest Time Grid */}
        <div className="space-y-8">
          <HealthMiniCard 
            title="Fatigue Status" 
            icon={Moon} 
            data={[
              { label: 'Normal / Fit', value: summary?.fatigue.normal || 0, color: 'bg-blue-500' },
              { label: 'Fatigue / Lelah', value: summary?.fatigue.lelah || 0, color: 'bg-orange-500' }
            ]} 
          />
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" /> Eyes & Focus
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                <p className="text-2xl font-black text-emerald-600">{(summary?.totalCheckups || 0) - (summary?.raw.filter(r => r.mata !== 'OK').length || 0)}</p>
                <p className="text-[10px] font-black text-emerald-600 uppercase mt-1 tracking-widest">Vision OK</p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
                <p className="text-2xl font-black text-red-600">{summary?.raw.filter(r => r.mata !== 'OK').length || 0}</p>
                <p className="text-[10px] font-black text-red-600 uppercase mt-1 tracking-widest">Abnormal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DETAILED TABLE ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-blue-500/5"
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Tenko Detailed Records</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Individual checkup results list</p>
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari driver atau nopol..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-blue-500 shadow-inner uppercase" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">Driver & Vehicle</th>
                <th className="px-6 py-5">Tensi (BP)</th>
                <th className="px-6 py-5">Temp & Pulse</th>
                <th className="px-6 py-5">SPO2 & Rest</th>
                <th className="px-6 py-5">Safety Status</th>
                <th className="px-8 py-5 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all">
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{r.driver_name}</p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">{r.nopol} • {r.no_lambung}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${
                        r.sistolik >= 140 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {r.tensi}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">mmHg</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{r.suhu_tubuh}°C</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{r.denyut_nadi} BPM</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{r.oxygen_saturation}% O₂</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{r.rest_time}h Rest</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <StatusBadge label="Alc" ok={r.alkohol === '0%' || r.alkohol?.toLowerCase().includes('negatif')} />
                      <StatusBadge label="Eye" ok={r.mata === 'OK'} />
                      <StatusBadge label="Fat" ok={r.fatigue === 'NORMAL'} />
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {r.sistolik < 150 && r.suhu_tubuh < 37.8 && r.alkohol.includes('0') ? (
                      <span className="flex items-center justify-end gap-1.5 text-[10px] font-black text-emerald-500 uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5" /> FIT TO DRIVE
                      </span>
                    ) : (
                      <span className="flex items-center justify-end gap-1.5 text-[10px] font-black text-red-500 uppercase">
                        <AlertCircle className="w-3.5 h-3.5" /> UNFIT
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bgColor, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && (
          <span className="text-[10px] font-black px-2 py-1 bg-red-500/10 text-red-500 rounded-lg">{trend}</span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-black text-slate-900 dark:text-white mt-1`}>{value}</p>
        <p className="text-[10px] font-bold text-slate-500 mt-1">{sub}</p>
      </div>
    </motion.div>
  );
}

function HealthMiniCard({ title, icon: Icon, data }: any) {
  return (
    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-500" /> {title}
      </h3>
      <div className="space-y-4">
        {data.map((item: any, idx: number) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
              <span className="text-slate-400">{item.label}</span>
              <span className="text-slate-900 dark:text-white">{item.value}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / (data[0].value + data[1].value)) * 100}%` }}
                className={`h-full ${item.color}`} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ label, ok }: { label: string, ok: boolean }) {
  return (
    <div className={`px-2 py-1 rounded-lg flex items-center gap-1 border ${
      ok ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'
    }`}>
      <span className="text-[8px] font-black uppercase">{label}</span>
      {ok ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">{p.name}</span>
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white">{p.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}
