import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EcoTrackService } from '../data/ecotrack.service';

@Component({
  selector: 'app-challenges',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <!-- ========================================= -->
    <!-- PAGE HEADER -->
    <!-- ========================================= -->

    <section class="page-head">

      <div>

        <span class="eyebrow">
          Community challenges
        </span>

        <h2>
          Discover eco actions people can actually finish.
        </h2>

        <p>
          Search by category, location, and interest.
          Join challenges to earn rewards and improve
          your sustainability score.
        </p>

      </div>

    </section>


    <!-- ========================================= -->
    <!-- FILTERS -->
    <!-- ========================================= -->

    <section class="panel filter-panel">

      <label>

        Search

        <input
          [(ngModel)]="searchText"
          placeholder="Search challenge, category, or location"
        >

      </label>


      <label>

        Category

        <select
          [(ngModel)]="selectedCategory"
        >

          <option value="">
            All categories
          </option>

          <option
            *ngFor="let category of categories"
            [value]="category"
          >
            {{ category }}
          </option>

        </select>

      </label>

    </section>


    <!-- ========================================= -->
    <!-- LOADING -->
    <!-- ========================================= -->

    <section
      class="panel"
      *ngIf="loading"
    >

      <p>
        Loading challenges...
      </p>

    </section>


    <!-- ========================================= -->
    <!-- ERROR -->
    <!-- ========================================= -->

    <section
      class="panel"
      *ngIf="errorMessage"
    >

      <p>
        {{ errorMessage }}
      </p>

      <button
        class="button"
        type="button"
        (click)="loadChallenges()"
      >
        Try Again
      </button>

    </section>


    <!-- ========================================= -->
    <!-- CHALLENGES -->
    <!-- ========================================= -->

    <section
      class="challenge-grid"
      *ngIf="!loading && !errorMessage"
    >

      <article
        class="challenge-card"
        *ngFor="let challenge of filteredChallenges()"
      >

        <!-- TOP -->

        <div class="challenge-top">

          <span>
            {{ challenge.category || 'Sustainability' }}
          </span>

          <b>
            {{ challenge.reward ?? challenge.rewardPoints ?? 0 }}
            pts
          </b>

        </div>


        <!-- TITLE -->

        <h3>
          {{ challenge.title || challenge.challengeName }}
        </h3>


        <!-- DESCRIPTION -->

        <p
          *ngIf="challenge.description"
        >
          {{ challenge.description }}
        </p>


        <!-- DATE -->

        <p>

          <span
            *ngIf="challenge.location"
          >
            {{ challenge.location }} -
          </span>

          {{ challenge.participants ?? 0 }}
          participants

        </p>


        <!-- PROGRESS -->

        <progress
          [value]="challenge.progress ?? 0"
          max="100"
        ></progress>


        <!-- FOOTER -->

        <div class="challenge-footer">

          <small>
            {{ challenge.progress ?? 0 }}%
            community progress
          </small>


          <button
            class="button compact"
            [class.secondary]="challenge.joined"
            type="button"
            (click)="toggleJoin(challenge)"
            [disabled]="joiningChallengeId === challenge.id"
          >

            <span
              *ngIf="joiningChallengeId === challenge.id"
            >
              Please wait...
            </span>

            <span
              *ngIf="joiningChallengeId !== challenge.id"
            >
              {{
                challenge.joined
                  ? 'Joined ✓'
                  : 'Join'
              }}
            </span>

          </button>

          <button
            *ngIf="challenge.joined && !challenge.completed"
            class="button compact"
            type="button"
            (click)="completeChallenge(challenge)"
            [disabled]="joiningChallengeId === challenge.id"
          >
            Complete
          </button>

          <small *ngIf="challenge.completed" class="muted-copy">
            Completed ✓
          </small>

        </div>

      </article>


      <!-- ======================================= -->
      <!-- NO CHALLENGES -->
      <!-- ======================================= -->

      <div
        class="panel"
        *ngIf="filteredChallenges().length === 0"
      >

        <h3>
          No challenges found
        </h3>

        <p>
          There are currently no challenges available.
        </p>

      </div>

    </section>
  `
})
export class ChallengesComponent {

  // ==========================================
  // SEARCH
  // ==========================================

  readonly search =
    signal('');


  readonly category =
    signal('');


  // ==========================================
  // BACKEND DATA
  // ==========================================

  challenges: any[] = [];

  categories: string[] = [];


  // ==========================================
  // UI STATE
  // ==========================================

  loading = false;

  errorMessage = '';

  joiningChallengeId: number | null = null;


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    readonly data: EcoTrackService
  ) {

    this.loadChallenges();

  }


  // ==========================================
  // SEARCH GETTER
  // ==========================================

  get searchText(): string {

    return this.search();

  }


  // ==========================================
  // SEARCH SETTER
  // ==========================================

  set searchText(
    value: string
  ) {

    this.search.set(value);

  }


  // ==========================================
  // CATEGORY GETTER
  // ==========================================

  get selectedCategory(): string {

    return this.category();

  }


  // ==========================================
  // CATEGORY SETTER
  // ==========================================

  set selectedCategory(
    value: string
  ) {

    this.category.set(value);

  }


  // ==========================================
  // LOAD CHALLENGES
  // ==========================================

  loadChallenges(): void {

    this.loading = true;

    this.errorMessage = '';


    this.data
      .getChallengesFromBackend()
      .subscribe({

        next: (backendChallenges) => {

          console.log(
            'Challenges received from Spring Boot:',
            backendChallenges
          );


          this.challenges =
            (backendChallenges ?? [])
              .map(
                (challenge: any) => ({

                  ...challenge,

                  /*
                   * Support both possible backend names.
                   */

                  id:
                    challenge.id ??
                    challenge.challengeId,

                  title:
                    challenge.title ??
                    challenge.challengeName,

                  reward:
                    challenge.reward ??
                    challenge.rewardPoints ??
                    0,

                  category:
                    challenge.category ??
                    'Sustainability',

                  location:
                    challenge.location ??
                    'Community',

                  participants:
                    challenge.participants ??
                    0,

                    progress:
                      challenge.progress ??
                      0,

                    completed:
                      false,

                  joined:
                    challenge.joined ??
                    false

                })
              );


          // Build category filter

          this.categories = [
            ...new Set(

              this.challenges

                .map(
                  challenge =>
                    challenge.category
                )

                .filter(
                  category =>
                    !!category
                )

            )
          ];


          this.loading = false;


          console.log(
            'Challenges loaded:',
            this.challenges
          );


          /*
           * Check joined status for each challenge.
           */

          this.checkJoinedStatusForAll();

        },


        error: (error) => {

          console.error(
            'Failed to load challenges:',
            error
          );


          this.loading = false;


          this.errorMessage =
            'Unable to load challenges. Please make sure the backend is running and you are logged in.';

        }

      });

  }


  // ==========================================
  // CHECK JOIN STATUS
  // ==========================================

  private checkJoinedStatusForAll(): void {

    this.challenges.forEach(
      (challenge) => {

        if (!challenge.id) {
          return;
        }


        this.data
          .getChallengeStatus(Number(challenge.id))
          .subscribe({

            next: (status) => {

              challenge.joined =
                status === 'JOINED' || status === 'COMPLETED';
              challenge.completed =
                status === 'COMPLETED';


              this.challenges = [
                ...this.challenges
              ];

            },


            error: (error) => {

              console.error(
                'Unable to check joined status for challenge',
                challenge.id,
                error
              );

            }

          });

      }
    );

  }


  // ==========================================
  // FILTER
  // ==========================================

  readonly filteredChallenges =
    computed(() => {

      const query =
        this.search()
          .trim()
          .toLowerCase();


      const selectedCategory =
        this.category();


      return this.challenges.filter(
        (challenge) => {

          const title =
            String(
              challenge.title ??
              challenge.challengeName ??
              ''
            );


          const category =
            String(
              challenge.category ??
              ''
            );


          const location =
            String(
              challenge.location ??
              ''
            );


          const matchesSearch =
            !query ||
            title
              .toLowerCase()
              .includes(query) ||
            category
              .toLowerCase()
              .includes(query) ||
            location
              .toLowerCase()
              .includes(query);


          const matchesCategory =
            !selectedCategory ||
            category === selectedCategory;


          return (
            matchesSearch &&
            matchesCategory
          );

        }
      );

    });


  // ==========================================
  // JOIN / LEAVE
  // ==========================================

  toggleJoin(
    challenge: any
  ): void {

    if (
      !challenge ||
      !challenge.id
    ) {

      console.error(
        'Invalid challenge:',
        challenge
      );

      return;

    }


    const challengeId =
      Number(
        challenge.id
      );


    this.joiningChallengeId =
      challengeId;


    // ========================================
    // LEAVE
    // ========================================

    if (challenge.joined) {

      this.data
        .leaveChallengeFromBackend(
          challengeId
        )
        .subscribe({

          next: (response) => {

            console.log(
              'Challenge left:',
              response
            );


            challenge.joined =
              false;
            challenge.completed =
              false;


            this.challenges = [
              ...this.challenges
            ];


            this.joiningChallengeId =
              null;

          },


          error: (error) => {

            console.error(
              'Failed to leave challenge:',
              error
            );


            alert(
              error?.error?.message ||
              'Unable to leave the challenge.'
            );


            this.joiningChallengeId =
              null;

          }

        });


      return;

    }


    // ========================================
    // JOIN
    // ========================================

    this.data
      .joinChallengeToBackend(
        challengeId
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Challenge joined:',
            response
          );


          challenge.joined =
            true;


          /*
           * Increase participant count
           * immediately for the UI.
           */

          challenge.participants =
            Number(
              challenge.participants || 0
            ) + 1;


          this.challenges = [
            ...this.challenges
          ];


          this.joiningChallengeId =
            null;


          console.log(
            'Challenge joined successfully'
          );

        },


        error: (error) => {

          console.error(
            'Failed to join challenge:',
            error
          );


          /*
           * If backend says already joined,
           * show Joined instead of failing.
           */

          const message =
            error?.error?.message ||
            '';


          if (
            message
              .toLowerCase()
              .includes('already')
          ) {

            challenge.joined =
              true;


            this.challenges = [
              ...this.challenges
            ];

          } else {

            alert(
              'Unable to join the challenge. Please try again.'
            );

          }


          this.joiningChallengeId =
            null;

        }

      });

  }

  completeChallenge(challenge: any): void {
    if (!challenge?.id || !challenge.joined || challenge.completed) {
      return;
    }

    this.joiningChallengeId = Number(challenge.id);

    this.data.completeChallengeToBackend(Number(challenge.id)).subscribe({
      next: () => {
        challenge.completed = true;
        challenge.joined = true;
        this.challenges = [...this.challenges];
        this.joiningChallengeId = null;
      },
      error: (error) => {
        alert(error?.error?.message || 'Unable to complete the challenge.');
        this.joiningChallengeId = null;
      }
    });
  }

}
