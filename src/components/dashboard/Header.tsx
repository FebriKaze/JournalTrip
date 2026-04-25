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
          {/* Area Switcher Premium */}
          <div className="bg-slate-200/50 p-1 rounded-2xl flex items-center shadow-inner backdrop-blur-sm">
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => onAreaChange(area)}
                className={`relative px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  selectedArea === area ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {selectedArea === area && (
                  <motion.div
                    layoutId="activeArea"
                    className="absolute inset-0 bg-red-600 rounded-xl shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 uppercase tracking-wider">{area}</span>
              </button>
            ))}
          </div>

          <div className="relative group bg-white p-2 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent border-none py-1 pl-9 pr-2 text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer"
            />
          </div>
        </div>
      </motion.div>

      {driver ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200/50 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/50 rounded-full blur-3xl -mr-20 -mt-20 z-0" />
          
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
                      className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover shadow-lg ring-4 ring-white" 
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-100 flex items-center justify-center shadow-lg ring-4 ring-white">
                      <User className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                  <div className={`absolute -bottom-2 -right-2 ${driver.status === 'online' ? 'bg-green-500' : 'bg-slate-400'} w-8 h-8 rounded-2xl border-4 border-white flex items-center justify-center shadow-sm`}>
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                  </div>
                </motion.div>
                
                <div>
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-1">{driver.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-black tracking-tight border border-red-100">
                      UNIT: {driver.noPolisi || '--'}
                    </span>
                    <button 
                      onClick={() => setShowSimModal(true)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        driver.simStatus === 'Valid' ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' : 
                        driver.simStatus === 'Warning' ? 'bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100' :
                        'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      SIM {driver.simStatus}
                      <ZoomIn className="w-3 h-3 opacity-50" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-left md:text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">OPERASIONAL STATUS</p>
                  <div className="flex items-center md:justify-end gap-2 text-green-600">
                    <span className="text-2xl font-black">{driver.status === 'online' ? 'ACTIVE' : 'READY'}</span>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white/50 border border-dashed border-slate-300 rounded-3xl p-12 text-center">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Pilih Driver untuk melihat detail {selectedArea}</p>
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
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Driver Documents</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Verification and license status</p>
                  </div>
                  <button 
                    onClick={() => setShowSimModal(false)}
                    className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="aspect-16/10 bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 relative group">
                    {driver.simPhotoUrl ? (
                      <img 
                        src={driver.simPhotoUrl} 
                        alt="SIM Card" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <MapPin className="w-12 h-12 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Preview Not Available</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-tight">License Status</p>
                      <p className={`text-lg font-black ${driver.simStatus === 'Valid' ? 'text-green-600' : 'text-red-500'}`}>{driver.simStatus}</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-tight">Expiry Date</p>
                      <p className="text-lg font-black text-slate-900">{driver.simExpiry || '-- -- ----'}</p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSimModal(false)}
                  className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/20"
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
