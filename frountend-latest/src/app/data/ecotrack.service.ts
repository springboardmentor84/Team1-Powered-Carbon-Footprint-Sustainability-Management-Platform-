import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CarbonCategory,
  CarbonEntry,
  Challenge,
  Goal,
  LoginUser,
  Profile,
  Recommendation
} from '../app.models';


// =========================================================
// CARBON EMISSION FACTORS
// =========================================================

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


// =========================================================
// INITIAL FRONTEND DATA
// =========================================================

const initialEntries: CarbonEntry[] = [
  {
    id: 1,
    category: 'Transportation',
    title: 'Office commute by car',
    amount: 46,
    unit: 'km',
    date: '2026-07-28',
    notes: 'Round trip',
    emissionsKg: 9.66
  },
  {
    id: 2,
    category: 'Electricity',
    title: 'Home electricity use',
    amount: 18,
    unit: 'kWh',
    date: '2026-07-29',
    notes: 'Daily meter reading',
    emissionsKg: 14.76
  },
  {
    id: 3,
    category: 'Food',
    title: 'Mixed diet meals',
    amount: 3,
    unit: 'meals',
    date: '2026-07-30',
    notes: 'Included one meat meal',
    emissionsKg: 5.4
  },
  {
    id: 4,
    category: 'Water',
    title: 'Household water usage',
    amount: 280,
    unit: 'litres',
    date: '2026-07-30',
    notes: 'Estimated usage',
    emissionsKg: 0.28
  }
];


const initialGoals: Goal[] = [
  {
    id: 1,
    title: 'Reduce monthly carbon emissions',
    type: 'Reduce Carbon Emissions',
    target: 180,
    progress: 122,
    unit: 'kg CO2e',
    deadline: '2026-08-31'
  },
  {
    id: 2,
    title: 'Use public transport more often',
    type: 'Use Public Transport',
    target: 20,
    progress: 11,
    unit: 'rides',
    deadline: '2026-08-20'
  },
  {
    id: 3,
    title: 'Increase recycling at home',
    type: 'Increase Recycling',
    target: 30,
    progress: 18,
    unit: 'kg',
    deadline: '2026-09-05'
  }
];


@Injectable({
  providedIn: 'root'
})
export class EcoTrackService {

  // =======================================================
  // BACKEND
  // =======================================================

  private readonly apiUrl = 'http://localhost:9042';

  private readonly tokenKey = 'ecotrack.token';

  // =======================================================
  // CONSTRUCTOR
  // =======================================================

  constructor(
    private http: HttpClient
  ) {
    this.initProfile();
  }


  // =======================================================
  // CONSTANT DATA
  // =======================================================

  readonly categories: CarbonCategory[] = [
    'Transportation',
    'Electricity',
    'Fuel',
    'Food',
    'Waste',
    'Water',
    'Shopping',
    'Travel'
  ];


  readonly goalTypes = [
    'Reduce Carbon Emissions',
    'Reduce Electricity Consumption',
    'Reduce Water Usage',
    'Increase Recycling',
    'Reduce Plastic Usage',
    'Use Public Transport',
    'Plant Trees'
  ];


  readonly interestOptions = [
    'Renewable Energy',
    'Recycling',
    'Waste Reduction',
    'Sustainable Living',
    'Green Transportation',
    'Water Conservation',
    'Eco-Friendly Products',
    'Climate Action',
    'Organic Farming',
    'Wildlife Conservation'
  ];


  // =======================================================
  // CURRENT USER
  // =======================================================

  readonly currentUser =
    signal<LoginUser | null>(
      this.initCurrentUserFromToken()
    );


  readonly isAuthenticated =
    computed(
      () => this.currentUser() !== null
    );


  // =======================================================
  // PROFILE
  // =======================================================

  readonly profile =
    signal<Profile>({
      name: 'Loading...',
      email: '',
      location: '',
      lifestyle: '',
      interests: [],
      role: 'USER'
    });


  // Initialize profile by fetching from backend if authenticated
  initProfile(): void {
    if (this.isAuthenticated()) {
      this.loadProfileFromBackend();
    }
  }


  // =======================================================
  // LOCAL DATA (Empty defaults, populated by APIs)
  // =======================================================

  readonly entries =
    signal<CarbonEntry[]>([]);


  readonly goals =
    signal<Goal[]>([]);


  // =======================================================
  // CHALLENGES
  // REAL BACKEND DATA
  // =======================================================

  readonly challenges =
    signal<Challenge[]>([]);


  // =======================================================
  // LOCAL CALCULATIONS
  // =======================================================

  readonly totalEmissions =
    computed(() =>
      this.entries().reduce(
        (sum, entry) =>
          sum + entry.emissionsKg,
        0
      )
    );


  readonly monthlyTarget =
    computed(() =>
      this.goals().find(
        goal =>
          goal.type ===
          'Reduce Carbon Emissions'
      )?.target ?? 200
    );


  readonly sustainabilityScore =
    computed(() =>
      Math.max(
        35,
        Math.round(
          100 -
          (
            this.totalEmissions() /
            this.monthlyTarget()
          ) * 38
        )
      )
    );


  // =======================================================
  // RECOMMENDATIONS
  // =======================================================

  readonly recommendations =
    computed<Recommendation[]>(() => {

      const entries =
        this.entries();


      const byCategory =
        this.categories
          .map(category => ({
            category,

            total:
              entries
                .filter(
                  entry =>
                    entry.category ===
                    category
                )
                .reduce(
                  (sum, entry) =>
                    sum +
                    entry.emissionsKg,
                  0
                )
          }))
          .sort(
            (a, b) =>
              b.total - a.total
          );


      const top =
        byCategory[0]?.category ??
        'Transportation';


      return [

        {
          title:
            top === 'Electricity'
              ? 'Shift heavy appliance use to daylight hours'
              : 'Replace two short car trips this week',

          impact:
            top === 'Electricity'
              ? 'Save 8-12 kg CO2e monthly'
              : 'Save 5-9 kg CO2e weekly',

          effort: 'Low',

          reason:
            `${top} is currently your largest tracked footprint area.`
        },

        {
          title:
            'Create a smart water and waste reminder',

          impact:
            'Improve goal consistency by 14%',

          effort: 'Medium',

          reason:
            'Your active goals benefit from smaller weekly checkpoints.'
        },

        {
          title:
            'Join a community challenge near your location',

          impact:
            'Earn rewards and improve streaks',

          effort: 'Low',

          reason:
            'Challenge participation increases completion rates in your profile segment.'
        }

      ];

    });


  // =======================================================
  // JWT AUTHORIZATION
  // =======================================================

  private getAuthHeaders(): HttpHeaders {

    const token =
      localStorage.getItem(
        this.tokenKey
      );


    console.log(
      'JWT token available:',
      !!token
    );


    if (!token) {

      return new HttpHeaders({
        'Content-Type':
          'application/json'
      });

    }


    return new HttpHeaders({

      'Content-Type':
        'application/json',

      'Authorization':
        `Bearer ${token}`

    });

  }


  // =======================================================
  // LOGIN
  // =======================================================

  loginToBackend(
    email: string,
    password: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/login`,
      {
        email,
        password
      }
    );

  }


  // =======================================================
  // SAVE JWT
  // =======================================================
  saveBackendToken(
    response: any
  ): void {
  
    if (!response) {
      return;
    }
  
    const token =
      response.token ||
      response.accessToken ||
      response.jwt;
  
    if (!token) {
  
      console.warn(
        'JWT token was not found in login response'
      );
  
      return;
    }
  
  
    // A token replacement is a user/session boundary. Clear every
    // in-memory value before accepting the new identity.
    this.currentUser.set(null);
    this.clearUserSpecificState();

    // Save JWT
  
    localStorage.setItem(
      this.tokenKey,
      token
    );
  
  
    console.log(
      'JWT saved successfully'
    );
  
  
    // ==========================================
    // GET ROLE
    // ==========================================
  
    let role =
      response.role ||
      response.user?.role ||
      response.user?.user?.role;
  
  
    // ==========================================
    // IF ROLE IS NOT IN RESPONSE,
    // READ IT FROM JWT
    // ==========================================
  
    if (!role) {
  
      try {
  
        const payload =
          token.split('.')[1];
  
        if (payload) {
  
          const decoded =
            JSON.parse(
              atob(
                payload
                  .replace(/-/g, '+')
                  .replace(/_/g, '/')
              )
            );
  
  
          role =
            decoded.role ||
            decoded.roles?.[0] ||
            decoded.authorities?.[0] ||
            null;
  
        }
  
      } catch (error) {
  
        console.error(
          'Unable to read role from JWT:',
          error
        );
  
      }
  
    }
  
  
    // ==========================================
    // NORMALIZE ROLE
    // ==========================================
  
    role =
      role
        ? String(role)
            .replace(
              'ROLE_',
              ''
            )
            .toUpperCase()
        : 'USER';
  
  
    // ==========================================
    // SAVE ROLE INTO PROFILE
    // ==========================================
  
    this.profile.update(
      profile => ({
        ...profile,
        role: role
      })
    );
  
  
    console.log(
      'Logged in user role:',
      role
    );
  
  }


  // =======================================================
  // GET TOKEN
  // =======================================================

  getToken(): string | null {

    return localStorage.getItem(
      this.tokenKey
    );

  }


  // =======================================================
  // PROFILE BACKEND
  // =======================================================

  loadProfileFromBackend(): void {
    const tokenAtRequest = this.getToken();

    this.http.get<any>(
      `${this.apiUrl}/profile`,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: (profile) => {
        if (!tokenAtRequest || tokenAtRequest !== this.getToken()) {
          return;
        }

        this.profile.update(p => ({
          ...p,
          name: profile.name || p.name,
          email: profile.email || p.email,
          role: profile.role || p.role
        }));
      },
      error: () => {}
    });
  }


  // =======================================================
  // INIT USER FROM TOKEN
  // =======================================================

  private initCurrentUserFromToken(): LoginUser | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        localStorage.removeItem(this.tokenKey);
        return null;
      }

      return {
        email: payload.sub || '',
        name: payload.name || 'User'
      };
    } catch {
      return null;
    }
  }


  // =======================================================
  // ANALYTICS BACKEND
  // =======================================================

  getAnalyticsFromBackend(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/analytics`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  // =======================================================
  // CARBON BACKEND
  // =======================================================

  // GET /carbon

  getCarbonEntriesFromBackend():
    Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/carbon`,
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // POST /carbon

  addCarbonEntryToBackend(
    entry: {
      category: string;
      activityType: string;
      quantity: number;
      unit: string;
      entryDate: string;
    }
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/carbon`,
      entry,
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // GET /carbon/summary

  getCarbonSummaryFromBackend():
    Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/carbon/summary`,
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // DELETE /carbon/{id}

  deleteCarbonEntryFromBackend(
    id: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/carbon/${id}`,
      {
        headers:
          this.getAuthHeaders(),

        responseType:
          'text'
      }
    );

  }


  // =======================================================
  // AI RECOMMENDATIONS
  // =======================================================

  getAIRecommendations():
    Observable<string> {

    return this.http.get(
      `${this.apiUrl}/ai/recommendations`,
      {
        headers:
          this.getAuthHeaders(),

        responseType:
          'text'
      }
    );

  }


  // =======================================================
  // GAMIFICATION BACKEND
  // =======================================================

  getGamificationFromBackend():
    Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/gamification`,
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // =======================================================
  // LEADERBOARD BACKEND
  // =======================================================

  getLeaderboardFromBackend():
    Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/leaderboard`,
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // =======================================================
  // NOTIFICATION BACKEND
  // =======================================================

  // GET /notifications

  getNotificationsFromBackend():
    Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/notifications`,
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // GET /notifications/unread-count

  getUnreadCountFromBackend():
    Observable<number> {

    return this.http.get<number>(
      `${this.apiUrl}/notifications/unread-count`,
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // PUT /notifications/{id}/read

  markNotificationReadBackend(
    id: number
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/notifications/${id}/read`,
      {},
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // =======================================================
  // CHALLENGES BACKEND
  // =======================================================

  // GET /challenges

  getChallengesFromBackend():
    Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/challenges`,
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // =======================================================
  // CREATE CHALLENGE - ADMIN
  // =======================================================

  createChallengeToBackend(
    challenge: {
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      reward: number;
    }
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/challenges`,
      challenge,
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // =======================================================
  // DELETE CHALLENGE - ADMIN
  // =======================================================

  deleteChallengeFromBackend(
    challengeId: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/challenges/${challengeId}`,
      {
        headers:
          this.getAuthHeaders(),

        responseType:
          'text'
      }
    );

  }


  // =======================================================
  // LOAD CHALLENGES FROM BACKEND
  // =======================================================

  loadChallengesFromBackend(): void {

    this.getChallengesFromBackend()
      .subscribe({

        next: (backendChallenges) => {

          const challenges: Challenge[] =
            backendChallenges.map(
              (challenge) => ({

                id:
                  challenge.id,

                title:
                  challenge.title,

                category:
                  'Community',

                location:
                  'Online',

                participants:
                  0,

                reward:
                  challenge.reward ?? 0,

                progress:
                  0,

                joined:
                  false

              })
            );


          this.challenges.set(
            challenges
          );


          // Check whether the current
          // user has joined each challenge

          challenges.forEach(
            (challenge) => {

              this.getChallengeJoinedStatus(
                challenge.id
              )
              .subscribe({

                next: (joined) => {

                  this.challenges.update(
                    items =>
                      items.map(
                        item =>
                          item.id ===
                          challenge.id

                            ? {
                                ...item,
                                joined
                              }

                            : item
                      )
                  );

                },

                error: (error) => {

                  console.error(
                    'Failed to check challenge status:',
                    error
                  );

                }

              });

            }
          );

        },

        error: (error) => {

          console.error(
            'Failed to load challenges:',
            error
          );

        }

      });

  }


  // =======================================================
  // JOIN CHALLENGE BACKEND
  // =======================================================

  joinChallengeToBackend(
    id: number
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/challenges/${id}/join`,
      {},
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // =======================================================
  // JOIN CHALLENGE
  // =======================================================

  joinChallenge(
    challengeId: number
  ): void {

    this.joinChallengeToBackend(
      challengeId
    )
    .subscribe({

      next: () => {

        this.challenges.update(
          items =>
            items.map(
              challenge =>
                challenge.id ===
                challengeId

                  ? {
                      ...challenge,
                      joined: true
                    }

                  : challenge
            )
        );


        console.log(
          'Challenge joined successfully'
        );

      },

      error: (error) => {

        console.error(
          'Failed to join challenge:',
          error
        );


        alert(
          error?.error?.message ||
          'Unable to join challenge'
        );

      }

    });

  }


  // =======================================================
  // CHECK JOINED STATUS
  // =======================================================

  getChallengeJoinedStatus(
    id: number
  ): Observable<boolean> {

    return this.http.get<boolean>(
      `${this.apiUrl}/challenges/${id}/joined`,
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }

  getChallengeStatus(
    id: number
  ): Observable<string> {
    return this.http.get<string>(
      `${this.apiUrl}/challenges/${id}/status`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }


  // =======================================================
  // LEAVE CHALLENGE BACKEND
  // =======================================================

  leaveChallengeFromBackend(
    id: number
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/challenges/${id}/leave`,
      {},
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }

  completeChallengeToBackend(
    id: number
  ): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/challenges/${id}/complete`,
      {},
      {
        headers: this.getAuthHeaders()
      }
    );
  }


  // =======================================================
  // LEAVE CHALLENGE
  // =======================================================

  leaveChallenge(
    challengeId: number
  ): void {

    this.leaveChallengeFromBackend(
      challengeId
    )
    .subscribe({

      next: () => {

        this.challenges.update(
          items =>
            items.map(
              challenge =>
                challenge.id ===
                challengeId

                  ? {
                      ...challenge,
                      joined: false
                    }

                  : challenge
            )
        );


        console.log(
          'Challenge left successfully'
        );

      },

      error: (error) => {

        console.error(
          'Failed to leave challenge:',
          error
        );


        alert(
          error?.error?.message ||
          'Unable to leave challenge'
        );

      }

    });

  }


  // =======================================================
  // GOALS BACKEND
  // =======================================================

  // GET /goals

  getGoalsFromBackend():
    Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/goals`,
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // =======================================================
  // POST /goals
  // =======================================================

  addGoalToBackend(
    goal: {
      goalName: string;
      targetValue: number;
      currentValue: number;
      startDate: string;
      endDate: string;
      status: string;
    }
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrl}/goals`,
      goal,
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // =======================================================
  // PUT /goals/{id}
// =======================================================

  updateGoalProgressBackend(
    id: number,
    goal: {
      goalName: string;
      targetValue: number;
      currentValue: number;
      startDate: string;
      endDate: string;
      status: string;
    }
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/goals/${id}`,
      goal,
      {
        headers:
          this.getAuthHeaders()
      }
    );

  }


  // =======================================================
  // DELETE /goals/{id}
  // =======================================================

  deleteGoalFromBackend(
    goalId: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/goals/${goalId}`,
      {
        headers:
          this.getAuthHeaders(),

        responseType:
          'text'
      }
    );

  }


  // =======================================================
  // OLD LOCAL CARBON FUNCTION
  // =======================================================

  addEntry(
    entry:
      Omit<
        CarbonEntry,
        'id' | 'emissionsKg'
      >
  ): void {

    const emissionsKg =
      Number(
        (
          entry.amount *
          emissionFactors[
            entry.category
          ]
        ).toFixed(2)
      );


    this.entries.update(
      items => [

        {
          ...entry,
          id: Date.now(),
          emissionsKg
        },

        ...items

      ]
    );


  }


  // =======================================================
  // LOCAL LOGIN USER
  // =======================================================

  login(
    email: string,
    name = 'EcoTrack User'
  ): void {

    const authenticatedRole = this.profile().role || 'USER';
    this.clearUserSpecificState();

    const user = {
      name,
      email
    };


    this.currentUser.set(
      user
    );


    this.profile.update(
      profile => ({
        ...profile,
        name,
        email,
        role: authenticatedRole
      })
    );


    // Sync profile with backend data
    this.loadProfileFromBackend();

  }


  // =======================================================
  // REGISTER
  // =======================================================

  register(
    name: string,
    email: string,
    location: string
  ): void {
    // Registration is not authentication. The real registration flow in
    // LoginComponent obtains a JWT by calling /login after /register.
    this.clearUserSpecificState();
    this.profile.set({

      ...this.profile(),

      name,

      email,

      location,

      lifestyle:
        'New EcoTrack member'

    });

  }


  // =======================================================
  // LOGOUT
  // =======================================================

  logout(): void {

    this.currentUser.set(null);

    this.clearUserSpecificState();

    localStorage.removeItem(
      this.tokenKey
    );

  }

  /** Clear all data that can belong to the previous authenticated user. */
  private clearUserSpecificState(): void {
    this.entries.set([]);
    this.goals.set([]);
    this.challenges.set([]);
    this.profile.set({
      name: '',
      email: '',
      location: '',
      lifestyle: '',
      interests: [],
      role: 'USER'
    });
  }

  getCurrentUserEmail(): string | null {
    return this.currentUser()?.email ?? null;
  }

  isCurrentUserAdmin(): boolean {
    const profileRole = this.profile().role?.toUpperCase();
    if (profileRole === 'ADMIN') {
      return true;
    }

    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role || payload.roles?.[0] || payload.authorities?.[0];
      return String(role ?? '').replace('ROLE_', '').toUpperCase() === 'ADMIN';
    } catch {
      return false;
    }
  }


  // =======================================================
  // LOCAL GOALS
  // =======================================================

  addGoal(
    goal:
      Omit<
        Goal,
        'id' | 'progress'
      >
  ): void {

    this.goals.update(
      items => [

        {
          ...goal,

          id: Date.now(),

          progress: 0
        },

        ...items

      ]
    );


  }


  updateGoalProgress(
    goalId: number,
    progress: number
  ): void {

    this.goals.update(
      items =>
        items.map(
          goal =>

            goal.id === goalId

              ? {

                  ...goal,

                  progress:
                    Math.max(
                      0,
                      Math.min(
                        progress,
                        goal.target
                      )
                    )

                }

              : goal
        )
    );


  }


  // =======================================================
  // PROFILE
  // =======================================================

  updateProfile(
    profile: Profile
  ): void {

    this.profile.set(
      profile
    );

  }


  // =======================================================
  // CATEGORY TOTAL
  // =======================================================

  categoryTotal(
    category: CarbonCategory
  ): number {

    return this.entries()

      .filter(
        entry =>
          entry.category ===
          category
      )

      .reduce(
        (sum, entry) =>
          sum +
          entry.emissionsKg,

        0
      );

  }

}
