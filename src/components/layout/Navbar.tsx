import { useRef } from 'react';
import { Calendar as CalendarIcon, Menu, X, Sun, Moon } from 'lucide-react';

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
}: NavbarProps) {
  const pageInfo = PAGE_TITLES[currentPage];
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <nav className={`
      fixed top-0 z-40 right-0 bg-white/90 backdrop-blur-md border-b border-slate-200/60
      h-16 flex items-center px-4 md:px-6 shadow-sm transition-all duration-300 gap-4
      ${isSidebarCollapsed ? 'md:left-[72px]' : 'md:left-64'} left-0
    `}>
      {/* Hamburger (mobile) */}
      <button
        onClick={onToggleSidebar}
        className="p-2 -ml-1 text-slate-500 hover:bg-slate-100 rounded-xl md:hidden transition-colors shrink-0"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Page Title */}
      <div className="hidden md:block shrink-0">
        <h2 className="text-base font-black text-red-600 leading-tight">{pageInfo.title}</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{pageInfo.sub}</p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── JOURNAL TRIP Controls ── */}
      {currentPage === 'dashboard' && (
        <div className="flex items-center gap-2 md:gap-3">
          <div 
            onClick={() => dateInputRef.current?.showPicker()}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 hover:border-red-400 transition-all cursor-pointer"
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
              className="text-[11px] font-black text-slate-800 border-none focus:ring-0 cursor-pointer p-0 bg-transparent outline-none w-[100px]"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => onShiftChange('Day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${selectedShift === 'Day' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Sun className={`w-3.5 h-3.5 ${selectedShift === 'Day' ? 'text-orange-500' : ''}`} />
              DAY
            </button>
            <button onClick={() => onShiftChange('Night')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${selectedShift === 'Night' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Moon className={`w-3.5 h-3.5 ${selectedShift === 'Night' ? 'text-blue-500' : ''}`} />
              NIGHT
            </button>
          </div>
        </div>
      )}

    </nav>
  );
}
