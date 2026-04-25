import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Header from './components/dashboard/Header';
import RitaseTracking from './components/dashboard/RitaseTracking';
import ReadinessStatus from './components/dashboard/ReadinessStatus';
import DriversPage from './pages/DriversPage';
import { fetchDashboardData, fetchActiveDrivers } from './services/dataFetcher';
import { Ritase, Readiness, Driver } from './types';
import { supabase } from './lib/supabase';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'drivers'>('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedArea, setSelectedArea] = useState('JBK');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedShift, setSelectedShift] = useState<'Day' | 'Night'>('Day');
  const [ritases, setRitases] = useState<Ritase[]>([]);
  const [readiness, setReadiness] = useState<Readiness | undefined>();
  const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDriversLoading, setIsDriversLoading] = useState(true);

  // 1. Load Drivers
  const loadDrivers = useCallback(async () => {
    setIsDriversLoading(true);
    const data = await fetchActiveDrivers(selectedDate, selectedArea, selectedShift);
    setDrivers(data);
    
    if (data.length > 0) {
      const stillInList = data.find(d => d.id === selectedDriverId);
      if (!stillInList) {
        setSelectedDriverId(data[0].id);
      }
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
        setReadiness(data.readiness);
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trips' },
        () => {
          loadData();
          loadDrivers();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drivers' },
        () => {
          loadData();
          loadDrivers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData, loadDrivers]);

  return (
    <div className="flex min-h-screen bg-[#f9f9ff]">
      <Navbar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate}
        selectedShift={selectedShift}
        onShiftChange={setSelectedShift}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <Sidebar 
        drivers={drivers}
        selectedDriverId={selectedDriverId} 
        onDriverSelect={setSelectedDriverId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isLoading={isDriversLoading}
      />

      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} pt-20 px-4 md:px-8 pb-8`}>
        <div className="max-w-7xl mx-auto">
          {currentPage === 'dashboard' ? (
            <>
              <Header 
                driver={selectedDriver as any} 
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                selectedArea={selectedArea}
                onAreaChange={setSelectedArea}
              />
              
              <div className="grid grid-cols-1 gap-8 mt-6">
                <RitaseTracking 
                  selectedDate={selectedDate} 
                  ritases={ritases}
                  isLoading={isLoading}
                />
                <ReadinessStatus data={readiness} />
              </div>
            </>
          ) : (
            <DriversPage />
          )}
        </div>
      </main>
    </div>
  );
}
