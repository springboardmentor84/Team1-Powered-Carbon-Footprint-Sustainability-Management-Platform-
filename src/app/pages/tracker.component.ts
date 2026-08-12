import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EcoTrackService } from '../data/ecotrack.service';
import { CarbonCategory } from '../app.models';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-head">
      <div>
        <span class="eyebrow">Carbon footprint tracking</span>
        <h2>Capture activity data with clean, reliable inputs.</h2>
        <p>Record transport, energy, food, waste, water, shopping, and travel activity. Emissions are estimated instantly and stored locally for dashboard analytics.</p>
      </div>
    </section>

    <section class="form-layout">
      <form class="panel form-panel" [formGroup]="entryForm" (ngSubmit)="submit()">
        <div class="panel-header">
          <div>
            <span class="eyebrow">New activity</span>
            <h3>Emission entry</h3>
          </div>
        </div>

        <label>
          Activity title
          <input formControlName="title" placeholder="Example: Metro commute, home electricity, lunch meal">
        </label>

        <div class="two-column">
          <label>
            Category
            <select formControlName="category">
              <option *ngFor="let category of data.categories" [value]="category">{{ category }}</option>
            </select>
          </label>

          <label>
            Date
            <input type="date" formControlName="date">
          </label>
        </div>

        <div class="two-column">
          <label>
            Amount
            <input type="number" min="0" step="0.1" formControlName="amount">
          </label>

          <label>
            Unit
            <input formControlName="unit" placeholder="km, kWh, litres, kg, meals">
          </label>
        </div>

        <label>
          Notes
          <textarea formControlName="notes" rows="4" placeholder="Add context that helps recommendations become more personal."></textarea>
        </label>

        <div class="estimate-box">
          <span>Estimated emission</span>
          <strong>{{ estimate | number:'1.1-2' }} kg CO2e</strong>
        </div>

        <button class="button primary" type="submit" [disabled]="entryForm.invalid">Save activity</button>
      </form>

      <article class="panel">
        <div class="panel-header">
          <div>
            <span class="eyebrow">History</span>
            <h3>Latest records</h3>
          </div>
        </div>

        <div class="record-card" *ngFor="let entry of data.entries()">
          <div>
            <strong>{{ entry.title }}</strong>
            <span>{{ entry.category }} - {{ entry.amount }} {{ entry.unit }} - {{ entry.date }}</span>
            <p>{{ entry.notes }}</p>
          </div>
          <b>{{ entry.emissionsKg }} kg</b>
        </div>
      </article>
    </section>
  `
})
export class TrackerComponent {
  private factors: Record<CarbonCategory, number> = {
    Transportation: 0.21,
    Electricity: 0.82,
    Fuel: 2.31,
    Food: 1.8,
    Waste: 0.57,
    Water: 0.001,
    Shopping: 0.42,
    Travel: 0.19
  };

  readonly entryForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    category: ['Transportation' as CarbonCategory, Validators.required],
    amount: [10, [Validators.required, Validators.min(0.1)]],
    unit: ['km', Validators.required],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    notes: ['']
  });

  constructor(readonly data: EcoTrackService, private fb: FormBuilder) {}

  get estimate(): number {
    const value = this.entryForm.getRawValue();
    return Number((value.amount * this.factors[value.category]).toFixed(2));
  }

  submit(): void {
    if (this.entryForm.invalid) {
      return;
    }

    this.data.addEntry(this.entryForm.getRawValue());
    this.entryForm.patchValue({ title: '', amount: 1, notes: '' });
  }
}
