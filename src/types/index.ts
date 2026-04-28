export interface Driver {
  id: string;
  name: string;
  status: 'online' | 'offline';
  avatar: string;
  noPolisi?: string;
  simNumber?: string;

  simExpiry?: string;
  simStatus?: 'Valid' | 'Expired' | 'Warning' | '--';
  simPhotoUrl?: string;

  nik?: string;
  alamat?: string;
}

export type DriverDetails = Driver;


export interface RitaseStep {
  label: string;
  plan?: string;
  actual: string;
  type: 'completed' | 'active' | 'pending';
  delay?: string;
}

export interface Ritase {
  id: number;
  ritaseNo: string | number;
  route: string;
  noPolisi?: string;
  pdcMuat?: string;
  tujuan?: string;
  status: 'finished' | 'active' | 'locked';
  type: 'completed' | 'active' | 'locked';
  duration: string;
  timeline: RitaseStep[];
}

export interface Readiness {
  physicalHealth: string;
  temperature?: string;
  bloodPressure: string;
  pulse?: string;
  alcoholTest: string;
  eyeCondition?: string;
  lastVerification: string;
}


