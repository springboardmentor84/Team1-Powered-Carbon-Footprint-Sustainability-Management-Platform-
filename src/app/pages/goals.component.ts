import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EcoTrackService } from '../data/ecotrack.service';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-head">
      <div>
        <span class="eyebrow">Sustainability goals</span>
        <h2>Turn broad intentions into measurable progress.</h2>
        <p>Create carbon, water, transport, recycling, plastic, and tree planting goals with transparent completion tracking.</p>
      </div>
    </section>

    <section class="form-layout">
      <form class="panel form-panel" [formGroup]="goalForm" (ngSubmit)="submit()">
        <div class="panel-header">
          <div>
            <span class="eyebrow">New goal</span>
            <h3>Goal details</h3>
          </div>
        </div>

        <label>
          Goal title
          <input formControlName="title" placeholder="Example: Reduce monthly electricity use">
        </label>

        <label>
          Goal type
          <select formControlName="type">
            <option *ngFor="let type of data.goalTypes" [value]="type">{{ type }}</option>
          </select>
        </label>

        <div class="two-column">
          <label>
            Target
            <input type="number" min="1" formControlName="target">
          </label>

          <label>
            Unit
            <input formControlName="unit" placeholder="kg CO2e, kWh, litres, rides">
          </label>
        </div>

        <label>
          Deadline
          <input type="date" formControlName="deadline">
        </label>

        <button class="button primary" type="submit" [disabled]="goalForm.invalid">Create goal</button>
      </form>

      <article class="panel">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Active plan</span>
            <h3>Progress tracker</h3>
          </div>
        </div>

        <div class="goal-card" *ngFor="let goal of data.goals()">
          <div class="goal-card-top">
            <div>
              <strong>{{ goal.title }}</strong>
              <span>{{ goal.type }} - Due {{ goal.deadline }}</span>
            </div>
            <b>{{ percentage(goal.progress, goal.target) }}%</b>
          </div>
          <progress [value]="goal.progress" [max]="goal.target"></progress>
          <label class="range-label">
            Update progress
            <input type="range" min="0" [max]="goal.target" [value]="goal.progress" (input)="setProgress(goal.id, $event)">
          </label>
          <small>{{ goal.progress }} / {{ goal.target }} {{ goal.unit }}</small>
        </div>
      </article>
    </section>
  `
})
export class GoalsComponent {
  readonly goalForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(4)]],
    type: ['Reduce Carbon Emissions', Validators.required],
    target: [100, [Validators.required, Validators.min(1)]],
    unit: ['kg CO2e', Validators.required],
    deadline: [new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10), Validators.required]
  });

  constructor(readonly data: EcoTrackService, private fb: FormBuilder) {}

  submit(): void {
    if (this.goalForm.invalid) {
      return;
    }

    this.data.addGoal(this.goalForm.getRawValue());
    this.goalForm.patchValue({ title: '', target: 100 });
  }

  setProgress(goalId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.data.updateGoalProgress(goalId, Number(input.value));
  }

  percentage(progress: number, target: number): number {
    return Math.round((progress / target) * 100);
  }
}
