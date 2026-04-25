import { useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Search, PanelLeftClose, PanelLeft, LayoutDashboard, Users } from 'lucide-react';
import { Driver } from '../../types';

interface SidebarProps {
  drivers: Driver[];
  selectedDriverId: string;
  onDriverSelect: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isLoading?: boolean;
  currentPage?: 'dashboard' | 'drivers';
  onPageChange?: (page: 'dashboard' | 'drivers') => void;
}

export default function Sidebar({ 
  drivers, 
  selectedDriverId, 
  onDriverSelect, 
  isOpen, 
  onClose, 
  isCollapsed, 
  onToggleCollapse,
  isLoading,
  currentPage,
  onPageChange
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    driver.id.includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-white border-r border-slate-200/50 
        transition-all duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50 shrink-0">
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Drivers</h2>
              <p className="text-[10px] font-bold text-red-600">Tracking {drivers.length} Units</p>
            </div>
          )}
          
          <button 
            onClick={onToggleCollapse}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors hidden md:block"
          >
            {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
          
          <button onClick={onClose} className="md:hidden p-2 hover:bg-slate-50 rounded-xl text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation - Only visible on small screens */}
        <div className="flex flex-col p-4 border-b border-slate-50 md:hidden bg-slate-50/50">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Navigation Menu</p>
          <div className="space-y-1">
            <button
              onClick={() => {
                onPageChange?.('dashboard');
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                currentPage === 'dashboard' ? 'bg-white text-red-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-bold">Dashboard</span>
            </button>
            <button
              onClick={() => {
                onPageChange?.('drivers');
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                currentPage === 'drivers' ? 'bg-white text-red-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-sm font-bold">Drivers Registry</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-50">
          <div className="relative group">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isCollapsed ? 'text-slate-400' : 'text-slate-400 group-focus-within:text-red-500'}`} />
            <input 
              type="text" 
              placeholder={isCollapsed ? "" : "Cari driver..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                w-full bg-slate-50 border border-slate-100 rounded-xl transition-all outline-none font-medium text-sm
                ${isCollapsed ? 'h-10 w-10 p-0 pl-10 cursor-pointer' : 'py-2.5 pl-10 pr-4 focus:ring-4 focus:ring-red-500/5 focus:border-red-500'}
              `}
            />
          </div>
        </div>

        {/* Drivers List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 driver-list-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat...</p>
            </div>
          ) : (
            <>
              {filteredDrivers.map((driver, idx) => (
                <motion.button
                  key={driver.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 5 }}
                  onClick={() => {
                    onDriverSelect(driver.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${
                    selectedDriverId === driver.id 
                      ? 'bg-red-50 text-red-700 shadow-sm ring-1 ring-red-100' 
                      : 'text-slate-600 hover:bg-slate-50'
                  } ${isCollapsed ? 'justify-center font-shrink-0' : ''}`}
                >
                  <div className="relative shrink-0">
                    {driver.avatar ? (
                      <img 
                        src={driver.avatar} 
                        alt={driver.name} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm aspect-square">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="text-left overflow-hidden">
                      <p className="text-sm font-bold truncate tracking-tight">{driver.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-wider text-red-600/70 mb-0.5">{driver.noPolisi || `ID #${driver.id}`}</p>
                    </div>
                  )}
                </motion.button>
              ))}
              
              {filteredDrivers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 font-medium italic">Driver tidak ditemukan</p>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
