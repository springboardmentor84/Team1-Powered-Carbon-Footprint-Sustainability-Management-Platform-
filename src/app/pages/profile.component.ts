import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EcoTrackService } from '../data/ecotrack.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-head">
      <div>
        <span class="eyebrow">Profile management</span>
        <h2>Personalize sustainability recommendations.</h2>
        <p>Collect location, lifestyle, and environmental interests so the recommendation engine can make useful suggestions.</p>
      </div>
    </section>

    <form class="panel form-panel profile-form" [formGroup]="profileForm" (ngSubmit)="submit()">
      <div class="two-column">
        <label>
          Full name
          <input formControlName="name">
        </label>
        <label>
          Email
          <input type="email" formControlName="email">
        </label>
      </div>

      <div class="two-column">
        <label>
          Location
          <input formControlName="location">
        </label>
        <label>
          Lifestyle
          <input formControlName="lifestyle">
        </label>
      </div>

      <div>
        <span class="field-title">Environmental interests</span>
        <div class="interest-grid">
          <label class="check-tile" *ngFor="let interest of data.interestOptions">
            <input type="checkbox" [checked]="selected(interest)" (change)="toggleInterest(interest)">
            <span>{{ interest }}</span>
          </label>
        </div>
      </div>

      <button class="button primary" type="submit" [disabled]="profileForm.invalid">Save profile</button>
    </form>
  `
})
export class ProfileComponent {
  interests = [...this.data.profile().interests];

  readonly profileForm = this.fb.nonNullable.group({
    name: [this.data.profile().name, Validators.required],
    email: [this.data.profile().email, [Validators.required, Validators.email]],
    location: [this.data.profile().location, Validators.required],
    lifestyle: [this.data.profile().lifestyle, Validators.required]
  });

  constructor(readonly data: EcoTrackService, private fb: FormBuilder) {}

  selected(interest: string): boolean {
    return this.interests.includes(interest);
  }

  toggleInterest(interest: string): void {
    this.interests = this.selected(interest)
      ? this.interests.filter((item) => item !== interest)
      : [...this.interests, interest];
  }

  submit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.data.updateProfile({ ...this.profileForm.getRawValue(), interests: this.interests });
  }
}
