import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Leaf, Droplets, Fuel, DollarSign, Zap, TreePine, TrendingUp,
  Calendar, MapPin, Route as RouteIcon, Edit2, Check, X, ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { fetchCarbonFootprintForDriver, CarbonSummary, treesEquivalent } from '../services/carbonFootprintService';
import { fetchActiveDrivers } from '../services/dataFetcher';
import { Driver } from '../types';

const COLORS = ['#10b981', '#059669', '#047857', '#065f46'];

export default function CarbonNeutralPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedArea, setSelectedArea] = useState('JBK');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [carbonData, setCarbonData] = useState<CarbonSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingDistance, setEditingDistance] = useState<string>('');
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [driverDropdownOpen, setDriverDropdownOpen] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const driverRef = useRef<HTMLDivElement>(null);

  const areas = ['JBK', 'NGORO', 'SUMATERA', 'TMMIN'];

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (areaRef.current && !areaRef.current.contains(event.target as Node)) setAreaDropdownOpen(false);
      if (driverRef.current && !driverRef.current.contains(event.target as Node)) setDriverDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load drivers on mount and when area/date changes
  useEffect(() => {
    const loadDrivers = async () => {
      const data = await fetchActiveDrivers(selectedDate, selectedArea);
      setDrivers(data);
      if (data.length > 0 && !selectedDriverId) {
        setSelectedDriverId(data[0].id);
      }
    };
    loadDrivers();
  }, [selectedDate, selectedArea]);

  // Load carbon data
  useEffect(() => {
    const loadCarbonData = async () => {
      if (!selectedDriverId) return;
      setIsLoading(true);
      const data = await fetchCarbonFootprintForDriver(selectedDate, selectedDriverId, selectedArea);
      setCarbonData(data);
      setIsLoading(false);
    };
    loadCarbonData();
  }, [selectedDate, selectedDriverId, selectedArea]);

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full"
      >
        {/* Date Picker */}
        <div className="flex-1 sm:flex-initial">
          <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 inline mr-2" />
            Tanggal
          </label>
          <input
            type="date"
            value={selectedDate}
            onClick={(e) => 'showPicker' in e.currentTarget && (e.currentTarget as any).showPicker()}
            onMouseDown={(e) => e.preventDefault()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all shadow-sm select-none"
          />
        </div>

        {/* Area Dropdown */}
        <div className="relative group" ref={areaRef}>
          <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 inline mr-2" />
            Area
          </label>
          <button
            onClick={() => setAreaDropdownOpen(!areaDropdownOpen)}
            className="w-full sm:w-40 flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <span className="truncate">{selectedArea}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${areaDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {areaDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 top-full mt-2 w-full sm:w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
              >
                {areas.map(area => (
                  <button
                    key={area}
                    onClick={() => { setSelectedArea(area); setAreaDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedArea === area
                        ? 'bg-green-500 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Driver Dropdown */}
        <div className="relative group flex-1 sm:flex-initial" ref={driverRef}>
          <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            Driver
          </label>
          <button
            onClick={() => setDriverDropdownOpen(!driverDropdownOpen)}
            className="w-full sm:w-48 flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <span className="truncate">
              {drivers.find(d => d.id === selectedDriverId)?.name || 'Pilih Driver'}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${driverDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {driverDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 w-full sm:w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 max-h-64 overflow-y-auto"
              >
                {drivers.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 italic">
                    No drivers available
                  </div>
                ) : (
                  drivers.map(driver => (
                    <button
                      key={driver.id}
                      onClick={() => { setSelectedDriverId(driver.id); setDriverDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-b border-slate-100 dark:border-slate-700 last:border-b-0 ${
                        selectedDriverId === driver.id
                          ? 'bg-green-500 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{driver.name}</span>
                        {driver.noPolisi && <span className="text-[9px] ml-2 px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded truncate">{driver.noPolisi}</span>}
                      </div>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="rounded-3xl border border-amber-300 bg-amber-50/80 dark:bg-amber-900/20 dark:border-amber-700 p-4 text-sm text-amber-900 dark:text-amber-100 shadow-sm">
        <div className="flex items-center gap-2 font-black uppercase tracking-wider text-xs">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">!</span>
          Sedang di-develop
        </div>
        <p className="mt-2 text-[11px] leading-5 text-amber-800 dark:text-amber-100">
          Fitur Carbon Netral sedang dalam pengembangan.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          </motion.div>
        ) : carbonData && selectedDriver ? (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard
                icon={Leaf}
                label="Total CO₂"
                value={carbonData.totalCO2.toFixed(2)}
                unit="kg"
                color="text-green-600"
                bgColor="bg-green-50 dark:bg-green-900/20"
              />
              <SummaryCard
                icon={TreePine}
                label="Trees Equivalent"
                value={treesEquivalent(carbonData.totalCO2).toFixed(2)}
                unit="pohon"
                color="text-green-600"
                bgColor="bg-green-50 dark:bg-green-900/20"
              />
              <SummaryCard
                icon={Fuel}
                label="Fuel Used"
                value={carbonData.totalFuel.toFixed(2)}
                unit="L"
                color="text-orange-600"
                bgColor="bg-orange-50 dark:bg-orange-900/20"
              />
              <SummaryCard
                icon={DollarSign}
                label="Fuel Cost"
                value={(carbonData.totalCost / 1000).toFixed(1)}
                unit="Rb"
                color="text-red-600"
                bgColor="bg-red-50 dark:bg-red-900/20"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distance & Emissions Bar Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <RouteIcon className="w-5 h-5" />
                  Per Ritase
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={carbonData.footprints}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="ritaseNo" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563' }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="distance" fill="#10b981" name="Jarak (km)" />
                    <Bar yAxisId="right" dataKey="co2Emissions" fill="#f59e0b" name="CO₂ (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Emissions Pie Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Kontribusi CO₂ per Ritase
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={carbonData.footprints}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ ritaseNo, co2Emissions }: any) => `${ritaseNo}: ${co2Emissions.toFixed(1)}kg`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="co2Emissions"
                    >
                      {carbonData.footprints.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Detailed Ritase Table with Edit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50 overflow-x-auto"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Detail Ritase & Carbon Footprint
              </h3>

              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Ritase</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Rute</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Jarak (km)</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">CO₂ (kg)</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Bahan Bakar (L)</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Biaya (IDR)</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {carbonData.footprints.map((footprint, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {footprint.ritaseNo}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                        {footprint.route}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingIndex === idx ? (
                          <input
                            type="number"
                            value={editingDistance}
                            onChange={(e) => setEditingDistance(e.target.value)}
                            className="w-20 px-2 py-1 rounded border border-green-500 dark:border-green-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-right"
                            autoFocus
                          />
                        ) : (
                          <span className="text-slate-900 dark:text-slate-100 font-medium">
                            {footprint.distance.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-semibold">
                        {footprint.co2Emissions.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-orange-600 dark:text-orange-400 font-semibold">
                        {footprint.fuelConsumption.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-semibold">
                        Rp {(footprint.cost / 1000).toFixed(0)}k
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingIndex === idx ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingIndex(idx);
                              setEditingDistance(footprint.distance.toString());
                            }}
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl p-6"
            >
              <h4 className="font-bold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Informasi Carbon Footprint
              </h4>
              <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                <li>• CO₂ dihitung berdasarkan jarak perjalanan (100g CO₂/km untuk truck standar)</li>
                <li>• 1 pohon menyerap ~20kg CO₂ per tahun</li>
                <li>• Biaya bahan bakar menggunakan harga standar Rp 7.500/liter</li>
                <li>• Edit jarak di kolom "Jarak (km)" untuk update perhitungan</li>
              </ul>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Leaf className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Pilih driver untuk melihat carbon footprint</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  color: string;
  bgColor: string;
}

function SummaryCard({ icon: Icon, label, value, unit, color, bgColor }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${bgColor} rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>
            {value} <span className="text-lg">{unit}</span>
          </p>
        </div>
        <Icon className={`w-10 h-10 ${color} opacity-20`} />
      </div>
    </motion.div>
  );
}
