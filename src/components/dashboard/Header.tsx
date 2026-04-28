import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ShieldCheck, X, ZoomIn, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { DriverDetails } from '../../types';

interface HeaderProps {
  driver: DriverDetails | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedArea: string;
  onAreaChange: (area: string) => void;
}

const areas = ['JBK', 'NGORO', 'SUMATERA'];

export default function Header({ driver, selectedDate, onDateChange, selectedArea, onAreaChange }: HeaderProps) {
  const [showSimModal, setShowSimModal] = useState(false);

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Area Switcher Premium - Pembersihan total outline/border */}
          <div className="bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-2xl flex items-center shadow-inner backdrop-blur-sm">
            {areas.map((area) => (
              <motion.button
                key={area}
                whileTap={{ scale: 0.97 }}
                onClick={() => onAreaChange(area)}
                className={`relative px-4 py-2 rounded-xl text-xs font-black transition-all border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none ${
                  selectedArea === area ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {selectedArea === area && (
                  <motion.div
                    layoutId="activeArea"
                    className="absolute inset-0 bg-red-600 dark:bg-red-700 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 uppercase tracking-wider">{area}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {driver ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/50 dark:bg-red-900/10 rounded-full blur-3xl -mr-20 -mt-20 z-0" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  {driver.avatar ? (
                    <img 
                      src={driver.avatar} 
                      alt={driver.name} 
                      className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover shadow-lg ring-4 ring-white dark:ring-slate-800" 
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-slate-800">
                      <User className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                </motion.div>
                
                <div>
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-slate-100 leading-tight mb-1">{driver.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-black tracking-tight border border-red-100 dark:border-red-900/30">
                      {driver.noPolisi || '--'}
                    </span>
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowSimModal(true)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all border outline-none focus:outline-none ${
                        driver.simStatus === 'Valid' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40' : 
                        driver.simStatus === 'Warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/40' :
                        (!driver.simStatus || driver.simStatus === '--') ? 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700' :
                        'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      SIM {(!driver.simStatus || driver.simStatus === '--') ? '--' : driver.simStatus}
                      <ZoomIn className="w-3 h-3 opacity-50" />
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-left md:text-right">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">OPERASIONAL STATUS</p>
                  <div className="flex items-center md:justify-end gap-2 text-green-600 dark:text-green-500">
                    <span className="text-2xl font-black">{driver.status === 'online' ? 'ACTIVE' : 'READY'}</span>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white/50 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center">
            <User className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">Pilih Driver untuk melihat detail {selectedArea}</p>
        </div>
      )}

      {/* Driver Detail Modal (Pop-up) */}
      <AnimatePresence>
        {showSimModal && driver && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSimModal(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl max-w-xl w-full border dark:border-slate-800"
            >
              {/* Premium Modal Header */}
              <div className="h-24 md:h-40 bg-slate-900 dark:bg-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(at_top_right,rgba(220,38,38,0.2)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(at_bottom_left,rgba(51,65,85,0.3)_0%,transparent_50%)]" />
                
                <div className="absolute inset-0 flex items-center justify-between px-6 md:px-10">
                  <div className="relative z-10">
                    <h2 className="text-xl md:text-3xl font-black text-white tracking-tight">Driver Documents</h2>
                    <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Verification & License</p>
                  </div>
                  <button 
                    onClick={() => setShowSimModal(false)}
                    className="p-2 md:p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl hover:bg-white/20 transition-all text-white"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>

                {/* Subtle animated element */}
                <motion.div
                  animate={{ x: [-20, 100, -20], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 left-0 text-white text-4xl opacity-10"
                >
                  🚛
                </motion.div>
              </div>

              <div className="p-6 md:p-10 -mt-6 md:-mt-10 relative z-20">
                <div className="bg-white dark:bg-slate-900 rounded-[24px] md:rounded-[32px] p-2 shadow-xl border border-slate-100 dark:border-slate-800">
                  <div className="aspect-16/10 bg-slate-50 dark:bg-slate-800/50 rounded-[20px] md:rounded-[28px] overflow-hidden border border-slate-100 dark:border-slate-800 relative group">
                    {driver.simPhotoUrl ? (
                      <img 
                        src={driver.simPhotoUrl} 
                        alt="SIM Card" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                        <MapPin className="w-10 h-10 md:w-12 md:h-12 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Preview Not Available</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 md:mt-8">
                  <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 leading-tight">License Status</p>
                    <p className={`text-base md:text-xl font-black ${driver.simStatus === 'Valid' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      {(!driver.simStatus || driver.simStatus === '--') ? '--' : driver.simStatus.toUpperCase()}
                    </p>
                  </div>
                  <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 leading-tight">Expiry Date</p>
                    <p className="text-base md:text-xl font-black text-slate-900 dark:text-slate-100">
                      {driver.simExpiry || '-- -- ----'}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSimModal(false)}
                  className="w-full mt-8 md:mt-10 py-4 md:py-5 bg-slate-900 dark:bg-red-600 text-white rounded-2xl md:rounded-3xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 dark:shadow-red-600/30 transition-all"
                >
                  Confirm & Close
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
