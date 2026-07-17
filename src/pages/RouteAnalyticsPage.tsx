import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ship, MapPin, Calendar, ChevronDown, ArrowRight } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { leadtimeService, LeadTimeData } from '../services/leadtimeService';

const TABS = ['SUMATERA', 'NGORO', 'JBK', 'TMMIN'] as const;
type Tab = typeof TABS[number];

export default function RouteAnalyticsPage({ isTAM = false }: { isTAM?: boolean }) {
  const [activeTab, setActiveTab] = useState<Tab>('SUMATERA');
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, activeTab]);

  useEffect(() => {
    if (activeTab === 'SUMATERA') loadData();
    else setData([]);
  }, [loadData, activeTab]);

  const timeToMin = (s?: string): number | null => {
    if (!s || typeof s !== 'string') return null;
    const p = s.split(':').map(Number);
    if (isNaN(p[0])) return null;
    return p[0] * 60 + (p[1] || 0);
  };

  const diffH = (a?: string, b?: string): number => {
    const fa = timeToMin(a), fb = timeToMin(b);
    if (fa === null || fb === null) return 0;
    let d = fb - fa;
    if (d < 0) d += 24 * 60;
    return parseFloat((d / 60).toFixed(1));
  };

  const chartData = (() => {
    if (activeTab !== 'SUMATERA') return [];
    return data
      .filter(d => d.checkpoints?.['PELABUHAN MERAK'] && d.checkpoints?.['PELABUHAN BAKAUHENI'])
      .map(d => ({
        ...d,
        ferryHours: diffH(d.checkpoints?.['PELABUHAN MERAK'], d.checkpoints?.['PELABUHAN BAKAUHENI']),
        destHours: d.checkpoints?.['UNLOADING PDC POLYGON']
          ? diffH(d.checkpoints?.['PELABUHAN BAKAUHENI'], d.checkpoints?.['UNLOADING PDC POLYGON'])
          : 0,
        label: `${(d.driver || '?').split(' ')[0]} ${new Date(d.tanggal).getDate()}/${new Date(d.tanggal).getMonth() + 1}`
      }))
      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
  })();

  const avgOf = (key: 'ferryHours' | 'destHours') =>
    chartData.length > 0
      ? (chartData.reduce((s, d) => s + (d[key] || 0), 0) / chartData.length).toFixed(1)
      : '0.0';

  const avgFerry = avgOf('ferryHours');
  const avgDest = avgOf('destHours');

  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl text-sm">
        <p className="font-black text-slate-800 dark:text-white mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="font-semibold" style={{ color: p.fill }}>
            {p.value} jam
          </p>
        ))}
      </div>
    );
  };

  const EmptyChart = () => (
    <div className="h-[420px] flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-3">
      <Ship className="w-8 h-8" />
      <p className="text-sm font-semibold">Belum ada data</p>
    </div>
  );

  const LoadingChart = () => (
    <div className="h-[420px] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="font-black text-base tracking-tight">Route Analytics</span>
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">Transit</span>
          </div>

          <div className="relative">
            <button
              onClick={() => monthInputRef.current?.showPicker()}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Calendar className="w-4 h-4" />
              {monthLabel}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <input ref={monthInputRef} type="month" value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="absolute top-full right-0 opacity-0 w-0 h-0" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl w-fit">
          {TABS.filter(t => !(isTAM && t === 'TMMIN')).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }}>
            {activeTab === 'SUMATERA' ? (
              <div className="space-y-6">
                {/* ── Route Path ── */}
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                  <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 font-black">Karawang</span>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                  <span className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-xl text-blue-600 dark:text-blue-400 font-black flex items-center gap-1.5">
                    <Ship className="w-3.5 h-3.5" /> Merak
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                  <span className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-xl text-blue-600 dark:text-blue-400 font-black">Bakauheni</span>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                  <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 font-black">PDC Tujuan</span>
                  <span className="ml-2 text-slate-400 text-xs font-semibold">· {chartData.length} ritase</span>
                </div>

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Ritase', value: chartData.length.toString(), unit: '', color: 'text-slate-900 dark:text-white' },
                    { label: 'Avg. Ferry Crossing', value: avgFerry, unit: 'jam', color: 'text-blue-600 dark:text-blue-400' },
                    { label: 'Avg. Bakau → Tujuan', value: avgDest, unit: 'jam', color: 'text-emerald-600 dark:text-emerald-400' },
                  ].map(c => (
                    <div key={c.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{c.label}</p>
                      <p className={`text-3xl font-black ${c.color}`}>
                        {c.value}
                        {c.unit && <span className="text-sm font-semibold text-slate-400 ml-1">{c.unit}</span>}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ── Chart 1: Ferry Crossing ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                  <div className="flex items-baseline justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Segmen 1</p>
                      <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <Ship className="w-4 h-4 text-blue-500" />
                        Penyeberangan Ferry
                        <span className="text-slate-400 font-normal text-sm">Merak → Bakauheni</span>
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Rata-rata</p>
                      <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{avgFerry}<span className="text-sm font-semibold text-slate-400 ml-1">jam</span></p>
                    </div>
                  </div>

                  {isLoading ? <LoadingChart /> : chartData.length > 0 ? (
                    <div className="h-[380px] overflow-visible">
                      <ResponsiveContainer width="100%" height="100%" style={{ overflow: 'visible' }}>
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }} barCategoryGap="30%">
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="label" axisLine={false} tickLine={false}
                            tick={{ fontSize: 8.5, fill: '#94a3b8', fontWeight: 600 }}
                            angle={-45} textAnchor="end" interval={0} height={85} dy={8} />
                          <YAxis axisLine={false} tickLine={false}
                            tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                            tickFormatter={v => `${v}j`} width={28} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                          <ReferenceLine y={Number(avgFerry)} stroke="#e2e8f0" strokeDasharray="4 3"
                            label={{ position: 'right', value: `${avgFerry}j`, fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                          <Bar dataKey="ferryHours" radius={[4, 4, 0, 0]} maxBarSize={28}>
                            {chartData.map((e, i) => (
                              <Cell key={i} fill={e.ferryHours > 8 ? '#f87171' : e.ferryHours > 5 ? '#fbbf24' : '#60a5fa'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <EmptyChart />}

                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-4 text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" /> Normal (&lt;5j)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Lambat (5–8j)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> Lama (&gt;8j)</span>
                  </div>
                </div>

                {/* ── Chart 2: Bakauheni → Tujuan ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                  <div className="flex items-baseline justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Segmen 2</p>
                      <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        Bakauheni ke Tujuan
                        <span className="text-slate-400 font-normal text-sm">Bakauheni → PDC Polygon</span>
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Rata-rata</p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{avgDest}<span className="text-sm font-semibold text-slate-400 ml-1">jam</span></p>
                    </div>
                  </div>

                  {(() => {
                    const d2 = chartData.filter(d => d.destHours > 0);
                    return isLoading ? <LoadingChart /> : d2.length > 0 ? (
                      <div className="h-[380px] overflow-visible">
                        <ResponsiveContainer width="100%" height="100%" style={{ overflow: 'visible' }}>
                          <BarChart data={d2} margin={{ top: 5, right: 30, left: -20, bottom: 5 }} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false}
                              tick={{ fontSize: 8.5, fill: '#94a3b8', fontWeight: 600 }}
                              angle={-45} textAnchor="end" interval={0} height={85} dy={8} />
                            <YAxis axisLine={false} tickLine={false}
                              tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                              tickFormatter={v => `${v}j`} width={28} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf4' }} />
                            <ReferenceLine y={Number(avgDest)} stroke="#e2e8f0" strokeDasharray="4 3"
                              label={{ position: 'right', value: `${avgDest}j`, fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                            <Bar dataKey="destHours" radius={[4, 4, 0, 0]} maxBarSize={28}>
                              {d2.map((e, i) => (
                                <Cell key={i} fill={e.destHours > 10 ? '#f87171' : e.destHours > 6 ? '#fbbf24' : '#34d399'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : <EmptyChart />;
                  })()}

                  <div className="flex items-center gap-4 mt-4 text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" /> Normal (&lt;6j)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Lambat (6–10j)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> Lama (&gt;10j)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-5">
                  <MapPin className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="font-black text-lg mb-2">Rute {activeTab}</h3>
                <p className="text-sm text-slate-500 max-w-xs">Analitik untuk rute ini sedang dalam pengembangan.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
