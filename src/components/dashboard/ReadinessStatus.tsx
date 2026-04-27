import { ShieldCheck, Activity, Ban } from 'lucide-react';
import { Readiness } from '../../types';

interface ReadinessStatusProps {
  data?: Readiness;
}

export default function ReadinessStatus({ data }: ReadinessStatusProps) {
  const lastVerification = data?.lastVerification || '--/--';
  const healthStatus = data?.physicalHealth || 'PENDING';
  const bpValue = data?.bloodPressure || '--/-- mmHg';
  const alcoholValue = data?.alcoholTest || '0.00% (CLEAR)';

  return (
    <section id="readiness-section">
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-900/5 dark:shadow-slate-950/20 relative overflow-hidden">
        {!data && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Menunggu Data Tenko...</p>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Tenko Readiness Status</h3>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Terakhir Verifikasi: {lastVerification}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Physical Health */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 md:p-6 flex items-center justify-between border border-white dark:border-slate-800 shadow-sm dark:shadow-none transition-all hover:shadow-md dark:hover:bg-slate-800 cursor-default group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl ${healthStatus === 'FIT TO WORK' ? 'bg-green-500 dark:bg-green-600' : 'bg-slate-400 dark:bg-slate-700'} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                <ShieldCheck className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block whitespace-nowrap">Physical Health</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Kondisi Fisik</span>
              </div>
            </div>
            <span className={`px-3 md:px-4 py-1.5 ${healthStatus === 'FIT TO WORK' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-900/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'} text-[10px] md:text-[11px] font-black rounded-full border whitespace-nowrap ml-4`}>
              {healthStatus}
            </span>
          </div>

          {/* Tensi */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 md:p-6 flex items-center justify-between border border-white dark:border-slate-800 shadow-sm dark:shadow-none transition-all hover:shadow-md dark:hover:bg-slate-800 cursor-default group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-red-600 dark:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform shrink-0">
                <Activity className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block whitespace-nowrap">Tensi</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Tekanan Darah</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 ml-4 text-right">
              <span className="px-4 md:px-5 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-[10px] md:text-[11px] font-black rounded-full border border-red-200/50 dark:border-red-900/30">NORMAL</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">{bpValue}</span>
            </div>
          </div>

          {/* Alcohol Content */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 md:p-6 flex items-center justify-between border border-white dark:border-slate-800 shadow-sm dark:shadow-none transition-all hover:shadow-md dark:hover:bg-slate-800 cursor-default group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-red-500 dark:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform shrink-0">
                <Ban className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block whitespace-nowrap">Alcohol Content</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Breath Test</span>
              </div>
            </div>
            <span className="px-3 md:px-4 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] md:text-[11px] font-black rounded-full border border-green-200/50 dark:border-green-900/30 whitespace-nowrap ml-4">{alcoholValue}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

