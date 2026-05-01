import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  Building2,
  Search,
  ArrowRight,
  Calendar,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchFleetMonitoringData } from '../services/dataFetcher';
import { supabase } from '../lib/supabase';

// Status Types for Fleet
type FleetStatus = 'In Pool' | 'OTW PDC' | 'In PDC' | 'OTW Destination' | 'At Destination' | 'Finished';

interface FleetArmada {
  id: string;
  driverName: string;
  nopol: string;
  currentRitase: number;
  totalRitase: number;
  status: FleetStatus;
  lastUpdate: string;
  origin: string;
  destination: string;
}

export default function FleetMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fleetData, setFleetData] = useState<FleetArmada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const monthInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchFleetMonitoringData(selectedDate);
    setFleetData(data || []);
    setIsLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    loadData();

    // Real-time subscription
    const channel = supabase
      .channel('fleet-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => {
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  const stats = useMemo(() => {
    return {
      total: fleetData.length,
      inPool: fleetData.filter(f => f.status === 'In Pool').length,
      otwPdc: fleetData.filter(f => f.status === 'OTW PDC').length,
      inPdc: fleetData.filter(f => f.status === 'In PDC').length,
      otwDest: fleetData.filter(f => f.status === 'OTW Destination').length,
      atDest: fleetData.filter(f => f.status === 'At Destination').length,
    };
  }, [fleetData]);

  const getStatusColor = (status: FleetStatus) => {
    switch (status) {
      case 'In Pool': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      case 'OTW PDC': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'In PDC': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'OTW Destination': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'At Destination': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Finished': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const filteredFleet = fleetData.filter(f => 
    f.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.nopol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            Fleet Monitoring
            <span className="text-xs bg-red-600 text-white px-3 py-1 rounded-full animate-pulse">LIVE</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Real-time status armada & jadwal</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Navigation Control */}
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <button 
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors border-r border-slate-100 dark:border-slate-800"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            
            <div 
              onClick={() => monthInputRef.current?.showPicker()}
              className="flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Calendar className="w-4 h-4 text-red-500" />
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <input 
                ref={monthInputRef}
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="sr-only"
              />
            </div>

            <button 
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors border-l border-slate-100 dark:border-slate-800"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Cari armada..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-slate-900 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-bold focus:outline-none shadow-sm dark:text-white w-full md:w-40"
            />
          </div>

          <button 
            onClick={loadData}
            className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-red-500 transition-all"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── SCORE CARDS (STATS) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Armada', value: stats.total, icon: Truck, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'In Pool', value: stats.inPool, icon: Building2, color: 'text-slate-500', bg: 'bg-slate-100' },
          { label: 'OTW PDC', value: stats.otwPdc, icon: Navigation, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'In PDC', value: stats.inPdc, icon: MapPin, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'OTW Tujuan', value: stats.otwDest, icon: Navigation, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Sampai Tujuan', value: stats.atDest, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-900 p-4 rounded-[24px] shadow-sm border border-slate-200/60 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-2 group hover:shadow-md transition-all"
          >
            <div className={`p-3 rounded-2xl ${item.bg} dark:bg-slate-800 group-hover:scale-110 transition-transform`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{item.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── MONITORING TABLE (Desktop) & CARDS (Mobile) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm overflow-hidden border border-slate-200/60 dark:border-slate-800">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 space-y-4"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800 last:border-0 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                      <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    </div>
                  </div>
                  <div className="h-8 w-24 bg-slate-50 dark:bg-slate-800/50 rounded-full" />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Desktop View Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Armada / Driver</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ritase</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Route</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {filteredFleet.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <Truck className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white text-sm">{item.driverName}</p>
                              <p className="text-[10px] font-bold text-slate-400 tracking-wider">{item.nopol}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex gap-1">
                              {[...Array(item.totalRitase)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-1.5 h-1.5 rounded-full ${i < item.currentRitase ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'}`} 
                                />
                              ))}
                            </div>
                            <p className="text-[10px] font-black text-slate-500">{item.currentRitase} / {item.totalRitase}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.origin}</span>
                            <ArrowRight className="w-3 h-3 text-slate-300" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{item.destination}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{item.lastUpdate}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Cards */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFleet.map((item) => (
                  <div key={item.id} className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Truck className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-sm">{item.driverName}</p>
                          <p className="text-[10px] font-bold text-slate-400 tracking-wider">{item.nopol}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500">{item.origin}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white">{item.destination}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Ritase</p>
                        <p className="text-xs font-black text-red-600">{item.currentRitase} / {item.totalRitase}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px]">
                      <div className="flex gap-1">
                        {[...Array(item.totalRitase)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1.5 h-1.5 rounded-full ${i < item.currentRitase ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'}`} 
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                        <Clock className="w-3 h-3" />
                        {item.lastUpdate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
