import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EcoTrackService } from '../data/ecotrack.service';

@Component({
  selector: 'app-challenges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-head">
      <div>
        <span class="eyebrow">Community challenges</span>
        <h2>Discover eco actions people can actually finish.</h2>
        <p>Search by category, location, and interest. Join challenges to earn rewards and improve your sustainability score.</p>
      </div>
    </section>

    <section class="panel filter-panel">
      <label>
        Search
        <input [(ngModel)]="searchText" placeholder="Search challenge, category, or location">
      </label>
      <label>
        Category
        <select [(ngModel)]="selectedCategory">
          <option value="">All categories</option>
          <option *ngFor="let interest of data.interestOptions" [value]="interest">{{ interest }}</option>
        </select>
      </label>
    </section>

    <section class="challenge-grid">
      <article class="challenge-card" *ngFor="let challenge of filteredChallenges()">
        <div class="challenge-top">
          <span>{{ challenge.category }}</span>
          <b>{{ challenge.reward }} pts</b>
        </div>
        <h3>{{ challenge.title }}</h3>
        <p>{{ challenge.location }} - {{ challenge.participants | number }} participants</p>
        <progress [value]="challenge.progress" max="100"></progress>
        <div class="challenge-footer">
          <small>{{ challenge.progress }}% community progress</small>
          <button class="button compact" [class.secondary]="challenge.joined" (click)="data.toggleChallenge(challenge.id)">
            {{ challenge.joined ? 'Joined' : 'Join' }}
          </button>
        </div>
      </article>
    </section>
  `
})
export class ChallengesComponent {
  readonly search = signal('');
  readonly category = signal('');

  constructor(readonly data: EcoTrackService) {}

  get searchText(): string {
    return this.search();
  }

  set searchText(value: string) {
    this.search.set(value);
  }

  get selectedCategory(): string {
    return this.category();
  }

  set selectedCategory(value: string) {
    this.category.set(value);
  }

  readonly filteredChallenges = computed(() => {
    const query = this.search().trim().toLowerCase();
    const category = this.category();
    return this.data.challenges().filter((challenge) => {
      const matchesQuery = !query || [challenge.title, challenge.category, challenge.location].some((value) => value.toLowerCase().includes(query));
      const matchesCategory = !category || challenge.category === category;
      return matchesQuery && matchesCategory;
    });
  });
}
