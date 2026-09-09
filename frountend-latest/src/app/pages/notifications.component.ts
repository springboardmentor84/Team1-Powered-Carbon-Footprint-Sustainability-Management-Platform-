import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EcoTrackService } from '../data/ecotrack.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- PAGE HEADER -->

    <section class="page-head">
      <div>
        <span class="eyebrow">Notifications</span>
        <h2>Your activity updates.</h2>
        <p>
          Stay informed about your sustainability journey —
          badge unlocks, challenge updates, and platform messages.
        </p>
      </div>
    </section>


    <!-- LOADING -->

    <section class="panel" *ngIf="loading">
      <p>Loading notifications...</p>
    </section>


    <!-- ERROR -->

    <section class="panel" *ngIf="errorMessage && !loading">
      <p>{{ errorMessage }}</p>
      <button class="button" type="button" (click)="loadNotifications()">
        Try Again
      </button>
    </section>


    <!-- UNREAD COUNT STAT -->

    <section class="stats-grid" *ngIf="!loading && !errorMessage">

      <article class="stat-card">
        <span>Total</span>
        <strong>{{ notifications.length }}</strong>
        <small>Notifications</small>
      </article>

      <article class="stat-card">
        <span>Unread</span>
        <strong>{{ unreadCount }}</strong>
        <small>Unread notifications</small>
      </article>

    </section>


    <!-- NOTIFICATION LIST -->

    <section class="panel" *ngIf="!loading && !errorMessage">

      <div class="panel-header">
        <div>
          <span class="eyebrow">All notifications</span>
          <h3>Messages &amp; alerts</h3>
        </div>
        <button
          class="button"
          type="button"
          (click)="loadNotifications()"
        >
          Refresh
        </button>
      </div>


      <!-- EMPTY STATE -->

      <div *ngIf="notifications.length === 0" style="margin-top:20px;">
        <p>You have no notifications yet.</p>
      </div>


      <!-- NOTIFICATION ROWS -->

      <div
        *ngFor="let notification of notifications"
        class="admin-row"
        [style.opacity]="notification.isRead ? '0.6' : '1'"
      >

        <div>

          <strong>
            {{ notification.title }}
          </strong>

          <span>
            {{ notification.message }}
          </span>

          <small>
            {{ notification.createdAt | date:'medium' }}
            <span *ngIf="!notification.isRead">
              &nbsp;— <b style="color:#22c55e;">New</b>
            </span>
            <span *ngIf="notification.isRead">
              &nbsp;— Read
            </span>
          </small>

        </div>

        <button
          class="button compact secondary"
          type="button"
          *ngIf="!notification.isRead"
          (click)="markAsRead(notification)"
          [disabled]="notification._marking"
        >
          {{ notification._marking ? 'Marking...' : 'Mark read' }}
        </button>

      </div>

    </section>
  `
})
export class NotificationsComponent implements OnInit {

  notifications: any[] = [];
  loading = false;
  errorMessage = '';


  constructor(
    readonly data: EcoTrackService
  ) {}


  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    this.loadNotifications();
  }


  // ==========================================
  // UNREAD COUNT
  // ==========================================

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }


  // ==========================================
  // LOAD NOTIFICATIONS
  // ==========================================

  loadNotifications(): void {

    this.loading = true;
    this.errorMessage = '';

    this.data
      .getNotificationsFromBackend()
      .subscribe({

        next: (data) => {

          this.notifications = (data ?? []).map(n => ({
            ...n,
            _marking: false
          }));

          this.loading = false;

          console.log(
            'Notifications loaded:',
            this.notifications
          );

        },

        error: (error) => {

          console.error(
            'Notifications load failed:',
            error
          );

          this.errorMessage =
            'Unable to load notifications. Make sure the backend is running and you are logged in.';

          this.loading = false;

        }

      });

  }


  // ==========================================
  // MARK AS READ
  // ==========================================

  markAsRead(notification: any): void {

    if (!notification || !notification.notificationId) {
      return;
    }

    notification._marking = true;

    this.data
      .markNotificationReadBackend(
        Number(notification.notificationId)
      )
      .subscribe({

        next: () => {

          notification.isRead = true;
          notification._marking = false;

          console.log(
            'Notification marked as read:',
            notification.notificationId
          );

        },

        error: (error) => {

          console.error(
            'Failed to mark notification as read:',
            error
          );

          notification._marking = false;

          alert('Unable to mark notification as read.');

        }

      });

  }

}
