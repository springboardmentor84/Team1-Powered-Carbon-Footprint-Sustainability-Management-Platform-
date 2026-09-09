import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { EcoTrackService } from '../data/ecotrack.service';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `

    <!-- ================================================= -->
    <!-- PAGE HEADER -->
    <!-- ================================================= -->

    <section class="page-head">

      <div>

        <span class="eyebrow">
          Sustainability goals
        </span>

        <h2>
          Turn broad intentions into measurable progress.
        </h2>

        <p>
          Create carbon, water, transport, recycling, plastic,
          and tree planting goals with transparent completion tracking.
        </p>

      </div>

    </section>


    <!-- ================================================= -->
    <!-- FORM + GOALS -->
    <!-- ================================================= -->

    <section class="form-layout">


      <!-- ================================================= -->
      <!-- CREATE GOAL FORM -->
      <!-- ================================================= -->

      <form
        class="panel form-panel"
        [formGroup]="goalForm"
        (ngSubmit)="submit()"
      >

        <div class="panel-header">

          <div>

            <span class="eyebrow">
              New goal
            </span>

            <h3>
              Goal details
            </h3>

          </div>

        </div>


        <!-- TITLE -->

        <label>

          Goal title

          <input
            formControlName="title"
            placeholder="Example: Reduce monthly electricity use"
          >

        </label>


        <!-- TYPE -->

        <label>

          Goal type

          <select formControlName="type">

            <option
              *ngFor="let type of data.goalTypes"
              [value]="type"
            >
              {{ type }}
            </option>

          </select>

        </label>


        <!-- TARGET + UNIT -->

        <div class="two-column">

          <label>

            Target

            <input
              type="number"
              min="1"
              formControlName="target"
            >

          </label>


          <label>

            Unit

            <input
              formControlName="unit"
              placeholder="kg CO2e, kWh, litres, rides"
            >

          </label>

        </div>


        <!-- DEADLINE -->

        <label>

          Deadline

          <input
            type="date"
            formControlName="deadline"
          >

        </label>


        <!-- CREATE BUTTON -->

        <button
          class="button primary"
          type="submit"
          [disabled]="goalForm.invalid || saving"
        >

          {{ saving ? 'Creating...' : 'Create goal' }}

        </button>

      </form>


      <!-- ================================================= -->
      <!-- BACKEND GOALS -->
      <!-- ================================================= -->

      <article class="panel">

        <div class="panel-header">

          <div>

            <span class="eyebrow">
              Active plan
            </span>

            <h3>
              Progress tracker
            </h3>

          </div>


          <button
            class="button"
            type="button"
            (click)="loadGoals()"
          >
            Refresh
          </button>

        </div>


        <!-- ================================================= -->
        <!-- GOAL CARDS -->
        <!-- ================================================= -->

        <div
          class="goal-card"
          *ngFor="let goal of backendGoals"
        >

          <div class="goal-card-top">

            <div>

              <strong>
                {{ goal.goalName }}
              </strong>

              <span>
                {{ goal.status }}
                -
                Due {{ goal.endDate }}
              </span>

            </div>


            <b>
              {{
                percentage(
                  goal.currentValue,
                  goal.targetValue
                )
              }}%
            </b>

          </div>


          <!-- PROGRESS -->

          <progress
            [value]="goal.currentValue"
            [max]="goal.targetValue"
          ></progress>


          <!-- RANGE -->

          <label class="range-label">

            Update progress

            <input
              type="range"
              min="0"
              [max]="goal.targetValue"
              [value]="goal.currentValue"
              (input)="setProgress(goal.goalId, $event)"
            >

          </label>


          <small>

            {{ goal.currentValue }}
            /
            {{ goal.targetValue }}

          </small>

        </div>


        <!-- NO GOALS -->

        <div
          *ngIf="backendGoals.length === 0"
        >

          <p>
            No goals found. Create your first sustainability goal.
          </p>

        </div>

      </article>

    </section>

  `
})
export class GoalsComponent implements OnInit {


  // =====================================================
  // FORM
  // =====================================================

  readonly goalForm =
    this.fb.nonNullable.group({

      title: [
        '',
        [
          Validators.required,
          Validators.minLength(4)
        ]
      ],

      type: [
        'Reduce Carbon Emissions',
        Validators.required
      ],

      target: [
        100,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      unit: [
        'kg CO2e',
        Validators.required
      ],

      deadline: [
        new Date(
          Date.now() +
          1000 * 60 * 60 * 24 * 30
        )
          .toISOString()
          .slice(0, 10),

        Validators.required
      ]

    });


  // =====================================================
  // BACKEND GOALS
  // =====================================================

  backendGoals: any[] = [];

  saving = false;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    readonly data: EcoTrackService,
    private fb: FormBuilder
  ) {}


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  ngOnInit(): void {

    this.loadGoals();

  }


  // =====================================================
  // GET GOALS FROM SPRING BOOT
  // =====================================================

  loadGoals(): void {

    this.data
      .getGoalsFromBackend()
      .subscribe({

        next: (goals) => {

          console.log(
            'Goals from backend:',
            goals
          );

          this.backendGoals = goals;

        },

        error: (error) => {

          console.error(
            'Failed to load goals:',
            error
          );

          alert(
            'Unable to load goals. Please make sure the backend is running and you are logged in.'
          );

        }

      });

  }


  // =====================================================
  // CREATE GOAL
  // =====================================================

  submit(): void {

    if (this.goalForm.invalid) {
      return;
    }


    const value =
      this.goalForm.getRawValue();


    const backendGoal = {

      goalName:
        value.title,

      targetValue:
        value.target,

      currentValue:
        0,

      startDate:
        new Date()
          .toISOString()
          .slice(0, 10),

      endDate:
        value.deadline,

      status:
        'ACTIVE'

    };


    this.saving = true;


    this.data
      .addGoalToBackend(backendGoal)
      .subscribe({

        next: (response) => {

          console.log(
            'Goal created:',
            response
          );


          alert(
            'Goal created successfully!'
          );


          this.saving = false;


          // Reset form

          this.goalForm.patchValue({

            title: '',

            target: 100,

            unit: 'kg CO2e',

            type: 'Reduce Carbon Emissions',

            deadline:
              new Date(
                Date.now() +
                1000 * 60 * 60 * 24 * 30
              )
                .toISOString()
                .slice(0, 10)

          });


          // Reload from database

          this.loadGoals();

        },


        error: (error) => {

          console.error(
            'Goal creation failed:',
            error
          );


          this.saving = false;


          alert(
            'Failed to create goal. Please check the backend.'
          );

        }

      });

  }


  // =====================================================
  // UPDATE GOAL PROGRESS
  // =====================================================

  setProgress(
    goalId: number,
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    const currentValue =
      Number(input.value);


    // Find the complete goal first
    const goal =
      this.backendGoals.find(
        item =>
          item.goalId === goalId
      );


    if (!goal) {

      console.error(
        'Goal not found:',
        goalId
      );

      return;

    }


    /*
     * IMPORTANT:
     * Send the COMPLETE goal object.
     *
     * Previously only currentValue was sent.
     * That caused goalName to become null
     * in Spring Boot.
     */

    const updatedGoal = {

      goalName:
        goal.goalName,

      targetValue:
        Number(goal.targetValue),

      currentValue:
        currentValue,

      startDate:
        goal.startDate,

      endDate:
        goal.endDate,

      status:
        currentValue >= Number(goal.targetValue)
          ? 'COMPLETED'
          : 'ACTIVE'

    };


    console.log(
      'Updating complete goal:',
      updatedGoal
    );


    this.data
      .updateGoalProgressBackend(
        goalId,
        updatedGoal
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Goal progress updated:',
            response
          );


          // Update local displayed value

          goal.currentValue =
            currentValue;

          goal.status =
            updatedGoal.status;

        },


        error: (error) => {

          console.error(
            'Goal progress update failed:',
            error
          );


          alert(
            'Failed to update goal progress.'
          );

        }

      });

  }


  // =====================================================
  // PERCENTAGE
  // =====================================================

  percentage(
    progress: number,
    target: number
  ): number {

    if (!target || target <= 0) {
      return 0;
    }


    return Math.round(
      (progress / target) * 100
    );

  }

}