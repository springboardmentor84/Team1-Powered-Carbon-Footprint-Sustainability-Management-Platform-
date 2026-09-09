import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { EcoTrackService } from '../data/ecotrack.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="login-page">

      <section class="login-visual">

        <div class="login-brand">
          <img src="assets/leaf.svg" alt="">
          <div>
            <strong>EcoTrack</strong>
            <span>
              AI-Powered Carbon Footprint & Sustainability Management Platform
            </span>
          </div>
        </div>

        <div class="login-message">
          <h1>Track your footprint. Protect our planet.</h1>

          <p>
            Start by signing in, then add your transport, electricity, food,
            water, waste, shopping, and travel usage to generate your personal
            sustainability report.
          </p>
        </div>

        <img
          class="eco-scene"
          src="assets/eco-scene.svg"
          alt=""
        >

      </section>


      <section class="login-card">

        <div class="login-card-brand">
          <img src="assets/leaf.svg" alt="">
          <strong>Eco<span>Track</span></strong>
        </div>


        <!-- LOGIN -->

        <ng-container
          *ngIf="mode() === 'login'; else registerTemplate"
        >

          <h2>Welcome Back!</h2>

          <p>
            Sign in to continue your sustainability journey.
          </p>


          <form
            [formGroup]="loginForm"
            (ngSubmit)="login()"
          >

            <label>
              Email Address

              <span class="input-icon">

                <img
                  src="assets/mail.svg"
                  alt=""
                >

                <input
                  type="email"
                  formControlName="email"
                  placeholder="Enter your email"
                >

              </span>

            </label>


            <label>
              Password

              <span class="input-icon">

                <img
                  src="assets/lock.svg"
                  alt=""
                >

                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Enter your password"
                >

                <button
                  type="button"
                  class="icon-button"
                  (click)="showPassword.set(!showPassword())"
                >
                  View
                </button>

              </span>

            </label>


            <div class="login-options">

              <label class="inline-check">

                <input
                  type="checkbox"
                  formControlName="remember"
                >

                Remember Me

              </label>

              <button
                type="button"
              >
                Forgot Password?
              </button>

            </div>


            <button
              class="button primary full"
              type="submit"
              [disabled]="loginForm.invalid"
            >
              Login
            </button>

          </form>


          <div class="divider">
            <span>OR</span>
          </div>


          <button
            class="google-button"
            type="button"
            (click)="googleLogin()"
          >

            <img
              src="assets/google.svg"
              alt=""
            >

            Continue with Google

          </button>


          <p class="switch-text">

            Don't have an account?

            <button
              type="button"
              (click)="mode.set('register')"
            >
              Create Account
            </button>

          </p>

        </ng-container>


        <!-- REGISTER -->

        <ng-template #registerTemplate>

          <h2>Create Account</h2>

          <p>
            Tell EcoTrack who you are so your dashboard feels personal.
          </p>


          <form
            [formGroup]="registerForm"
            (ngSubmit)="register()"
          >

            <label>
              Full Name

              <span class="input-icon">

                <img
                  src="assets/leaf.svg"
                  alt=""
                >

                <input
                  formControlName="name"
                  placeholder="Enter your full name"
                >

              </span>

            </label>


            <label>
              Email Address

              <span class="input-icon">

                <img
                  src="assets/mail.svg"
                  alt=""
                >

                <input
                  type="email"
                  formControlName="email"
                  placeholder="Enter your email"
                >

              </span>

            </label>


            <label>
              Location

              <span class="input-icon">

                <img
                  src="assets/leaf.svg"
                  alt=""
                >

                <input
                  formControlName="location"
                  placeholder="City, country"
                >

              </span>

            </label>


            <label>
              Password

              <span class="input-icon">

                <img
                  src="assets/lock.svg"
                  alt=""
                >

                <input
                  type="password"
                  formControlName="password"
                  placeholder="Create a password"
                >

              </span>

            </label>


            <button
              class="button primary full"
              type="submit"
              [disabled]="registerForm.invalid"
            >
              Create Account
            </button>

          </form>


          <p class="switch-text">

            Already have an account?

            <button
              type="button"
              (click)="mode.set('login')"
            >
              Login
            </button>

          </p>

        </ng-template>

      </section>

    </main>
  `
})
export class LoginComponent implements OnInit {

  readonly mode =
    signal<'login' | 'register'>('login');

  readonly showPassword =
    signal(false);


  // LOGIN FORM

  readonly loginForm =
    this.fb.nonNullable.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(4)
        ]
      ],

      remember: [true]

    });


  // REGISTER FORM

  readonly registerForm =
    this.fb.nonNullable.group({

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      location: [
        '',
        Validators.required
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(4)
        ]
      ]

    });


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private data: EcoTrackService,
    private http: HttpClient
  ) {}


  ngOnInit(): void {

    if (this.data.isAuthenticated()) {

      this.router.navigateByUrl('/dashboard');

    }

  }


  // REAL SPRING BOOT LOGIN

  login(): void {

    if (this.loginForm.invalid) {
      return;
    }


    const value =
      this.loginForm.getRawValue();


    console.log('Sending login request to backend...');


    this.http.post<any>(

      'http://localhost:9042/login',

      {
        email: value.email,
        password: value.password
      }

    ).subscribe({

      next: (response) => {

        console.log('Login successful, response:', response);


        // Save JWT + extract role from response / JWT payload

        this.data.saveBackendToken(response);


        // Create display name from email

        const name =
          value.email
            .split('@')[0]
            .replace(/[._-]/g, ' ')
          || 'EcoTrack User';


        // Mark user as logged in (sets currentUser signal)

        this.data.login(
          value.email,
          this.titleCase(name)
        );


        // Go to dashboard

        this.router.navigateByUrl(
          '/dashboard'
        );

      },


      error: (error) => {

        console.error(
          'Login failed:',
          error
        );


        alert(
          error?.error?.message ||
          'Invalid email or password'
        );

      }

    });

  }


  // REGISTER — calls real Spring Boot /register endpoint

  register(): void {

    if (this.registerForm.invalid) {
      return;
    }


    const value =
      this.registerForm.getRawValue();


    // POST to real Spring Boot backend

    this.http.post<any>(

      'http://localhost:9042/register',

      {
        name: value.name,
        email: value.email,
        password: value.password,
        role: 'USER'
      }

    ).subscribe({

      next: () => {

        console.log('Registration successful, logging in...');


        // Auto-login after successful registration

        this.http.post<any>(

          'http://localhost:9042/login',

          {
            email: value.email,
            password: value.password
          }

        ).subscribe({

          next: (loginResponse) => {

            this.data.saveBackendToken(loginResponse);

            this.data.login(
              value.email,
              value.name
            );

            this.router.navigateByUrl('/dashboard');

          },

          error: () => {

            // Registration worked, just redirect to login

            this.mode.set('login');

            alert('Account created! Please log in.');

          }

        });

      },


      error: (error) => {

        console.error('Registration failed:', error);

        alert(
          error?.error?.message ||
          'Registration failed. Please try again.'
        );

      }

    });

  }


  // GOOGLE LOGIN

  googleLogin(): void {
    alert('Google login is not configured. Please use email and password.');
  }


  // TITLE CASE

  private titleCase(
    value: string
  ): string {

    return value
      .split(' ')
      .filter(Boolean)
      .map(
        (part) =>
          part[0].toUpperCase()
          + part.slice(1)
      )
      .join(' ');

  }

}
