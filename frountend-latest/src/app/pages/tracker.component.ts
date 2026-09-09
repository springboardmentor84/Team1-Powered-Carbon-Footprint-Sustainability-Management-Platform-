import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { EcoTrackService } from '../data/ecotrack.service';
import { CarbonCategory } from '../app.models';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <section class="page-head">
      <div>
        <span class="eyebrow">Carbon footprint tracking</span>

        <h2>
          Capture activity data with clean, reliable inputs.
        </h2>

        <p>
          Record transport, energy, food, waste, water,
          shopping, and travel activity.
          Emissions are calculated by the EcoTrack backend.
        </p>
      </div>
    </section>

    <section class="form-layout">

      <!-- ========================= -->
      <!-- NEW CARBON ENTRY FORM -->
      <!-- ========================= -->

      <form
        class="panel form-panel"
        [formGroup]="entryForm"
        (ngSubmit)="submit()"
      >

        <div class="panel-header">
          <div>
            <span class="eyebrow">New activity</span>
            <h3>Emission entry</h3>
          </div>
        </div>

        <label>
          Activity title

          <input
            formControlName="title"
            placeholder="Example: Metro commute, home electricity, lunch meal"
          >
        </label>

        <div class="two-column">

          <label>
            Category

            <select formControlName="category">
              <option
                *ngFor="let category of data.categories"
                [value]="category"
              >
                {{ category }}
              </option>
            </select>
          </label>

          <label>
            Date

            <input
              type="date"
              formControlName="date"
            >
          </label>

        </div>

        <div class="two-column">

          <label>
            Amount

            <input
              type="number"
              min="0"
              step="0.1"
              formControlName="amount"
            >
          </label>

          <label>
            Unit

            <input
              formControlName="unit"
              placeholder="km, kWh, litres, kg, meals"
            >
          </label>

        </div>

        <label>
          Notes

          <textarea
            formControlName="notes"
            rows="4"
            placeholder="Add context that helps recommendations become more personal."
          ></textarea>
        </label>

        <div class="estimate-box">

          <span>
            Estimated emission
          </span>

          <strong>
            {{ estimate | number:'1.1-2' }} kg CO2e
          </strong>

        </div>

        <!-- SAVE ACTIVITY -->

        <button
          class="button primary"
          type="submit"
          [disabled]="entryForm.invalid || saving"
        >
          {{ saving ? 'Saving...' : 'Save activity' }}
        </button>

        <!-- ========================= -->
        <!-- AI RECOMMENDATIONS BUTTON -->
        <!-- ========================= -->

        <button
          class="button"
          type="button"
          (click)="getAIRecommendations()"
          [disabled]="loadingAI"
        >
          {{ loadingAI ? 'Generating...' : 'Get AI Recommendations' }}
        </button>

        <!-- ========================= -->
        <!-- AI RECOMMENDATIONS RESULT -->
        <!-- ========================= -->

        <div
          class="panel"
          *ngIf="aiRecommendation"
        >

          <div class="panel-header">

            <div>
              <span class="eyebrow">
                AI Sustainability Assistant
              </span>

              <h3>
                Your recommendations
              </h3>
            </div>

          </div>

          <p style="white-space: pre-line;">
            {{ aiRecommendation }}
          </p>

        </div>

      </form>


      <!-- ========================= -->
      <!-- CARBON HISTORY -->
      <!-- ========================= -->

      <article class="panel">

        <div class="panel-header">

          <div>
            <span class="eyebrow">History</span>
            <h3>Latest records</h3>
          </div>

          <button
            class="button"
            type="button"
            (click)="loadEntries()"
          >
            Refresh
          </button>

        </div>

        <div
          class="record-card"
          *ngFor="let entry of backendEntries"
        >

          <div>

            <strong>
              {{ entry.activityType }}
            </strong>

            <span>
              {{ entry.category }}
              -
              {{ entry.quantity }}
              {{ entry.unit }}
              -
              {{ entry.entryDate }}
            </span>

            <p>
              Carbon emission calculated by backend
            </p>

          </div>

          <b>
            {{ entry.carbonEmissionKg }} kg
          </b>

        </div>

        <div
          *ngIf="backendEntries.length === 0"
        >
          <p>
            No carbon entries found.
          </p>
        </div>

      </article>

    </section>
  `
})
export class TrackerComponent {

  // ==========================================
  // FRONTEND EMISSION FACTORS
  // ==========================================

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


  // ==========================================
  // CARBON ENTRY FORM
  // ==========================================

  readonly entryForm =
    this.fb.nonNullable.group({

      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      category: [
        'Transportation' as CarbonCategory,
        Validators.required
      ],

      amount: [
        10,
        [
          Validators.required,
          Validators.min(0.1)
        ]
      ],

      unit: [
        'km',
        Validators.required
      ],

      date: [
        new Date()
          .toISOString()
          .slice(0, 10),

        Validators.required
      ],

      notes: ['']

    });


  // ==========================================
  // CARBON DATA
  // ==========================================

  backendEntries: any[] = [];

  saving = false;


  // ==========================================
  // AI DATA
  // ==========================================

  aiRecommendation = '';

  loadingAI = false;


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    readonly data: EcoTrackService,
    private fb: FormBuilder
  ) {

    this.loadEntries();

  }


  // ==========================================
  // FRONTEND ESTIMATE
  // ==========================================

  get estimate(): number {

    const value =
      this.entryForm.getRawValue();

    return Number(
      (
        value.amount *
        this.factors[value.category]
      ).toFixed(2)
    );

  }


  // ==========================================
  // LOAD CARBON ENTRIES FROM SPRING BOOT
  // ==========================================

  loadEntries(): void {

    this.data
      .getCarbonEntriesFromBackend()
      .subscribe({

        next: (entries) => {

          this.backendEntries = entries;

          console.log(
            'Carbon entries from backend:',
            entries
          );

        },

        error: (error) => {

          console.error(
            'Failed to load carbon entries:',
            error
          );

          alert(
            'Unable to load carbon entries. Please make sure you are logged in and the backend is running.'
          );

        }

      });

  }


  // ==========================================
  // GET AI RECOMMENDATIONS
  // ==========================================

  getAIRecommendations(): void {

    this.loadingAI = true;

    this.aiRecommendation = '';

    this.data
      .getAIRecommendations()
      .subscribe({

        next: (recommendation) => {

          this.aiRecommendation =
            recommendation;

          this.loadingAI = false;

          console.log(
            'AI Recommendation:',
            recommendation
          );

        },

        error: (error) => {

          console.error(
            'AI recommendation failed:',
            error
          );

          this.loadingAI = false;

          this.aiRecommendation =
            'Unable to generate AI recommendations. Please make sure the backend is running and you are logged in.';

        }

      });

  }


  // ==========================================
  // SAVE CARBON ENTRY TO SPRING BOOT
  // ==========================================

  submit(): void {

    if (this.entryForm.invalid) {
      return;
    }


    const value =
      this.entryForm.getRawValue();


    const backendEntry = {

      category: value.category,

      activityType: value.title,

      quantity: value.amount,

      unit: value.unit,

      entryDate: value.date

    };


    this.saving = true;


    this.data
      .addCarbonEntryToBackend(backendEntry)
      .subscribe({

        next: (response) => {

          console.log(
            'Carbon entry saved:',
            response
          );


          alert(
            'Carbon activity saved successfully!'
          );


          this.saving = false;


          this.entryForm.patchValue({

            title: '',

            amount: 1,

            notes: ''

          });


          // Reload real database data

          this.loadEntries();

        },


        error: (error) => {

          console.error(
            'Carbon entry save failed:',
            error
          );


          this.saving = false;


          alert(
            'Failed to save carbon activity. Please check that the backend is running and you are logged in.'
          );

        }

      });

  }

}