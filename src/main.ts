import { bootstrapApplication } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { provideRouter, Router, Routes, withInMemoryScrolling } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { DashboardComponent } from './app/pages/dashboard.component';
import { TrackerComponent } from './app/pages/tracker.component';
import { GoalsComponent } from './app/pages/goals.component';
import { ChallengesComponent } from './app/pages/challenges.component';
import { ReportsComponent } from './app/pages/reports.component';
import { ProfileComponent } from './app/pages/profile.component';
import { AdminComponent } from './app/pages/admin.component';
import { LoginComponent } from './app/pages/login.component';
import { EcoTrackService } from './app/data/ecotrack.service';

const authGuard = () => {
  const data = inject(EcoTrackService);
  return data.isAuthenticated() || inject(Router).parseUrl('/login');
};

const routes: Routes = [
  { path: '', component: LoginComponent, title: 'EcoTrack Login' },
  { path: 'login', component: LoginComponent, title: 'EcoTrack Login' },
  { path: 'dashboard', component: DashboardComponent, title: 'EcoTrack Dashboard', canActivate: [authGuard] },
  { path: 'tracker', component: TrackerComponent, title: 'Carbon Tracker', canActivate: [authGuard] },
  { path: 'goals', component: GoalsComponent, title: 'Sustainability Goals', canActivate: [authGuard] },
  { path: 'challenges', component: ChallengesComponent, title: 'Community Challenges', canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, title: 'Reports', canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, title: 'Profile', canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, title: 'Admin', canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' }))
  ]
}).catch((error) => console.error(error));
