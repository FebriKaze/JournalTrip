import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ShieldCheck, X, ZoomIn } from 'lucide-react';
import { Driver } from '../../types';

interface HeaderProps {
  selectedDriver: Driver;
}

export default function Header({ selectedDriver }: HeaderProps) {
  const [showSimModal, setShowSimModal] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white border border-slate-200/50 rounded-3xl p-6 md:p-8 mb-8 shadow-sm relative overflow-hidden"
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
              {selectedDriver.avatar ? (
                <img 
                  src={selectedDriver.avatar} 
                  alt={selectedDriver.name} 
                  className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover shadow-lg ring-4 ring-white" 
                />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner ring-4 ring-white">
                  <User className="w-12 h-12" />
                </div>
              )}
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">
                {selectedDriver.name}
              </h1>
              <div className="flex items-center">
                <span className="text-red-600 font-black tracking-widest text-xs uppercase bg-red-50 px-2 py-1 rounded-lg border border-red-100 shadow-sm">
                  {selectedDriver.noPolisi || `ID #${selectedDriver.id}`}
                </span>
              </div>
            </div>
          </div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-50 border border-slate-100 rounded-2xl p-4 min-w-[200px] shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-red-600 shadow-sm shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">DOKUMEN SIM</p>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-bold text-slate-700">
                    <span className={`px-2 py-0.5 rounded ${
                      selectedDriver.simStatus === 'Valid' ? 'bg-green-100 text-green-600' : 
                      selectedDriver.simStatus === 'Warning' ? 'bg-amber-100 text-amber-500' : 'bg-red-100 text-red-600'
                    }`}>
                      {selectedDriver.simStatus === 'Valid' ? 'Valid' : 
                       selectedDriver.simStatus === 'Warning' ? 'Hampir Habis' : 'Expired'}
                    </span>
                  </p>
                  {selectedDriver.simPhotoUrl && (
                    <button 
                      onClick={() => setShowSimModal(true)}
                      className="flex items-center gap-1 text-[10px] bg-red-600 text-white px-2 py-1 rounded-lg font-black hover:bg-red-700 transition-colors shadow-sm"
                    >
                      <ZoomIn className="w-3 h-3" /> VIEW
                    </button>
                  )}
                </div>
                <p className="text-[10px] font-medium text-slate-400">
                  Habis: {selectedDriver.simExpiry ? new Date(selectedDriver.simExpiry).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '--'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SIM Modal Popup */}
      <AnimatePresence>
        {showSimModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSimModal(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Foto Dokumen SIM</p>
                <button 
                  onClick={() => setShowSimModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-4 flex items-center justify-center bg-slate-100 min-h-[300px]">
                <img 
                  src={selectedDriver.simPhotoUrl} 
                  alt="SIM Card" 
                  className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-lg border-2 border-white"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
