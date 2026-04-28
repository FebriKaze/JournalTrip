import { useRef, useState } from 'react';
import { Calendar as CalendarIcon, Menu, X, Sun, Moon, ChevronDown } from 'lucide-react';

type Page = 'dashboard' | 'drivers';

interface NavbarProps {
  currentPage: Page;
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

const PAGE_TITLES: Record<Page, { title: string; sub: string }> = {
  'dashboard': { title: 'Journal Trip', sub: 'Ritase & Driver Tracking' },
  'drivers': { title: 'Drivers', sub: 'Data Registry Pengemudi' },
};

export default function Navbar({
  currentPage,
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
  const pageInfo = PAGE_TITLES[currentPage];
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isShiftOpen, setIsShiftOpen] = useState(false);

  return (
    <nav className={`
      fixed top-0 z-40 right-0 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60
      h-16 flex items-center px-4 md:px-6 shadow-sm transition-all duration-500 gap-4
      ${isSidebarCollapsed ? 'md:left-18' : 'md:left-16'} left-0
    `}>
      {/* Hamburger (mobile) */}
      <button
        onClick={onToggleSidebar}
        className="p-2 -mr-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Page Title */}
      <div className="hidden md:block shrink-0">
        <h2 className="text-base font-black text-red-600 dark:text-red-500 leading-tight">{pageInfo.title}</h2>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{pageInfo.sub}</p>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onThemeToggle();
        }}
        className="relative z-50 p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-yellow-500" />}
      </button>

      {/* ── JOURNAL TRIP Controls ── */}
      {currentPage === 'dashboard' && (
        <div className="flex items-center gap-2 md:gap-3">
          <div 
            onClick={() => dateInputRef.current?.showPicker()}
            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 hover:border-red-400 dark:hover:border-red-500 transition-all cursor-pointer"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={e => {
                onDateChange(e.target.value);
                e.target.blur();
              }}
              className="text-[11px] font-black text-slate-800 dark:text-slate-200 border-none focus:ring-0 cursor-pointer p-0 bg-transparent outline-none w-25"
            />
          </div>
          
          {/* Shift Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsShiftOpen(!isShiftOpen)}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 hover:border-red-400 dark:hover:border-red-500 transition-all cursor-pointer"
            >
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200">{selectedShift}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isShiftOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Shift Options */}
            {isShiftOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 min-w-30">
                <button
                  onClick={() => { onShiftChange('Day'); setIsShiftOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 text-left w-full hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors ${selectedShift === 'Day' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : ''}`}
                >
                  <Sun className={`w-4 h-4 ${selectedShift === 'Day' ? 'text-orange-500' : ''}`} />
                  <span className="text-sm font-medium">Day Shift</span>
                </button>
                <button
                  onClick={() => { onShiftChange('Night'); setIsShiftOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 text-left w-full hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors ${selectedShift === 'Night' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : ''}`}
                >
                  <Moon className={`w-4 h-4 ${selectedShift === 'Night' ? 'text-blue-500' : ''}`} />
                  <span className="text-sm font-medium">Night Shift</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </nav>
  );
}
