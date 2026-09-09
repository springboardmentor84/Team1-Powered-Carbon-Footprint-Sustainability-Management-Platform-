import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { EcoTrackService } from '../data/ecotrack.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `

    <!-- ========================================= -->
    <!-- HEADER -->
    <!-- ========================================= -->

    <section class="page-head">

      <div>

        <span class="eyebrow">
          Administrator dashboard
        </span>

        <h2>
          Manage EcoTrack challenges and community activity.
        </h2>

        <p>
          Create challenges, manage existing challenges,
          and monitor community participation.
        </p>

      </div>

    </section>


    <!-- ========================================= -->
    <!-- CREATE CHALLENGE -->
    <!-- ========================================= -->

    <section class="panel form-panel">

      <div class="panel-header">

        <div>

          <span class="eyebrow">
            Challenge management
          </span>

          <h3>
            Create new challenge
          </h3>

        </div>

      </div>


      <form [formGroup]="challengeForm">

        <!-- TITLE -->

        <label>

          Challenge title

          <input
            type="text"
            formControlName="title"
            placeholder="Example: No Plastic Week"
          >

        </label>


        <!-- DESCRIPTION -->

        <label>

          Description

          <textarea
            formControlName="description"
            rows="4"
            placeholder="Describe the sustainability challenge..."
          ></textarea>

        </label>


        <!-- DATES -->

        <div class="two-column">

          <label>

            Start date

            <input
              type="date"
              formControlName="startDate"
            >

          </label>


          <label>

            End date

            <input
              type="date"
              formControlName="endDate"
            >

          </label>

        </div>


        <!-- REWARD -->

        <label>

          Reward points

          <input
            type="number"
            min="1"
            formControlName="reward"
          >

        </label>


        <!-- CREATE -->

        <button
          class="button primary"
          type="button"
          (click)="createChallenge()"
          [disabled]="saving"
        >

          <span *ngIf="!saving">
            Create Challenge
          </span>

          <span *ngIf="saving">
            Creating...
          </span>

        </button>

      </form>


      <!-- SUCCESS -->

      <div
        *ngIf="successMessage"
        style="margin-top: 20px;"
      >

        <strong>
          {{ successMessage }}
        </strong>

      </div>


      <!-- ERROR -->

      <div
        *ngIf="errorMessage"
        style="margin-top: 20px;"
      >

        <strong>
          {{ errorMessage }}
        </strong>

      </div>

    </section>


    <!-- ========================================= -->
    <!-- EXISTING CHALLENGES -->
    <!-- ========================================= -->

    <section class="panel">

      <div class="panel-header">

        <div>

          <span class="eyebrow">
            Backend challenges
          </span>

          <h3>
            Existing challenges
          </h3>

        </div>


        <button
          class="button"
          type="button"
          (click)="loadChallenges()"
          [disabled]="loading"
        >

          {{ loading ? 'Loading...' : 'Refresh' }}

        </button>

      </div>


      <!-- LOADING -->

      <div *ngIf="loading">

        <p>
          Loading challenges...
        </p>

      </div>


      <!-- CHALLENGES -->

      <div
        class="admin-row"
        *ngFor="let challenge of data.challenges()"
      >

        <div>

          <strong>
            {{ challenge.title }}
          </strong>

          <span>
            {{ challenge.category }}
            -
            {{ challenge.location }}
          </span>

          <small>
            Reward:
            {{ challenge.reward }}
            points
          </small>

        </div>


        <button
          class="button compact"
          type="button"
          (click)="deleteChallenge(challenge.id)"
        >

          Delete

        </button>

      </div>


      <!-- EMPTY -->

      <div
        *ngIf="
          !loading &&
          data.challenges().length === 0
        "
      >

        <p>
          No challenges available.
        </p>

      </div>

    </section>


    <!-- ========================================= -->
    <!-- PLATFORM STATS -->
    <!-- ========================================= -->

    <section class="stats-grid">

      <article class="stat-card">

        <span>
          Total users
        </span>

        <strong>
          {{ totalUsers }}
        </strong>

        <small>
          Registered users
        </small>

      </article>


      <article class="stat-card">

        <span>
          Challenges
        </span>

        <strong>
          {{ data.challenges().length }}
        </strong>

        <small>
          Backend challenges
        </small>

      </article>


      <article class="stat-card">

        <span>
          Joined challenges
        </span>

        <strong>
          {{ activeChallenges }}
        </strong>

        <small>
          Current participation
        </small>

      </article>


      <article class="stat-card">

        <span>
          System health
        </span>

        <strong>
          99.9%
        </strong>

        <small>
          API availability
        </small>

      </article>

    </section>

  `
})
export class AdminComponent {

  // ==========================================
  // FORM
  // ==========================================

  readonly challengeForm =
    this.fb.nonNullable.group({

      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      description: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      startDate: [
        new Date()
          .toISOString()
          .slice(0, 10),

        Validators.required
      ],

      endDate: [
        new Date()
          .toISOString()
          .slice(0, 10),

        Validators.required
      ],

      reward: [
        100,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]

    });


  // ==========================================
  // STATE
  // ==========================================

  saving = false;

  loading = false;

  successMessage = '';

  errorMessage = '';

  totalUsers = 0;


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    readonly data: EcoTrackService,
    private fb: FormBuilder
  ) {

    this.loadChallenges();

  }


  // ==========================================
  // LOAD CHALLENGES
  // ==========================================

  loadChallenges(): void {

    console.log(
      'Loading challenges from backend...'
    );

    this.loading = true;


    this.data
      .getChallengesFromBackend()
      .subscribe({

        next: (backendChallenges: any[]) => {

          console.log(
            'Backend challenges:',
            backendChallenges
          );


          const challenges =
            backendChallenges.map(
              (challenge: any) => ({

                id:
                  challenge.id ??
                  challenge.challengeId,

                title:
                  challenge.title ??
                  challenge.challengeName ??
                  'Untitled Challenge',

                category:
                  challenge.category ??
                  'Community',

                location:
                  challenge.location ??
                  'Online',

                participants:
                  challenge.participants ??
                  challenge.participantCount ??
                  0,

                reward:
                  challenge.reward ??
                  challenge.rewardPoints ??
                  0,

                progress:
                  challenge.progress ??
                  0,

                joined:
                  false

              })
            );


          this.data.challenges.set(
            challenges
          );


          this.loading = false;


          console.log(
            'Angular challenges:',
            this.data.challenges()
          );

        },


        error: (error: any) => {

          console.error(
            'Load challenges failed:',
            error
          );


          this.loading = false;


          this.errorMessage =
            error?.error?.message ||
            'Unable to load challenges.';

        }

      });

  }


  // ==========================================
  // CREATE CHALLENGE
  // ==========================================

  createChallenge(): void {

    console.log(
      '================================='
    );

    console.log(
      'CREATE BUTTON CLICKED'
    );

    console.log(
      '================================='
    );


    this.successMessage = '';

    this.errorMessage = '';


    // Check form

    if (this.challengeForm.invalid) {

      console.log(
        'FORM INVALID'
      );


      this.challengeForm.markAllAsTouched();


      this.errorMessage =
        'Please fill all fields correctly.';


      console.log(
        'FORM VALUE:',
        this.challengeForm.getRawValue()
      );


      return;

    }


    console.log(
      'FORM VALID'
    );


    const challenge =
      this.challengeForm.getRawValue();


    console.log(
      'CHALLENGE BEING SENT:',
      challenge
    );


    this.saving = true;


    // ==========================================
    // SEND TO SPRING BOOT
    // ==========================================

    this.data
      .createChallengeToBackend(
        challenge
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            '================================='
          );

          console.log(
            'CHALLENGE CREATED'
          );

          console.log(
            response
          );

          console.log(
            '================================='
          );


          this.saving = false;


          this.successMessage =
            'Challenge created successfully!';


          this.errorMessage = '';


          // Reset form

          this.challengeForm.reset({

            title: '',

            description: '',

            startDate:
              new Date()
                .toISOString()
                .slice(0, 10),

            endDate:
              new Date()
                .toISOString()
                .slice(0, 10),

            reward: 100

          });


          // Get latest database data

          this.loadChallenges();

        },


        error: (error: any) => {

          console.error(
            '================================='
          );

          console.error(
            'CHALLENGE CREATION FAILED'
          );

          console.error(
            error
          );

          console.error(
            'STATUS:',
            error?.status
          );

          console.error(
            'ERROR BODY:',
            error?.error
          );

          console.error(
            '================================='
          );


          this.saving = false;


          if (error?.status === 401) {

            this.errorMessage =
              'Unauthorized. Please login again.';

          }

          else if (error?.status === 403) {

            this.errorMessage =
              'Access denied. ADMIN role required.';

          }

          else if (error?.status === 400) {

            this.errorMessage =
              error?.error?.message ||
              'Invalid challenge data.';

          }

          else {

            this.errorMessage =
              error?.error?.message ||
              'Unable to create challenge. Check Spring Boot console.';

          }

        }

      });

  }


  // ==========================================
  // DELETE CHALLENGE
  // ==========================================

  deleteChallenge(
    challengeId: number
  ): void {

    if (!challengeId) {

      return;

    }


    const confirmed =
      confirm(
        'Are you sure you want to delete this challenge?'
      );


    if (!confirmed) {

      return;

    }


    this.data
      .deleteChallengeFromBackend(
        challengeId
      )
      .subscribe({

        next: () => {

          console.log(
            'Challenge deleted successfully'
          );


          this.successMessage =
            'Challenge deleted successfully.';


          this.loadChallenges();

        },


        error: (error: any) => {

          console.error(
            'Delete challenge failed:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to delete challenge.';

        }

      });

  }


  // ==========================================
  // PARTICIPATION
  // ==========================================

  get activeChallenges(): number {

    return this.data
      .challenges()
      .filter(
        challenge =>
          challenge.joined
      )
      .length;

  }

}