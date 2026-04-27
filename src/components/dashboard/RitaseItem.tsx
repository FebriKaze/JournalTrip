import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Lock, MapPin, Truck, CheckCircle2, Clock } from 'lucide-react';
import { Ritase } from '../../types';

interface RitaseItemProps {
  ritase: Ritase;
  isExpanded: boolean;
  onToggle: () => void;
}

const RitaseItem: React.FC<RitaseItemProps> = ({ ritase, isExpanded, onToggle }) => {
  const isLocked = ritase.type === 'locked';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      className="relative"
    >
      <button 
        onClick={() => !isLocked && onToggle()}
        className={`w-full text-left bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 md:p-5 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 relative z-20 overflow-hidden ${
          isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'
        } ${isExpanded ? 'ring-2 ring-blue-500/10 dark:ring-blue-500/5 border-blue-500/20 dark:border-blue-500/30 shadow-md' : ''}`}
      >
        {ritase.type === 'active' && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600 dark:bg-red-500" />}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 ${
              ritase.status === 'finished' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
              ritase.status === 'active' ? 'bg-red-600 dark:bg-red-700 text-white' :
              'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
            }`}>
              <Truck className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="overflow-hidden">
              <p className={`text-xs md:text-sm font-bold truncate ${ritase.type === 'active' ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>Ritase {ritase.ritaseNo}</p>
              <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{ritase.route}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <span className={`text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-1 rounded-full uppercase border ${
              ritase.status === 'finished' ? 'text-green-600 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-900/20 dark:border-green-900/30' :
              ritase.status === 'active' ? 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-900/30' :
              'text-slate-400 bg-slate-50 border-slate-100 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-700'
            }`}>
              {ritase.status}
            </span>
            {isLocked ? (
              <Lock className="w-4 h-4 text-slate-300 dark:text-slate-700" />
            ) : (
              isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            )}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && ritase.timeline && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden bg-white dark:bg-slate-900/80 border-x border-b border-slate-200/50 dark:border-slate-800/50 rounded-b-2xl -mt-4 mx-2 md:mx-4 pt-8 pb-6 px-4 md:px-6 shadow-sm shadow-slate-100 dark:shadow-slate-950 relative z-10"
          >
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between md:items-end gap-3">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg w-fit border dark:border-red-900/30">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px] md:text-xs font-bold tracking-tight">Rute: {ritase.route}</span>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-1">TOTAL DURASI</p>
                  <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{ritase.duration}</p>
                </div>
              </div>

              {/* Responsive Timeline Visualization */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative gap-6 md:gap-0 pl-4 md:pl-0">
                {/* Background Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-[18px] left-0 w-full h-[2px] bg-slate-100 dark:bg-slate-800 z-0" />
                {/* Active/Completed Progress Line (Desktop) */}
                {(ritase.type === 'active' || ritase.type === 'completed') && (
                  <div className={`hidden md:block absolute top-[18px] left-0 h-[2px] z-0 ${
                    ritase.type === 'active' ? 'bg-red-600 dark:bg-red-500' : 'bg-green-500'
                  }`} style={{ 
                    width: ritase.type === 'completed' 
                      ? '100%' 
                    : `${((ritase.timeline?.filter(s => s.type === 'completed' || s.type === 'active').length || 1) - 0.5) / (ritase.timeline?.length || 1) * 100}%` 
                  }} />
                )}


                {/* Vertical Connecting Line (Mobile) */}
                <div className="md:hidden absolute top-0 left-[18px] w-[2px] h-full bg-slate-100 dark:bg-slate-800 z-0" />

                {ritase.timeline.map((step, idx) => (
                  <div key={idx} className={`flex md:flex-col items-center md:items-center relative z-10 w-full md:w-32 gap-4 md:gap-0 ${step.type === 'pending' ? 'opacity-40' : ''}`}>
                    <div className="md:mb-3 shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md transition-all hover:scale-110 ${
                        step.type === 'active' ? 'bg-red-600 dark:bg-red-500' :
                        (ritase.type === 'completed' || step.type === 'completed' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700')
                      }`}>
                        {step.type === 'active' ? (
                          <Truck className="w-4 h-4 text-white" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-left md:text-center">
                      <p className={`text-[9px] font-black tracking-wider ${step.type === 'active' ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500 uppercase tracking-widest'}`}>{step.label}</p>
                      <div className="flex items-center md:justify-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 font-mono">{step.plan}</span>
                      </div>
                      <div className="flex items-center md:justify-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${step.delay && ritase.type !== 'completed' ? 'bg-red-500 animate-pulse' : (ritase.type === 'completed' || step.type === 'completed' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700')}`} />
                        <span className={`text-[10px] font-bold font-mono ${step.delay && ritase.type !== 'completed' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                          {step.actual}
                        </span>
                        {step.delay && ritase.type !== 'completed' && <span className="text-[8px] font-black text-red-500 dark:text-red-400">{step.delay}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RitaseItem;
