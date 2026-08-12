export type CarbonCategory =
  | 'Transportation'
  | 'Electricity'
  | 'Fuel'
  | 'Food'
  | 'Waste'
  | 'Water'
  | 'Shopping'
  | 'Travel';

export interface CarbonEntry {
  id: number;
  category: CarbonCategory;
  title: string;
  amount: number;
  unit: string;
  date: string;
  notes: string;
  emissionsKg: number;
}

export interface Goal {
  id: number;
  title: string;
  type: string;
  target: number;
  progress: number;
  unit: string;
  deadline: string;
}

export interface Challenge {
  id: number;
  title: string;
  category: string;
  location: string;
  participants: number;
  reward: number;
  progress: number;
  joined: boolean;
}

export interface Recommendation {
  title: string;
  impact: string;
  effort: 'Low' | 'Medium' | 'High';
  reason: string;
}

export interface Profile {
  name: string;
  email: string;
  location: string;
  lifestyle: string;
  interests: string[];
}

export interface LoginUser {
  name: string;
  email: string;
}
