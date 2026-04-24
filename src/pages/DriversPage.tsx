import { useState, useEffect } from 'react';
import { User, Shield, CreditCard, Search, MapPin, Gauge } from 'lucide-react';
import { fetchAllDrivers } from '../services/dataFetcher';
import { Driver } from '../types';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchAllDrivers();
      setDrivers(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.id.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Driver Directory</h1>
          <p className="text-slate-500 font-medium">Manage and monitor all personnel across the fleet</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none font-medium"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <div key={driver.id} className="group bg-white rounded-4xl border border-slate-200/50 p-6 shadow-sm hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start gap-5 mb-6">
                <div className="relative">
                  {driver.avatar ? (
                    <img src={driver.avatar} alt={driver.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-50 shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center ring-4 ring-slate-50">
                      <User className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                  <div className={`absolute -right-2 -bottom-2 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                    driver.status === 'online' ? 'bg-green-500' : 'bg-slate-300'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">ID #{driver.id}</p>
                  <h3 className="text-xl font-bold text-slate-900 truncate mb-1">{driver.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Base Pool A</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">SIM Status</span>
                  </div>
                  <p className={`text-xs font-black ${
                    driver.simStatus === 'Expired' ? 'text-red-600' : 'text-green-600'
                  }`}>{driver.simStatus || 'Verified'}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1.5 text-slate-400">
                    <Gauge className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Perf Rating</span>
                  </div>
                  <p className="text-xs font-black text-slate-700">98.5%</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-red-600/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                </div>
                <button className="text-sm font-black text-red-600 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all transform active:scale-95">
                  VIEW PROFILE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
