import { CommonModule } from '@angular/common';
import { Component, OnInit, effect } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { EcoTrackService } from './data/ecotrack.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],

  template: `
    <router-outlet
      *ngIf="!data.isAuthenticated()"
    ></router-outlet>


    <div
      class="shell"
      *ngIf="data.isAuthenticated()"
    >

      <aside class="sidebar">

        <a
          class="brand"
          routerLink="/dashboard"
        >

          <span class="brand-mark">

            <img
              src="assets/leaf.svg"
              alt=""
            >

          </span>

          <span>

            <strong>
              EcoTrack
            </strong>

            <small>
              Carbon intelligence
            </small>

          </span>

        </a>


        <nav class="nav">

          <a
            routerLink="/dashboard"
            routerLinkActive="active"
          >
            Dashboard
          </a>


          <a
            routerLink="/tracker"
            routerLinkActive="active"
          >
            Carbon Tracker
          </a>


          <a
            routerLink="/goals"
            routerLinkActive="active"
          >
            Goals
          </a>


          <a
            routerLink="/challenges"
            routerLinkActive="active"
          >
            Challenges
          </a>

          <a routerLink="/gamification" routerLinkActive="active">
  Gamification
</a>

          <a
            routerLink="/notifications"
            routerLinkActive="active"
          >
            Notifications
            <span
              *ngIf="unreadNotifications > 0"
              style="
                display:inline-block;
                background:#22c55e;
                color:#fff;
                border-radius:999px;
                font-size:11px;
                min-width:18px;
                height:18px;
                line-height:18px;
                text-align:center;
                padding:0 5px;
                margin-left:6px;
              "
            >{{ unreadNotifications }}</span>
          </a>


          <a
            routerLink="/analytics"
            routerLinkActive="active"
          >
            Analytics
          </a>

          <a
            routerLink="/reports"
            routerLinkActive="active"
          >
            Reports
          </a>


          <a
            routerLink="/profile"
            routerLinkActive="active"
          >
            Profile
          </a>


          <!-- ADMIN ONLY -->

          <a
            *ngIf="isAdmin"
            routerLink="/admin"
            routerLinkActive="active"
          >
            Admin
          </a>

        </nav>


        <div class="sidebar-card">

          <span class="eyebrow">
            Eco score
          </span>

          <strong>
            {{ sidebarEcoScore }}
          </strong>

          <p>
            {{
              sidebarTotalEmissions
              | number:'1.1-1'
            }}
            kg CO2e tracked this month
          </p>

        </div>

      </aside>


      <main class="main">

        <header class="topbar">

          <div>

            <span class="eyebrow">
              AI-powered sustainability platform
            </span>

            <h1>
              Make every activity measurable.
            </h1>

          </div>


          <div class="user-chip">

            <span>
              {{ initials }}
            </span>

            <div>

              <strong>
                {{ data.profile().name }}
              </strong>

              <small>
                {{ data.profile().location }}
              </small>

            </div>

          </div>


          <button
            class="button secondary"
            type="button"
            (click)="logout()"
          >
            Logout
          </button>

        </header>


        <router-outlet></router-outlet>

      </main>

    </div>
  `
})
export class AppComponent implements OnInit {

  constructor(
    readonly data: EcoTrackService,
    private router: Router
  ) {
    effect(() => {
      const user = this.data.currentUser();

      if (!user) {
        this.clearSidebarState();
        return;
      }

      this.loadUnreadCount();
      this.loadSidebarData();
    });
  }


  // ==========================================
  // UNREAD NOTIFICATION COUNT
  // ==========================================

  unreadNotifications = 0;


  // ==========================================
  // SIDEBAR DATA
  // ==========================================

  sidebarEcoScore = 0;
  sidebarTotalEmissions = 0;


  ngOnInit(): void {
    // Session-sensitive shell loading is handled by the currentUser effect.
  }


  loadSidebarData(): void {
    const emailAtRequest = this.data.getCurrentUserEmail();

    // Fetch gamification
    this.data.getGamificationFromBackend().subscribe({
      next: (gamification) => {
        if (emailAtRequest !== this.data.getCurrentUserEmail()) {
          return;
        }
        this.sidebarEcoScore = gamification?.ecoScore ?? 0;
      },
      error: () => {}
    });

    // Fetch carbon summary
    this.data.getCarbonSummaryFromBackend().subscribe({
      next: (summary) => {
        if (emailAtRequest !== this.data.getCurrentUserEmail()) {
          return;
        }
        this.sidebarTotalEmissions = Number(
          summary?.totalEmissions ??
          summary?.totalCarbonEmission ??
          summary?.totalCarbonEmissionKg ??
          summary?.total ??
          0
        );
      },
      error: () => {}
    });
  }


  loadUnreadCount(): void {
    const emailAtRequest = this.data.getCurrentUserEmail();

    this.data
      .getUnreadCountFromBackend()
      .subscribe({
        next: (count) => {
          if (emailAtRequest !== this.data.getCurrentUserEmail()) {
            return;
          }
          this.unreadNotifications = Number(count) || 0;
        },
        error: () => {
          // Silently ignore — non-critical
        }
      });
  }


  // ==========================================
  // ADMIN CHECK
  // ==========================================

  get isAdmin(): boolean {
    return this.data.isCurrentUserAdmin();
  }

  private clearSidebarState(): void {
    this.unreadNotifications = 0;
    this.sidebarEcoScore = 0;
    this.sidebarTotalEmissions = 0;
  }


  // ==========================================
  // USER INITIALS
  // ==========================================

  get initials(): string {

    return this.data
      .profile()
      .name
      .split(' ')
      .map(
        (part) => part[0]
      )
      .slice(0, 2)
      .join('')
      .toUpperCase();

  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    this.data.logout();

    this.router.navigateByUrl(
      '/login'
    );

  }

}
