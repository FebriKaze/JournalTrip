import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Header from './components/dashboard/Header';
import RitaseTracking from './components/dashboard/RitaseTracking';
import DriversPage from './pages/DriversPage';
import { fetchDashboardData, fetchActiveDrivers } from './services/dataFetcher';
import { Ritase, Driver } from './types';
import { supabase } from './lib/supabase';
import { SpeedInsights } from "@vercel/speed-insights/react"

type Page = 'dashboard' | 'drivers';



export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedArea, setSelectedArea] = useState('JBK');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedShift, setSelectedShift] = useState<'Day' | 'Night'>('Day');
  const [ritases, setRitases] = useState<Ritase[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDriversLoading, setIsDriversLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Add transition class for smooth theme change
    root.classList.add('theme-transition');
    
    // Immediate theme change for better performance
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    
    localStorage.setItem('theme', theme);
    
    // Remove transition class quickly
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 500);
  }, [theme]);

  // 1. Load Drivers (only relevant for Journal Trip dashboard)
  const loadDrivers = useCallback(async () => {
    setIsDriversLoading(true);
    const data = await fetchActiveDrivers(selectedDate, selectedArea, selectedShift);
    setDrivers(data);

    if (data.length > 0) {
      const stillInList = data.find(d => d.id === selectedDriverId);
      if (!stillInList) setSelectedDriverId(data[0].id);
    } else {
      setSelectedDriverId('');
      setSelectedDriver(undefined);
      setRitases([]);
    }
    setIsDriversLoading(false);
  }, [selectedDate, selectedArea, selectedShift, selectedDriverId]);

  useEffect(() => {
    loadDrivers();
  }, [selectedDate, selectedArea, selectedShift]);

  // 2. Load Dashboard Detail
  const loadData = useCallback(async () => {
    if (!selectedDriverId) return;
    setIsLoading(true);
    try {
      const data = await fetchDashboardData(selectedDate, selectedDriverId, selectedArea);
      if (data) {
        setRitases(data.ritases || []);
        if (data.driverDetails) setSelectedDriver(data.driverDetails);
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
  }, [selectedDate, selectedDriverId, selectedArea]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 3. Real-time Subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => {
        loadData();
        loadDrivers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, () => {
        loadData();
        loadDrivers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadData, loadDrivers]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const sidebarWidth = isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64';

  return (
    <div 
      data-theme={theme}
      className={`flex min-h-screen bg-(--bg-app) text-(--text-main) transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}
    >
      {/* ── SIDEBAR (Main Navigation) ── */}
      <Sidebar
        drivers={drivers}
        selectedDriverId={selectedDriverId}
        onDriverSelect={setSelectedDriverId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(c => !c)}
        isLoading={isDriversLoading}
        currentPage={currentPage}
        theme={theme}
        onPageChange={(page) => {
          setCurrentPage(page);
          setIsSidebarOpen(false);
        }}
      />

      {/* ── NAVBAR (Top Bar) ── */}
      <Navbar
        currentPage={currentPage}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedShift={selectedShift}
        onShiftChange={setSelectedShift}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(o => !o)}
        isSidebarCollapsed={isSidebarCollapsed}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      {/* ── MAIN CONTENT ── */}
      <main className={`flex-1 transition-all duration-300 ${sidebarWidth} pt-16 min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Journal Trip Dashboard */}
              {currentPage === 'dashboard' && (
                <>
                  <Header
                    driver={selectedDriver as any}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    selectedArea={selectedArea}
                    onAreaChange={setSelectedArea}
                  />
                  <div className="mt-6">
                    <RitaseTracking
                      selectedDate={selectedDate}
                      ritases={ritases}
                      isLoading={isLoading}
                    />
                  </div>
                </>
              )}

              {/* Drivers Registry */}
              {currentPage === 'drivers' && <DriversPage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <SpeedInsights />
    </div>
  );
}
