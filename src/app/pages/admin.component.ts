import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EcoTrackService } from '../data/ecotrack.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-head">
      <div>
        <span class="eyebrow">Administrator dashboard</span>
        <h2>Monitor adoption, reports, and community activity.</h2>
        <p>Admin surfaces are ready for user management, challenge moderation, reports, and platform health data from the backend.</p>
      </div>
    </section>

    <section class="stats-grid">
      <article class="stat-card">
        <span>Total users</span>
        <strong>12,480</strong>
        <small>+8.2% this month</small>
      </article>
      <article class="stat-card">
        <span>Challenges</span>
        <strong>{{ data.challenges().length }}</strong>
        <small>{{ activeChallenges }} currently joined locally</small>
      </article>
      <article class="stat-card">
        <span>Reports generated</span>
        <strong>3,248</strong>
        <small>PDF and Excel export queue</small>
      </article>
      <article class="stat-card">
        <span>System health</span>
        <strong>99.9%</strong>
        <small>API and notification uptime</small>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel">
        <span class="eyebrow">Moderation queue</span>
        <h3>Challenge review</h3>
        <div class="admin-row" *ngFor="let challenge of data.challenges()">
          <div>
            <strong>{{ challenge.title }}</strong>
            <span>{{ challenge.category }} - {{ challenge.location }}</span>
          </div>
          <b>{{ challenge.participants | number }}</b>
        </div>
      </article>

      <article class="panel">
        <span class="eyebrow">Notifications</span>
        <h3>Scheduled messages</h3>
        <div class="notification-row">Goal reminders - Daily at 8:00 AM</div>
        <div class="notification-row">Weekly sustainability report - Monday</div>
        <div class="notification-row">Challenge updates - On progress change</div>
        <div class="notification-row">Recommendation alerts - High-impact changes</div>
      </article>
    </section>
  `
})
export class AdminComponent {
  constructor(readonly data: EcoTrackService) {}

  get activeChallenges(): number {
    return this.data.challenges().filter((challenge) => challenge.joined).length;
  }
}
