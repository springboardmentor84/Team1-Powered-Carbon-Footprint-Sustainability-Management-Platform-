import { Injectable, computed, signal } from '@angular/core';
import { CarbonCategory, CarbonEntry, Challenge, Goal, LoginUser, Profile, Recommendation } from '../app.models';

const emissionFactors: Record<CarbonCategory, number> = {
  Transportation: 0.21,
  Electricity: 0.82,
  Fuel: 2.31,
  Food: 1.8,
  Waste: 0.57,
  Water: 0.001,
  Shopping: 0.42,
  Travel: 0.19
};

const initialEntries: CarbonEntry[] = [
  { id: 1, category: 'Transportation', title: 'Office commute by car', amount: 46, unit: 'km', date: '2026-07-28', notes: 'Round trip', emissionsKg: 9.66 },
  { id: 2, category: 'Electricity', title: 'Home electricity use', amount: 18, unit: 'kWh', date: '2026-07-29', notes: 'Daily meter reading', emissionsKg: 14.76 },
  { id: 3, category: 'Food', title: 'Mixed diet meals', amount: 3, unit: 'meals', date: '2026-07-30', notes: 'Included one meat meal', emissionsKg: 5.4 },
  { id: 4, category: 'Water', title: 'Household water usage', amount: 280, unit: 'litres', date: '2026-07-30', notes: 'Estimated usage', emissionsKg: 0.28 }
];

const initialGoals: Goal[] = [
  { id: 1, title: 'Reduce monthly carbon emissions', type: 'Reduce Carbon Emissions', target: 180, progress: 122, unit: 'kg CO2e', deadline: '2026-08-31' },
  { id: 2, title: 'Use public transport more often', type: 'Use Public Transport', target: 20, progress: 11, unit: 'rides', deadline: '2026-08-20' },
  { id: 3, title: 'Increase recycling at home', type: 'Increase Recycling', target: 30, progress: 18, unit: 'kg', deadline: '2026-09-05' }
];

const initialChallenges: Challenge[] = [
  { id: 1, title: 'Plastic-Free Week', category: 'Waste Reduction', location: 'Online', participants: 1420, reward: 300, progress: 64, joined: true },
  { id: 2, title: 'Cycle To Work', category: 'Green Transportation', location: 'Bengaluru', participants: 840, reward: 450, progress: 37, joined: false },
  { id: 3, title: 'Water Conservation Week', category: 'Water Conservation', location: 'Online', participants: 965, reward: 250, progress: 72, joined: false },
  { id: 4, title: 'Tree Plantation Drive', category: 'Climate Action', location: 'Hyderabad', participants: 510, reward: 600, progress: 51, joined: false }
];

@Injectable({ providedIn: 'root' })
export class EcoTrackService {
  readonly categories: CarbonCategory[] = ['Transportation', 'Electricity', 'Fuel', 'Food', 'Waste', 'Water', 'Shopping', 'Travel'];
  readonly goalTypes = ['Reduce Carbon Emissions', 'Reduce Electricity Consumption', 'Reduce Water Usage', 'Increase Recycling', 'Reduce Plastic Usage', 'Use Public Transport', 'Plant Trees'];
  readonly interestOptions = ['Renewable Energy', 'Recycling', 'Waste Reduction', 'Sustainable Living', 'Green Transportation', 'Water Conservation', 'Eco-Friendly Products', 'Climate Action', 'Organic Farming', 'Wildlife Conservation'];
  readonly currentUser = signal<LoginUser | null>(this.read<LoginUser | null>('currentUser', null));
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  readonly profile = signal<Profile>(this.read('profile', {
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    location: 'Bengaluru, India',
    lifestyle: 'Urban apartment, hybrid work',
    interests: ['Recycling', 'Green Transportation', 'Water Conservation']
  }));

  readonly entries = signal<CarbonEntry[]>(this.read('entries', initialEntries));
  readonly goals = signal<Goal[]>(this.read('goals', initialGoals));
  readonly challenges = signal<Challenge[]>(this.read('challenges', initialChallenges));

  readonly totalEmissions = computed(() => this.entries().reduce((sum, entry) => sum + entry.emissionsKg, 0));
  readonly monthlyTarget = computed(() => this.goals().find((goal) => goal.type === 'Reduce Carbon Emissions')?.target ?? 200);
  readonly sustainabilityScore = computed(() => Math.max(35, Math.round(100 - (this.totalEmissions() / this.monthlyTarget()) * 38)));
  readonly rewardPoints = computed(() => 780 + this.challenges().filter((challenge) => challenge.joined).reduce((sum, item) => sum + item.reward, 0));
  readonly recommendations = computed<Recommendation[]>(() => {
    const entries = this.entries();
    const byCategory = this.categories.map((category) => ({
      category,
      total: entries.filter((entry) => entry.category === category).reduce((sum, entry) => sum + entry.emissionsKg, 0)
    })).sort((a, b) => b.total - a.total);

    const top = byCategory[0]?.category ?? 'Transportation';
    return [
      {
        title: top === 'Electricity' ? 'Shift heavy appliance use to daylight hours' : 'Replace two short car trips this week',
        impact: top === 'Electricity' ? 'Save 8-12 kg CO2e monthly' : 'Save 5-9 kg CO2e weekly',
        effort: 'Low',
        reason: `${top} is currently your largest tracked footprint area.`
      },
      {
        title: 'Create a smart water and waste reminder',
        impact: 'Improve goal consistency by 14%',
        effort: 'Medium',
        reason: 'Your active goals benefit from smaller weekly checkpoints.'
      },
      {
        title: 'Join a community challenge near your location',
        impact: 'Earn rewards and improve streaks',
        effort: 'Low',
        reason: 'Challenge participation increases completion rates in your profile segment.'
      }
    ];
  });

  addEntry(entry: Omit<CarbonEntry, 'id' | 'emissionsKg'>): void {
    const emissionsKg = Number((entry.amount * emissionFactors[entry.category]).toFixed(2));
    this.entries.update((items) => [{ ...entry, id: Date.now(), emissionsKg }, ...items]);
    this.persist('entries', this.entries());
  }

  login(email: string, name = 'EcoTrack User'): void {
    const user = { name, email };
    this.currentUser.set(user);
    this.profile.update((profile) => ({
      ...profile,
      name: profile.name === 'Aarav Sharma' ? name : profile.name,
      email
    }));
    this.persist('currentUser', user);
    this.persist('profile', this.profile());
  }

  register(name: string, email: string, location: string): void {
    const user = { name, email };
    this.currentUser.set(user);
    this.profile.set({
      ...this.profile(),
      name,
      email,
      location,
      lifestyle: 'New EcoTrack member'
    });
    this.persist('currentUser', user);
    this.persist('profile', this.profile());
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('ecotrack.currentUser');
  }

  addGoal(goal: Omit<Goal, 'id' | 'progress'>): void {
    this.goals.update((items) => [{ ...goal, id: Date.now(), progress: 0 }, ...items]);
    this.persist('goals', this.goals());
  }

  updateGoalProgress(goalId: number, progress: number): void {
    this.goals.update((items) => items.map((goal) => goal.id === goalId ? { ...goal, progress: Math.max(0, Math.min(progress, goal.target)) } : goal));
    this.persist('goals', this.goals());
  }

  toggleChallenge(challengeId: number): void {
    this.challenges.update((items) => items.map((challenge) => challenge.id === challengeId ? { ...challenge, joined: !challenge.joined } : challenge));
    this.persist('challenges', this.challenges());
  }

  updateProfile(profile: Profile): void {
    this.profile.set(profile);
    this.persist('profile', profile);
  }

  categoryTotal(category: CarbonCategory): number {
    return this.entries()
      .filter((entry) => entry.category === category)
      .reduce((sum, entry) => sum + entry.emissionsKg, 0);
  }

  private read<T>(key: string, fallback: T): T {
    const value = localStorage.getItem(`ecotrack.${key}`);
    return value ? JSON.parse(value) as T : fallback;
  }

  private persist<T>(key: string, value: T): void {
    localStorage.setItem(`ecotrack.${key}`, JSON.stringify(value));
  }
}
