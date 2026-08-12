import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EcoTrackService } from './data/ecotrack.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <router-outlet *ngIf="!data.isAuthenticated()"></router-outlet>

    <div class="shell" *ngIf="data.isAuthenticated()">
      <aside class="sidebar">
        <a class="brand" routerLink="/dashboard">
          <span class="brand-mark"><img src="assets/leaf.svg" alt=""></span>
          <span>
            <strong>EcoTrack</strong>
            <small>Carbon intelligence</small>
          </span>
        </a>

        <nav class="nav">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/tracker" routerLinkActive="active">Carbon Tracker</a>
          <a routerLink="/goals" routerLinkActive="active">Goals</a>
          <a routerLink="/challenges" routerLinkActive="active">Challenges</a>
          <a routerLink="/reports" routerLinkActive="active">Reports</a>
          <a routerLink="/profile" routerLinkActive="active">Profile</a>
          <a routerLink="/admin" routerLinkActive="active">Admin</a>
        </nav>

        <div class="sidebar-card">
          <span class="eyebrow">Eco score</span>
          <strong>{{ data.sustainabilityScore() }}</strong>
          <p>{{ data.totalEmissions() | number:'1.1-1' }} kg CO2e tracked this month</p>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div>
            <span class="eyebrow">AI-powered sustainability platform</span>
            <h1>Make every activity measurable.</h1>
          </div>
          <div class="user-chip">
            <span>{{ initials }}</span>
            <div>
              <strong>{{ data.profile().name }}</strong>
              <small>{{ data.profile().location }}</small>
            </div>
          </div>
          <button class="button secondary" type="button" (click)="logout()">Logout</button>
        </header>

        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {
  constructor(readonly data: EcoTrackService, private router: Router) {}

  get initials(): string {
    return this.data.profile().name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  }

  logout(): void {
    this.data.logout();
    this.router.navigateByUrl('/login');
  }
}
