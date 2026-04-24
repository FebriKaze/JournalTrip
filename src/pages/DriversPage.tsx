import { useState, useEffect } from 'react';
import { User, Shield, CreditCard, Search, MapPin, Truck, X, Mail, Phone, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchAllDrivers } from '../services/dataFetcher';
import { Driver } from '../types';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchAllDrivers();
      setDrivers(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Search Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-4xl border border-slate-200/50 shadow-sm"
      >
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Driver Directory</h1>
          <p className="text-slate-500 font-medium">Monitoring data personel dan lisensi pengemudi KMDI</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari nama driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 pl-14 pr-6 focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all outline-none font-bold text-slate-700"
          />
        </div>
      </motion.div>

      {/* Driver Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredDrivers.map((driver) => (
            <motion.div 
              key={driver.id}
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 }
              }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[40px] border border-slate-200/50 p-7 shadow-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/30 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <div className="flex items-center gap-5 mb-7 relative z-10">
                {driver.avatar ? (
                  <img src={driver.avatar} alt={driver.name} className="w-22 h-22 rounded-3xl object-cover shadow-lg border-4 border-white" />
                ) : (
                  <div className="w-22 h-22 rounded-3xl bg-slate-100 flex items-center justify-center border-4 border-white shadow-sm">
                    <User className="w-10 h-10 text-slate-300" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-black text-slate-900 truncate mb-1 leading-tight">{driver.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">BASE POOL A</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-7 relative z-10">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">SIM STATUS</span>
                  </div>
                  <p className={`text-xs font-black px-2 py-1 rounded-lg inline-block ${
                    driver.simStatus === 'Valid' ? 'bg-green-100 text-green-600' : 
                    driver.simStatus === 'Warning' ? 'bg-amber-100 text-amber-500' : 'bg-red-100 text-red-600'
                  }`}>
                    {driver.simStatus === 'Valid' ? 'VALID' : driver.simStatus === 'Warning' ? 'EXPIRED SOON' : 'EXPIRED'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <Truck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">UNIT TERAKHIR</span>
                  </div>
                  <p className="text-xs font-black text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-100 inline-block">
                    {driver.noPolisi || '--'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedDriver(driver)}
                className="w-full text-sm font-black text-white bg-slate-900 py-4 rounded-2xl hover:bg-red-600 transition-all transform active:scale-95 shadow-lg shadow-slate-200"
              >
                VIEW PROFILE
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {selectedDriver && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-6 text-slate-900">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDriver(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[48px] overflow-hidden shadow-2xl max-w-2xl w-full"
            >
              <div className="absolute top-0 right-0 p-6 z-10">
                <button 
                  onClick={() => setSelectedDriver(null)}
                  className="p-3 bg-white/80 backdrop-blur shadow-sm hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative">
                {/* Header Background */}
                <div className="h-48 bg-linear-to-br from-red-600 to-red-800 relative">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                </div>

                <div className="px-10 pb-12 -mt-24 relative z-10">
                  <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
                    {selectedDriver.avatar ? (
                      <img src={selectedDriver.avatar} alt={selectedDriver.name} className="w-44 h-44 rounded-[40px] object-cover ring-8 ring-white shadow-2xl" />
                    ) : (
                      <div className="w-44 h-44 rounded-[40px] bg-slate-100 flex items-center justify-center ring-8 ring-white shadow-xl">
                        <User className="w-20 h-20 text-slate-300" />
                      </div>
                    )}
                    <div className="pb-4">
                      <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-md mb-2">{selectedDriver.name}</h2>
                      <div className="flex items-center gap-3">
                         <span className="bg-white/20 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border border-white/20">
                            ID #{selectedDriver.id.slice(0, 8).toUpperCase()}
                         </span>
                         <span className="bg-white text-red-600 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm">
                            DRIVER AKTIF
                         </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* SIM Card Info */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                        Informasi Lisensi
                      </h4>
                      <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center">
                           <p className="text-xs font-bold text-slate-500 uppercase">Status SIM</p>
                           <p className={`text-sm font-black ${selectedDriver.simStatus === 'Valid' ? 'text-green-600' : 'text-red-500'}`}>
                             {selectedDriver.simStatus?.toUpperCase()}
                           </p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-200/50">
                           <p className="text-xs font-bold text-slate-500 uppercase">Masa Berlaku</p>
                           <p className="text-sm font-black text-slate-800">
                             {selectedDriver.simExpiry ? new Date(selectedDriver.simExpiry).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : '--'}
                           </p>
                        </div>
                        {selectedDriver.simPhotoUrl && (
                          <div className="pt-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">DOKUMEN FISIK</p>
                            <img src={selectedDriver.simPhotoUrl} alt="SIM" className="w-full h-32 object-cover rounded-2xl border-2 border-white shadow-sm" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Info */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                        Detail Operasional
                      </h4>
                      <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-red-600">
                              <Truck className="w-6 h-6" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nopol Terakhir</p>
                              <p className="text-lg font-black text-slate-800">{selectedDriver.noPolisi || '---'}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-red-600">
                              <MapPin className="w-6 h-6" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penempatan</p>
                              <p className="text-lg font-black text-slate-800">BASE POOL A (JBK)</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
