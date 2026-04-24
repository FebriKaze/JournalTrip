import { Driver, Ritase } from '../types';

export const DRIVERS: Driver[] = [
  { id: '8821', name: 'A. Thompson', status: 'online', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop' },
  { id: '4412', name: 'M. Rossi', status: 'online', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: '9033', name: 'S. Chen', status: 'offline', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: '2105', name: 'K. Muller', status: 'online', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
];

export const RITASE_DATA: Ritase[] = [
  {
    id: 1,
    title: 'Ritase 1',
    subtitle: 'Coal Hauling • Route A',
    status: 'Finished',
    type: 'completed',
    duration: '02h 15m',
    steps: [
      { label: 'OUTPOOL', plan: '06:00', actual: '06:02', type: 'completed' },
      { label: 'IN PDC', plan: '06:45', actual: '06:47', type: 'completed' },
      { label: 'OUT PDC', plan: '07:15', actual: '07:20', type: 'completed' },
      { label: 'ARRIVAL PDC', plan: '08:15', actual: '08:15', type: 'completed' },
    ]
  },
  {
    id: 2,
    title: 'Ritase 2',
    subtitle: 'Coal Hauling • Route B',
    status: 'Active',
    type: 'active',
    duration: '01h 45m',
    steps: [
      { label: 'OUTPOOL', plan: '08:30', actual: '08:32', type: 'completed' },
      { label: 'IN PDC', plan: '09:15', actual: '09:18', type: 'completed' },
      { label: 'OUT PDC', plan: '09:45', actual: '10:02', type: 'active', delay: '+17m' },
      { label: 'ARRIVAL PDC', plan: '11:15', actual: '--:--', type: 'pending' },
    ]
  }
];

