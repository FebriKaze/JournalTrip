import { Calendar as CalendarIcon, Menu, X, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';
import Logo from '../../image/Logo.png';

interface NavbarProps {
  currentPage: 'dashboard' | 'drivers';
  onPageChange: (page: 'dashboard' | 'drivers') => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedShift: 'Day' | 'Night';
  onShiftChange: (shift: 'Day' | 'Night') => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Navbar({ 
  currentPage, 
  onPageChange, 
  selectedDate, 
  onDateChange, 
  selectedShift,
  onShiftChange,
  isSidebarOpen, 
  onToggleSidebar,
  isSidebarCollapsed,
  onToggleCollapse
}: NavbarProps) {
  return (
    <nav className={`fixed top-0 left-0 ${isSidebarCollapsed ? 'md:left-20' : 'md:left-64'} right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 h-16 flex justify-between items-center px-4 md:px-8 shadow-sm transition-all duration-300`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo and Brand */}
        <div className="flex items-center gap-3 ml-2 shrink-0">
          <div className="h-10 w-28 md:w-32 flex items-center justify-center overflow-hidden">
            <img src={Logo} alt="KMDI" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-black tracking-tighter text-red-600 hidden lg:block uppercase drop-shadow-sm whitespace-nowrap border-l-2 border-slate-200 pl-3">
            Journal Trip
          </span>
        </div>

        <div className="hidden md:flex gap-8 ml-10 h-full">
          <button 
            onClick={() => onPageChange('dashboard')}
            className={`transition-all font-bold h-full flex items-center px-1 border-b-2 relative top-px ${
              currentPage === 'dashboard' ? 'text-red-600 border-red-600' : 'text-slate-500 border-transparent hover:text-red-600'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => onPageChange('drivers')}
            className={`transition-all font-bold h-full flex items-center px-1 border-b-2 relative top-px ${
              currentPage === 'drivers' ? 'text-red-600 border-red-600' : 'text-slate-500 border-transparent hover:text-red-600'
            }`}
          >
            Drivers
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4">
        {/* Shift Selector */}
        <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onShiftChange('Day')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
              selectedShift === 'Day' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sun className={`w-3.5 h-3.5 ${selectedShift === 'Day' ? 'text-orange-500' : ''}`} />
            DAY
          </button>
          <button
            onClick={() => onShiftChange('Night')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
              selectedShift === 'Night' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Moon className={`w-3.5 h-3.5 ${selectedShift === 'Night' ? 'text-blue-500' : ''}`} />
            NIGHT
          </button>
        </div>
      </div>
    </nav>
  );
}
