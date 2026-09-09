import { CommonModule } from '@angular/common';
import { Component, OnInit, effect } from '@angular/core';
import { EcoTrackService } from '../data/ecotrack.service';

@Component({
  selector: 'app-gamification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-head">
      <div>
        <span class="eyebrow">Gamification &amp; Rewards</span>
        <h2>Turn sustainable actions into achievements.</h2>
        <p>
          Earn reward points, unlock sustainability badges,
          progress through achievement levels, and compare
          your eco score with the community.
        </p>
      </div>
    </section>

    <!-- LOADING -->

    <section class="panel" *ngIf="loading">
      <p>Loading gamification data...</p>
    </section>

    <!-- ERROR -->

    <section class="panel" *ngIf="errorMessage && !loading">
      <p>{{ errorMessage }}</p>
      <button class="button" type="button" (click)="loadGamification()">
        Try Again
      </button>
    </section>


    <!-- ECO SCORE + REWARD POINTS -->

    <section class="stats-grid" *ngIf="!loading">

      <article class="stat-card">
        <span>Eco Score</span>
        <strong>{{ ecoScore }}</strong>
        <small>Current sustainability score</small>
      </article>

      <article class="stat-card">
        <span>Reward Points</span>
        <strong>{{ rewardPoints }}</strong>
        <small>Points earned</small>
      </article>

      <article class="stat-card">
        <span>Achievement Level</span>
        <strong>{{ achievementLevel }}</strong>
        <small>Current level</small>
      </article>

      <article class="stat-card">
        <span>Badges</span>
        <strong>{{ unlockedBadges.length }}</strong>
        <small>Badges unlocked</small>
      </article>

    </section>


    <!-- ACHIEVEMENT LEVEL -->

    <section class="panel" *ngIf="!loading">

      <span class="eyebrow">Achievement Levels</span>

      <h3>{{ achievementLevel }}</h3>

      <p>
        {{ rewardPoints }} reward points
      </p>

      <div
        style="
          background:#e5e7eb;
          border-radius:20px;
          height:12px;
          overflow:hidden;
          margin-top:15px;
        "
      >
        <div
          [style.width.%]="levelProgress"
          style="
            height:100%;
            border-radius:20px;
            background:#22c55e;
          "
        ></div>
      </div>

      <small>
        {{ pointsToNextLevel }} points to next level
      </small>

    </section>


    <!-- BADGES -->

    <section class="panel" *ngIf="!loading">

      <span class="eyebrow">Sustainability Badges</span>

      <h3>Your achievements</h3>

      <div
        class="content-grid"
        style="margin-top:20px;"
      >

        <article
          class="stat-card"
          *ngFor="let badge of badges"
          [style.opacity]="
            unlockedBadges.includes(badge.name)
              ? '1'
              : '0.45'
          "
        >

          <strong>
            {{ badge.icon }}
          </strong>

          <h4>
            {{ badge.name }}
          </h4>

          <small>
            {{ badge.description }}
          </small>

          <p
            *ngIf="unlockedBadges.includes(badge.name)"
          >
            ✓ Unlocked
          </p>

          <p
            *ngIf="!unlockedBadges.includes(badge.name)"
          >
            Locked
          </p>

        </article>

      </div>

    </section>


    <!-- LEADERBOARD -->

    <section class="panel" *ngIf="!loading">

      <span class="eyebrow">Leaderboard</span>

      <h3>Community rankings</h3>

      <p *ngIf="leaderboardLoading" style="margin-top:12px;">
        Loading leaderboard...
      </p>

      <div
        class="admin-row"
        *ngFor="
          let player of leaderboard;
          let i = index
        "
      >

        <div>

          <strong>
            #{{ i + 1 }} {{ player.name }}
          </strong>

          <span>
            Eco Score: {{ player.ecoScore }}
          </span>

        </div>

        <b>
          {{ player.rewardPoints }} pts
        </b>

      </div>

      <p
        *ngIf="!leaderboardLoading && leaderboard.length === 0"
        style="margin-top:12px;"
      >
        No leaderboard data available.
      </p>

    </section>
  `
})
export class GamificationComponent implements OnInit {

  constructor(
    readonly data: EcoTrackService
  ) {
    effect(() => {
      const user = this.data.currentUser();
      const email = user?.email ?? '';

      if (!email) {
        this.activeUserEmail = '';
        this.resetUserState();
        return;
      }

      if (this.activeUserEmail && this.activeUserEmail !== email) {
        this.resetUserState();
        this.loadGamification();
        this.loadLeaderboard();
      }

      this.activeUserEmail = email;
    });
  }


  // ==========================================
  // STATE — DATA FROM BACKEND
  // ==========================================

  rewardPoints = 0;
  ecoScore = 0;
  achievementLevel = '';
  pointsToNextLevel = 0;
  backendBadges: string[] = [];

  loading = false;
  errorMessage = '';

  leaderboard: any[] = [];
  leaderboardLoading = false;

  private activeUserEmail = '';


  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    this.activeUserEmail = this.data.getCurrentUserEmail() ?? '';
    this.loadGamification();
    this.loadLeaderboard();
  }


  // ==========================================
  // LOAD GAMIFICATION FROM BACKEND
  // ==========================================

  loadGamification(): void {

    this.loading = true;
    this.errorMessage = '';
    const emailAtRequest = this.data.getCurrentUserEmail();

    this.data
      .getGamificationFromBackend()
      .subscribe({

        next: (dto) => {

          if (emailAtRequest !== this.data.getCurrentUserEmail()) {
            return;
          }

          this.rewardPoints =
            dto.rewardPoints ?? 0;

          this.ecoScore =
            dto.ecoScore ?? 0;

          this.achievementLevel =
            dto.achievementLevel ?? 'Green Beginner';

          this.pointsToNextLevel =
            dto.pointsToNextLevel ?? 0;

          this.backendBadges =
            dto.badges ?? [];

          this.loading = false;

          console.log(
            'Gamification loaded from backend:',
            dto
          );

        },

        error: (error) => {

          console.error(
            'Gamification load failed:',
            error
          );

          this.errorMessage =
            'Unable to load gamification data. Make sure the backend is running and you are logged in.';

          this.loading = false;

        }

      });

  }


  // ==========================================
  // LOAD LEADERBOARD FROM BACKEND
  // ==========================================

  loadLeaderboard(): void {

    this.leaderboardLoading = true;
    const emailAtRequest = this.data.getCurrentUserEmail();

    this.data
      .getLeaderboardFromBackend()
      .subscribe({

        next: (data) => {

          if (emailAtRequest !== this.data.getCurrentUserEmail()) {
            return;
          }

          this.leaderboard = data ?? [];
          this.leaderboardLoading = false;

          console.log(
            'Leaderboard loaded:',
            this.leaderboard
          );

        },

        error: (error) => {

          console.error(
            'Leaderboard load failed:',
            error
          );

          this.leaderboardLoading = false;

        }

      });

  }

  private resetUserState(): void {
    this.rewardPoints = 0;
    this.ecoScore = 0;
    this.achievementLevel = '';
    this.pointsToNextLevel = 0;
    this.backendBadges = [];
    this.leaderboard = [];
    this.loading = false;
    this.leaderboardLoading = false;
    this.errorMessage = '';
  }


  // ==========================================
  // LEVEL PROGRESS (computed from backend points)
  // ==========================================

  get levelProgress(): number {

    const points = this.rewardPoints;

    return Math.min(
      (points % 250) / 250 * 100,
      100
    );

  }


  // ==========================================
  // BADGE DEFINITIONS
  // ==========================================

  badges = [

    {
      name: 'Green Beginner',
      icon: '🌱',
      description:
        'Start your sustainability journey.'
    },

    {
      name: 'Eco Warrior',
      icon: '🌿',
      description:
        'Build consistent sustainable activity.'
    },

    {
      name: 'Sustainability Champion',
      icon: '🏆',
      description:
        'Reach a strong sustainability milestone.'
    },

    {
      name: 'Climate Hero',
      icon: '🌍',
      description:
        'Achieve a high sustainability score.'
    },

    {
      name: 'Planet Protector',
      icon: '🌎',
      description:
        'Reach the highest achievement level.'
    }

  ];


  // ==========================================
  // UNLOCKED BADGES — from backend response
  // ==========================================

  get unlockedBadges(): string[] {

    return this.backendBadges;

  }

}
