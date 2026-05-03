import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Header from './components/dashboard/Header';
import RitaseTracking from './components/dashboard/RitaseTracking';
import DriversPage from './pages/DriversPage';
import DriverDetailPage from './pages/DriverDetailPage';
import FleetMonitoringPage from './pages/FleetMonitoringPage';
import EcoDrivingPage from './pages/EcoDrivingPage';
import LeadTimePage from './pages/LeadTimePage';
import { fetchDashboardData, fetchActiveDrivers } from './services/dataFetcher';
import { Ritase, Driver } from './types';
import { supabase } from './lib/supabase';
import { SpeedInsights } from "@vercel/speed-insights/react"

export default function App() {
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
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (savedTheme) return savedTheme;
      
      const hour = new Date().getHours();
      return (hour >= 18 || hour < 6) ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('theme-transition');
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', theme);
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 500);
  }, [theme]);

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leadtimes' }, () => {
        // LeadTimePage handles its own fetching, but we could trigger global refresh if needed
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadData, loadDrivers]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    localStorage.setItem('manual-theme-set', 'true');
  };

  const sidebarWidth = isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64';

  return (
    <BrowserRouter>
      <div 
        data-theme={theme}
        className={`flex min-h-screen bg-(--bg-app) text-(--text-main) transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}
      >
        <Sidebar
          drivers={drivers}
          selectedDriverId={selectedDriverId}
          onDriverSelect={setSelectedDriverId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(c => !c)}
          isLoading={isDriversLoading}
          theme={theme}
        />

        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarWidth}`}>
          <Navbar
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

          <main className="pt-16 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
              <Routes>
                <Route path="/" element={
                  <AnimatePresence mode="wait">
                    {isLoading && !selectedDriver ? (
                      <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8 animate-pulse"
                      >
                        <div className="h-48 bg-slate-100 dark:bg-slate-800/50 rounded-[32px]" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2 h-96 bg-slate-100 dark:bg-slate-800/50 rounded-[32px]" />
                          <div className="h-96 bg-slate-100 dark:bg-slate-800/50 rounded-[32px]" />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                } />
                <Route path="/monitoring" element={<FleetMonitoringPage />} />
                <Route path="/leadtime" element={<LeadTimePage />} />
                <Route path="/eco" element={<EcoDrivingPage />} />
                <Route path="/drivers" element={<DriversPage />} />
                <Route path="/drivers/:id" element={<DriverDetailPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
        <SpeedInsights />
      </div>
    </BrowserRouter>
  );
}
