import { bootstrapApplication } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import {
  provideRouter,
  Router,
  Routes,
  withInMemoryScrolling
} from '@angular/router';
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
import { GamificationComponent } from './app/pages/gamification.component';
import { NotificationsComponent } from './app/pages/notifications.component';
import { AnalyticsComponent } from './app/pages/analytics.component';


const authGuard = () => {
  const data = inject(EcoTrackService);

  return data.isAuthenticated()
    || inject(Router).parseUrl('/login');
};

const adminGuard = () => {
  const data = inject(EcoTrackService);

  if (!data.isAuthenticated()) {
    return inject(Router).parseUrl('/login');
  }

  return data.isCurrentUserAdmin()
    || inject(Router).parseUrl('/dashboard');
};


const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    title: 'EcoTrack Login'
  },

  {
    path: 'login',
    component: LoginComponent,
    title: 'EcoTrack Login'
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'EcoTrack Dashboard',
    canActivate: [authGuard]
  },

  {
    path: 'gamification',
    component: GamificationComponent,
    title: 'Gamification',
    canActivate: [authGuard]
  },

  {
    path: 'analytics',
    component: AnalyticsComponent,
    title: 'Analytics Dashboard',
    canActivate: [authGuard]
  },

  {
    path: 'notifications',
    component: NotificationsComponent,
    title: 'Notifications',
    canActivate: [authGuard]
  },

  {
    path: 'tracker',
    component: TrackerComponent,
    title: 'Carbon Tracker',
    canActivate: [authGuard]
  },

  {
    path: 'goals',
    component: GoalsComponent,
    title: 'Sustainability Goals',
    canActivate: [authGuard]
  },

  {
    path: 'challenges',
    component: ChallengesComponent,
    title: 'Community Challenges',
    canActivate: [authGuard]
  },

  {
    path: 'reports',
    component: ReportsComponent,
    title: 'Reports',
    canActivate: [authGuard]
  },

  {
    path: 'profile',
    component: ProfileComponent,
    title: 'Profile',
    canActivate: [authGuard]
  },

  {
    path: 'admin',
    component: AdminComponent,
    title: 'Admin',
    canActivate: [adminGuard]
  },

  {
    path: '**',
    redirectTo: ''
  }
];


bootstrapApplication(AppComponent, {
  providers: [

    // Allows Angular services to use HttpClient
    provideHttpClient(),

    // Angular animations
    provideAnimations(),

    // Application routing
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top'
      })
    )

  ]
}).catch(
  error => console.error(error)
);
