import { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon, Menu, X, Sun, Moon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedShift: 'Day' | 'Night';
  onShiftChange: (shift: 'Day' | 'Night') => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/': { title: 'Journal Trip', sub: 'Ritase & Driver Tracking' },
  '/monitoring': { title: 'Fleet Monitoring', sub: 'Live Status & Schedule' },
  '/leadtime': { title: 'LeadTime Center', sub: 'Performance & Delay Analytics' },
  '/drivers': { title: 'Drivers Registry', sub: 'Data Master Pengemudi' },
  '/eco': { title: 'Eco Driving', sub: 'Safety Analytics Dashboard' },
};

export default function Navbar({
  selectedDate,
  onDateChange,
  selectedShift,
  onShiftChange,
  isSidebarOpen,
  onToggleSidebar,
  isSidebarCollapsed,
  theme,
  onThemeToggle,
}: NavbarProps) {
  const location = useLocation();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isShiftOpen, setIsShiftOpen] = useState(false);

  const getPageInfo = () => {
    if (location.pathname.startsWith('/drivers/')) {
      return { title: 'Driver Profile', sub: 'Detail Data & History' };
    }
    return PAGE_TITLES[location.pathname] || PAGE_TITLES['/'];
  };

  const pageInfo = getPageInfo();
  const isDay = selectedShift === 'Day';
  const isDashboard = location.pathname === '/';

  return (
    <nav className={`
      fixed top-0 z-40 right-0
      bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-md
      border-b border-slate-200/60 dark:border-slate-800/60
      h-16 flex items-center px-4 md:px-6 shadow-sm
      transition-all duration-500 gap-4
      ${isSidebarCollapsed ? 'md:left-[72px]' : 'md:left-64'} left-0
    `}>

      {/* ── Hamburger (mobile) ── */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onToggleSidebar}
        className="p-2 -mr-1 text-slate-500 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0 md:hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isSidebarOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5" />
            </motion.span>
          ) : (
            <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Menu className="w-5 h-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Page Title ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="hidden md:block shrink-0"
        >
          <h2 className="text-base font-black text-red-600 dark:text-red-400 leading-tight">{pageInfo.title}</h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{pageInfo.sub}</p>
        </motion.div>
      </AnimatePresence>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Right Controls ── */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Theme Toggle */}
        <motion.button
          whileTap={{ scale: 0.9, rotate: 15 }}
          onClick={(e) => { e.preventDefault(); onThemeToggle(); }}
          className="relative p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm outline-none ring-0"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === 'light' ? (
              <motion.span key="moon" initial={{ opacity: 0, rotate: -30, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 30, scale: 0.7 }} transition={{ duration: 0.2 }}>
                <Moon className="w-4 h-4" />
              </motion.span>
            ) : (
              <motion.span key="sun" initial={{ opacity: 0, rotate: 30, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: -30, scale: 0.7 }} transition={{ duration: 0.2 }}>
                <Sun className="w-4 h-4 text-yellow-400" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* ── JOURNAL TRIP Controls ── */}
        <AnimatePresence>
          {isDashboard && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 md:gap-3"
            >
              {/* Date Picker */}
              <motion.div
                whileTap={{ scale: 0.97 }}
                onClick={() => dateInputRef.current?.showPicker()}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl shadow-inner outline-none ring-0 cursor-pointer"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={e => { onDateChange(e.target.value); e.target.blur(); }}
                  className="text-[11px] font-black text-slate-800 dark:text-white border-none focus:ring-0 cursor-pointer p-0 bg-transparent outline-none w-25"
                />
              </motion.div>

              {/* Shift Dropdown */}
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsShiftOpen(o => !o)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 border transition-all outline-none focus:outline-none focus:ring-0 font-black text-[10px] ${
                    isDay
                      ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-300'
                      : 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-300'
                  }`}
                >
                  <motion.span
                    key={selectedShift}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isDay ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </motion.span>
                  <span>{selectedShift} Shift</span>
                  <motion.span animate={{ rotate: isShiftOpen ? 180 : 0 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
                    <ChevronDown className="w-3 h-3" />
                  </motion.span>
                </motion.button>

                {/* Backdrop */}
                {isShiftOpen && (
                  <div className="fixed inset-0 z-199" onClick={() => setIsShiftOpen(false)} />
                )}

                {/* Dropdown Panel */}
                <AnimatePresence>
                  {isShiftOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 z-200 min-w-40 overflow-hidden"
                    >
                      <div className="p-1.5 space-y-0.5">
                        {/* Day */}
                        <motion.button
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { onShiftChange('Day'); setIsShiftOpen(false); }}
                          className={`flex items-center gap-3 px-3 py-2.5 text-left w-full rounded-xl transition-colors text-xs font-black uppercase tracking-wider ${
                            selectedShift === 'Day'
                              ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-300'
                              : 'text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Sun className={`w-4 h-4 ${selectedShift === 'Day' ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`} />
                          Day Shift
                          {selectedShift === 'Day' && (
                            <motion.div layoutId="shiftIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                          )}
                        </motion.button>

                        {/* Night */}
                        <motion.button
                          whileHover={{ x: 3 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { onShiftChange('Night'); setIsShiftOpen(false); }}
                          className={`flex items-center gap-3 px-3 py-2.5 text-left w-full rounded-xl transition-colors text-xs font-black uppercase tracking-wider ${
                            selectedShift === 'Night'
                              ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300'
                              : 'text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Moon className={`w-4 h-4 ${selectedShift === 'Night' ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`} />
                          Night Shift
                          {selectedShift === 'Night' && (
                            <motion.div layoutId="shiftIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
