import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EcoTrackService } from '../data/ecotrack.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  template: `

    <!-- ===================================================== -->
    <!-- HERO -->
    <!-- ===================================================== -->

    <section class="hero-band">

      <div class="hero-copy">

        <span class="eyebrow">
          Personal carbon command center
        </span>

        <h2>
          Track emissions, improve habits, and prove your impact.
        </h2>

        <p>
          EcoTrack turns your real carbon activity and sustainability
          goals into clear environmental insights.
        </p>

        <div class="hero-actions">

          <a
            class="button primary"
            routerLink="/tracker"
          >
            Add activity
          </a>

          <a
            class="button secondary"
            routerLink="/reports"
          >
            View report
          </a>

        </div>

      </div>


      <!-- REAL BACKEND TOTAL -->

      <div
        class="impact-orbit"
        aria-label="Carbon impact summary"
      >

        <div>

          <strong>
            {{ carbonTotal | number:'1.1-1' }}
          </strong>

          <span>
            kg CO2e
          </span>

        </div>

        <small>
          Total tracked footprint
        </small>

      </div>

    </section>


    <!-- ===================================================== -->
    <!-- STATS -->
    <!-- ===================================================== -->

    <section class="stats-grid">


      <!-- SUSTAINABILITY SCORE -->

      <article class="stat-card">

        <span>
          Sustainability score
        </span>

        <strong>
          {{ sustainabilityScore }}
        </strong>

        <small>
          Calculated from your real carbon footprint
        </small>

      </article>


      <!-- ACTIVE GOALS -->

      <article class="stat-card">

        <span>
          Active goals
        </span>

        <strong>
          {{ activeGoalsCount }}
        </strong>

        <small>
          Goals stored in the backend
        </small>

      </article>


      <!-- TOTAL ACTIVITIES -->

      <article class="stat-card">

        <span>
          Carbon activities
        </span>

        <strong>
          {{ backendEntries.length }}
        </strong>

        <small>
          Activities stored in the backend
        </small>

      </article>


      <!-- COMPLETED GOALS -->

      <article class="stat-card">

        <span>
          Completed goals
        </span>

        <strong>
          {{ completedGoalsCount }}
        </strong>

        <small>
          Goals completed from your backend data
        </small>

      </article>

    </section>


    <!-- ===================================================== -->
    <!-- CATEGORY ANALYTICS + GOALS -->
    <!-- ===================================================== -->

    <section class="content-grid">


      <!-- CATEGORY ANALYTICS -->

      <article class="panel wide">

        <div class="panel-header">

          <div>

            <span class="eyebrow">
              Emission mix
            </span>

            <h3>
              Category analytics
            </h3>

          </div>

          <a routerLink="/tracker">
            Manage
          </a>

        </div>


        <div class="bar-list">


          <div
            class="bar-row"
            *ngFor="let category of data.categories"
          >

            <span>
              {{ category }}
            </span>


            <div class="bar-track">

              <i
                [style.width.%]="barWidth(category)"
              ></i>

            </div>


            <strong>

              {{
                categoryTotal(category)
                  | number:'1.1-1'
              }}

              kg

            </strong>

          </div>


        </div>

      </article>


      <!-- GOAL SUMMARY -->

      <article class="panel">

        <div class="panel-header">

          <div>

            <span class="eyebrow">
              Sustainability goals
            </span>

            <h3>
              Goal progress
            </h3>

          </div>

          <a routerLink="/goals">
            Open
          </a>

        </div>


        <div
          class="goal-line"
          *ngFor="let goal of backendGoals.slice(0, 4)"
        >

          <div>

            <strong>
              {{ goal.goalName }}
            </strong>

            <span>

              {{ goal.currentValue }}
              /
              {{ goal.targetValue }}

            </span>

          </div>


          <progress
            [value]="goal.currentValue"
            [max]="goal.targetValue"
          ></progress>

        </div>


        <div
          *ngIf="backendGoals.length === 0"
        >

          <p>
            No goals found in the backend.
          </p>

        </div>

      </article>

    </section>


    <!-- ===================================================== -->
    <!-- RECENT BACKEND ENTRIES -->
    <!-- ===================================================== -->

    <section class="content-grid">


      <article class="panel wide">

        <div class="panel-header">

          <div>

            <span class="eyebrow">
              Recent entries
            </span>

            <h3>
              Activity timeline
            </h3>

          </div>

          <a routerLink="/tracker">
            Add
          </a>

        </div>


        <div
          class="timeline-item"
          *ngFor="
            let entry of backendEntries.slice(0, 5)
          "
        >

          <span>
            {{ entry.entryDate }}
          </span>

          <strong>
            {{ entry.activityType }}
          </strong>

          <small>

            {{ entry.category }}

            -

            {{ entry.quantity }}
            {{ entry.unit }}

            -

            {{ entry.carbonEmissionKg }}

            kg CO2e

          </small>

        </div>


        <div
          *ngIf="backendEntries.length === 0"
        >

          <p>
            No carbon activities found in the backend.
          </p>

        </div>

      </article>


      <!-- BACKEND SUMMARY -->

      <article class="panel">

        <div class="panel-header">

          <div>

            <span class="eyebrow">
              Backend summary
            </span>

            <h3>
              Your footprint
            </h3>

          </div>

        </div>


        <div class="recommendation">

          <strong>
            Total emissions
          </strong>

          <span>
            {{ carbonTotal | number:'1.1-1' }} kg CO2e
          </span>

          <p>
            This value comes directly from the EcoTrack
            carbon summary API.
          </p>

        </div>


        <div class="recommendation">

          <strong>
            Active goals
          </strong>

          <span>
            {{ activeGoalsCount }}
          </span>

          <p>
            Goals are loaded directly from the Spring Boot backend.
          </p>

        </div>


        <div class="recommendation">

          <strong>
            Activities recorded
          </strong>

          <span>
            {{ backendEntries.length }}
          </span>

          <p>
            Carbon activities currently stored for your account.
          </p>

        </div>

      </article>

    </section>

  `
})
export class DashboardComponent implements OnInit {


  // =====================================================
  // BACKEND CARBON DATA
  // =====================================================

  backendEntries: any[] = [];

  carbonTotal = 0;


  // =====================================================
  // BACKEND GOALS
  // =====================================================

  backendGoals: any[] = [];


  // =====================================================
  // LOADING
  // =====================================================

  loading = false;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    readonly data: EcoTrackService
  ) {}


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  ngOnInit(): void {

    this.loadCarbonData();

    this.loadGoals();

  }


  // =====================================================
  // LOAD CARBON DATA
  // =====================================================

  loadCarbonData(): void {

    this.loading = true;


    // GET /carbon

    this.data
      .getCarbonEntriesFromBackend()
      .subscribe({

        next: (entries) => {

          console.log(
            'Dashboard carbon entries:',
            entries
          );

          this.backendEntries =
            entries || [];

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Dashboard carbon loading failed:',
            error
          );

          this.backendEntries = [];

          this.loading = false;

        }

      });


    // GET /carbon/summary

    this.data
      .getCarbonSummaryFromBackend()
      .subscribe({

        next: (summary) => {

          console.log(
            'Dashboard carbon summary:',
            summary
          );


          /*
           * Backend summary may use one of these names.
           * We support the actual backend response safely.
           */

          this.carbonTotal =
            Number(
              summary?.totalEmissions ??
              summary?.totalCarbonEmission ??
              summary?.totalCarbonEmissionKg ??
              summary?.total ??
              0
            );

        },

        error: (error) => {

          console.error(
            'Carbon summary loading failed:',
            error
          );


          /*
           * Fallback calculation from REAL backend entries.
           * This is NOT mock data.
           */

          this.carbonTotal =
            this.backendEntries.reduce(

              (sum, entry) =>

                sum +
                Number(
                  entry.carbonEmissionKg ?? 0
                ),

              0

            );

        }

      });

  }


  // =====================================================
  // LOAD GOALS
  // =====================================================

  loadGoals(): void {

    this.data
      .getGoalsFromBackend()
      .subscribe({

        next: (goals) => {

          console.log(
            'Dashboard goals:',
            goals
          );

          this.backendGoals =
            goals || [];

        },

        error: (error) => {

          console.error(
            'Dashboard goals loading failed:',
            error
          );

          this.backendGoals = [];

        }

      });

  }


  // =====================================================
  // ACTIVE GOALS
  // =====================================================

  get activeGoalsCount(): number {

    return this.backendGoals.filter(

      goal =>
        goal.status !== 'COMPLETED'

    ).length;

  }


  // =====================================================
  // COMPLETED GOALS
  // =====================================================

  get completedGoalsCount(): number {

    return this.backendGoals.filter(

      goal =>
        goal.status === 'COMPLETED'

    ).length;

  }


  // =====================================================
  // SUSTAINABILITY SCORE
  // =====================================================

  get sustainabilityScore(): number {

    /*
     * Milestone 2 simple score.
     *
     * This is calculated using REAL backend
     * carbon data instead of temporary frontend data.
     */

    if (this.carbonTotal <= 0) {

      return 100;

    }


    const score =
      100 -
      (this.carbonTotal * 0.5);


    return Math.max(
      0,
      Math.min(
        100,
        Math.round(score)
      )
    );

  }


  // =====================================================
  // CATEGORY TOTAL
  // =====================================================

  categoryTotal(
    category: string
  ): number {

    return this.backendEntries

      .filter(
        entry =>
          entry.category === category
      )

      .reduce(

        (sum, entry) =>

          sum +
          Number(
            entry.carbonEmissionKg ?? 0
          ),

        0

      );

  }


  // =====================================================
  // BAR WIDTH
  // =====================================================

  barWidth(
    category: string
  ): number {

    const totals =
      this.data.categories.map(

        item =>
          this.categoryTotal(item)

      );


    const max =
      Math.max(
        ...totals,
        1
      );


    return (
      this.categoryTotal(category) /
      max
    ) * 100;

  }

}