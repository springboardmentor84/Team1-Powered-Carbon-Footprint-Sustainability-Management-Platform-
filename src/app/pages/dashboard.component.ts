import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EcoTrackService } from '../data/ecotrack.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero-band">
      <div class="hero-copy">
        <span class="eyebrow">Personal carbon command center</span>
        <h2>Track emissions, improve habits, and prove your impact.</h2>
        <p>EcoTrack turns daily transport, energy, food, water, waste, and shopping data into clear carbon insights, AI recommendations, goals, and community progress.</p>
        <div class="hero-actions">
          <a class="button primary" routerLink="/tracker">Add activity</a>
          <a class="button secondary" routerLink="/reports">View report</a>
        </div>
      </div>
      <div class="impact-orbit" aria-label="Monthly impact summary">
        <div>
          <strong>{{ data.totalEmissions() | number:'1.1-1' }}</strong>
          <span>kg CO2e</span>
        </div>
        <small>Monthly tracked footprint</small>
      </div>
    </section>

    <section class="stats-grid">
      <article class="stat-card">
        <span>Sustainability score</span>
        <strong>{{ data.sustainabilityScore() }}</strong>
        <small>Dynamic score from emissions and goal progress</small>
      </article>
      <article class="stat-card">
        <span>Reward points</span>
        <strong>{{ data.rewardPoints() }}</strong>
        <small>Gamification progress and challenge rewards</small>
      </article>
      <article class="stat-card">
        <span>Active goals</span>
        <strong>{{ data.goals().length }}</strong>
        <small>Targets across carbon, water, recycling, and transport</small>
      </article>
      <article class="stat-card">
        <span>Joined challenges</span>
        <strong>{{ joinedChallenges }}</strong>
        <small>Community sustainability participation</small>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel wide">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Emission mix</span>
            <h3>Category analytics</h3>
          </div>
          <a routerLink="/tracker">Manage</a>
        </div>
        <div class="bar-list">
          <div class="bar-row" *ngFor="let category of data.categories">
            <span>{{ category }}</span>
            <div class="bar-track"><i [style.width.%]="barWidth(category)"></i></div>
            <strong>{{ data.categoryTotal(category) | number:'1.1-1' }} kg</strong>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <span class="eyebrow">AI assistant</span>
            <h3>Recommendations</h3>
          </div>
        </div>
        <div class="recommendation" *ngFor="let item of data.recommendations()">
          <strong>{{ item.title }}</strong>
          <span>{{ item.impact }} - {{ item.effort }} effort</span>
          <p>{{ item.reason }}</p>
        </div>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Goal progress</span>
            <h3>Priority goals</h3>
          </div>
          <a routerLink="/goals">Open</a>
        </div>
        <div class="goal-line" *ngFor="let goal of data.goals()">
          <div>
            <strong>{{ goal.title }}</strong>
            <span>{{ goal.progress }} / {{ goal.target }} {{ goal.unit }}</span>
          </div>
          <progress [value]="goal.progress" [max]="goal.target"></progress>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Recent entries</span>
            <h3>Activity timeline</h3>
          </div>
          <a routerLink="/tracker">Add</a>
        </div>
        <div class="timeline-item" *ngFor="let entry of data.entries().slice(0, 5)">
          <span>{{ entry.date }}</span>
          <strong>{{ entry.title }}</strong>
          <small>{{ entry.category }} - {{ entry.emissionsKg }} kg CO2e</small>
        </div>
      </article>
    </section>
  `
})
export class DashboardComponent {
  constructor(readonly data: EcoTrackService) {}

  get joinedChallenges(): number {
    return this.data.challenges().filter((challenge) => challenge.joined).length;
  }

  barWidth(category: string): number {
    const max = Math.max(...this.data.categories.map((item) => this.data.categoryTotal(item)), 1);
    return (this.data.categoryTotal(category as never) / max) * 100;
  }
}
