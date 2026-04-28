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
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-4xl shadow-sm"
      >
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Data Driver</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring data personel dan lisensi pengemudi KMDI</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-red-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari nama driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl py-4 pl-14 pr-6 focus:ring-4 focus:ring-red-500/5 dark:focus:ring-red-500/10 focus:border-red-500 transition-all outline-none font-bold text-slate-700 dark:text-slate-200"
          />
        </div>
      </motion.div>

      {/* Driver Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-red-600 dark:border-red-500 border-t-transparent rounded-full animate-spin" />
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
              className="bg-white dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-7 rounded-[40px] shadow-sm hover:shadow-2xl hover:shadow-red-500/10 dark:hover:shadow-red-500/5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/30 dark:bg-red-900/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <div className="flex items-center gap-5 mb-7 relative z-10">
                {driver.avatar ? (
                  <img src={driver.avatar} alt={driver.name} className="w-22 h-22 rounded-3xl object-cover shadow-lg border-4 border-white dark:border-slate-800" />
                ) : (
                  <div className="w-22 h-22 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm">
                    <User className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 truncate mb-1 leading-tight">{driver.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-red-600 dark:text-red-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">BASE POOL A</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-7 relative z-10">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-slate-400 dark:text-slate-500">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">SIM STATUS</span>
                  </div>
                  <p className={`text-xs font-black px-2 py-1 rounded-lg inline-block ${
                    driver.simStatus === 'Valid' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 
                    driver.simStatus === 'Warning' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400' : 
                    driver.simStatus === '--' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  }`}>
                    {driver.simStatus === 'Valid' ? 'VALID' : driver.simStatus === 'Warning' ? 'EXPIRED SOON' : driver.simStatus === '--' ? '--' : 'EXPIRED'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-slate-400 dark:text-slate-500">
                    <Truck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">NOPOL</span>
                  </div>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700 inline-block">
                    {driver.noPolisi || '--'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedDriver(driver)}
                className="w-full text-sm font-black text-white bg-slate-900 dark:bg-red-600 py-4 rounded-2xl hover:bg-red-600 dark:hover:bg-red-700 transition-all transform active:scale-95 shadow-lg shadow-slate-200 dark:shadow-red-900/20"
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
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-6 text-slate-900 dark:text-slate-100">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDriver(null)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-4xl md:rounded-[48px] overflow-y-auto shadow-2xl max-w-2xl w-full max-h-[85vh] custom-scrollbar border dark:border-slate-800"
            >
              <div className="absolute top-0 right-0 p-4 md:p-6 z-10">
                <button 
                  onClick={() => setSelectedDriver(null)}
                  className="p-2 md:p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow-sm hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 rounded-xl md:rounded-2xl transition-all"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <div className="relative">
                {/* Header Background */}
                <div className="h-28 md:h-48 bg-linear-to-br from-red-600 to-red-800 relative overflow-hidden">
                  {/* Logistics Animated Elements */}
                  {/* Moving Truck Icon */}
                  <motion.div
                    animate={{
                      x: [-50, 350, -50],
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute top-1/3 left-0 text-white/20 text-3xl"
                  >
                    🚚
                  </motion.div>
                  
                  {/* Route Path Animation */}
                  <svg className="absolute inset-0 w-full h-full">
                    <motion.path
                      d="M 20,40 Q 100,20 180,40 T 340,40"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                      opacity="0.3"
                      animate={{
                        strokeDashoffset: [0, -10]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </svg>
                  
                  {/* Delivery Package Drop */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={`package-${i}`}
                      animate={{
                        y: [-20, 100, -20],
                        x: [50 + i * 80, 50 + i * 80, 50 + i * 80],
                        opacity: [0, 0.8, 0],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 3 + i * 1,
                        repeat: Infinity,
                        delay: i * 1.5,
                        ease: "easeInOut"
                      }}
                      className="absolute text-white/15 text-2xl"
                      style={{
                        left: `${50 + i * 80}px`,
                        top: '20px'
                      }}
                    >
                      📦
                    </motion.div>
                  ))}
                  
                  {/* Location Pulse */}
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 0.2, 0.6]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute bottom-8 right-8 w-8 h-8 text-white/20 text-xl"
                  >
                    📍
                  </motion.div>
                  
                  {/* Route Progress Bar */}
                  <motion.div
                    animate={{
                      width: ["0%", "100%", "0%"]
                    }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute bottom-12 left-8 h-1 bg-white/20 rounded-full"
              />
              
              {/* GPS Signal Waves */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`gps-${i}`}
                  animate={{
                    scale: [1, 2, 3],
                    opacity: [0.4, 0.2, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 right-1/4 w-16 h-16 border-2 border-white/10 rounded-full -translate-y-1/2"
                />
              ))}
              
              {/* Clock/Timer Animation */}
              <motion.div
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute top-8 left-1/3 text-white/15 text-xl"
              >
                🕐
              </motion.div>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                </div>

                <div className="px-5 md:px-10 pb-6 md:pb-12 -mt-12 md:-mt-24 relative z-10">
                  <div className="flex flex-col md:flex-row items-center md:items-end text-center md:text-left gap-3 md:gap-6 mb-6 md:mb-10">
                    {selectedDriver.avatar ? (
                      <img src={selectedDriver.avatar} alt={selectedDriver.name} className="w-24 h-24 md:w-44 md:h-44 rounded-full md:rounded-[40px] object-cover ring-4 md:ring-8 ring-white dark:ring-slate-900 shadow-xl md:shadow-2xl" />
                    ) : (
                      <div className="w-24 h-24 md:w-44 md:h-44 rounded-full md:rounded-[40px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center ring-4 md:ring-8 ring-white dark:ring-slate-900 shadow-md md:shadow-xl">
                        <User className="w-10 h-10 md:w-20 md:h-20 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                    <div className="pb-0 md:pb-4 flex flex-col items-center md:items-start">
                      <h2 className="text-xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-none md:drop-shadow-md mb-2">{selectedDriver.name}</h2>
                      <div className="flex items-center gap-2 md:gap-3">
                         <span className="hidden md:inline-block bg-slate-100 md:bg-white/20 dark:bg-slate-800/50 backdrop-blur text-slate-600 md:text-white dark:text-slate-300 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase border border-slate-200 md:border-white/20 dark:border-slate-700">
                            ID #{selectedDriver.id.slice(0, 8).toUpperCase()}
                         </span>
                         <span className="bg-red-50 md:bg-white dark:bg-red-600 text-red-600 dark:text-white px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase shadow-none md:shadow-sm">
                            DRIVER AKTIF
                         </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                    {/* SIM Card Info */}
                    <div className="space-y-4 md:space-y-6">
                      <h4 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 md:mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-600 dark:bg-red-500 rounded-full" />
                        Informasi Lisensi
                      </h4>
                      <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl md:rounded-4xl border border-slate-100 dark:border-slate-800 space-y-3 md:space-y-4">
                        <div className="flex justify-between items-center">
                           <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status SIM</p>
                           <p className={`text-sm font-black ${
                             selectedDriver.simStatus === 'Valid' ? 'text-green-600 dark:text-green-400' : 
                             selectedDriver.simStatus === 'Warning' ? 'text-amber-600 dark:text-amber-400' :
                             selectedDriver.simStatus === '--' ? 'text-slate-500 dark:text-slate-400' : 'text-red-500 dark:text-red-400'
                           }`}>
                             {selectedDriver.simStatus === '--' ? '--' : selectedDriver.simStatus?.toUpperCase()}
                           </p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-200/50 dark:border-slate-700">
                           <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Masa Berlaku</p>
                           <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                             {selectedDriver.simExpiry ? new Date(selectedDriver.simExpiry).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : '--'}
                           </p>
                        </div>
                        {selectedDriver.simPhotoUrl && (
                          <div className="pt-4">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">DOKUMEN FISIK</p>
                            <img src={selectedDriver.simPhotoUrl} alt="SIM" className="w-full h-32 object-cover rounded-2xl border-2 border-white dark:border-slate-800 shadow-sm" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Info */}
                    <div className="space-y-4 md:space-y-6">
                      <h4 className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 md:mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-600 dark:bg-red-500 rounded-full" />
                        Data Pengemudi & Operasional
                      </h4>
                      <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl md:rounded-4xl border border-slate-100 dark:border-slate-800 space-y-4 md:space-y-5">
                        
                        {/* NIK */}
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white dark:bg-slate-800 flex shrink-0 items-center justify-center shadow-sm text-slate-400 dark:text-slate-500 border dark:border-slate-700">
                              <Shield className="w-5 h-5 md:w-6 md:h-6" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">NIK</p>
                              <p className="text-sm md:text-lg font-black text-slate-800 dark:text-slate-200">{selectedDriver.nik || '---'}</p>
                           </div>
                        </div>

                        {/* Alamat */}
                        <div className="flex items-start gap-4">
                           <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white dark:bg-slate-800 flex shrink-0 items-center justify-center shadow-sm text-slate-400 dark:text-slate-500 mt-1 border dark:border-slate-700">
                              <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Alamat</p>
                              <p className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">{selectedDriver.alamat || '---'}</p>
                           </div>
                        </div>

                        <div className="h-px w-full bg-slate-200/60 dark:bg-slate-700 my-2" />

                        {/* Nopol */}
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white dark:bg-slate-800 flex shrink-0 items-center justify-center shadow-sm text-red-600 dark:text-red-500 border dark:border-slate-700">
                              <Truck className="w-5 h-5 md:w-6 md:h-6" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">NOPOL</p>
                              <p className="text-base md:text-lg font-black text-slate-800 dark:text-slate-200">{selectedDriver.noPolisi || '---'}</p>
                           </div>
                        </div>

                        {/* Penempatan */}
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white dark:bg-slate-800 flex shrink-0 items-center justify-center shadow-sm text-red-600 dark:text-red-500 border dark:border-slate-700">
                              <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Penempatan</p>
                              <p className="text-base md:text-lg font-black text-slate-800 dark:text-slate-200">BASE POOL A (JBK)</p>
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
