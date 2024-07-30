import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { UserInactivityComponent } from '../components/user-inactivity/user-inactivity.component';

/**
 * Service to manage user inactivity.
 * If the user is idle for 3 minutes, a dialog will be shown to the user.
 */

@Injectable({
  providedIn: 'root'
})

/**
 * TODO: Session Management and Idle Detection
 * 
 * 1. Resume Session on Page Refresh:
 *    - Restore ongoing processes, like timers, using localStorage or sessionStorage.
 * 
 * 2. Show Dialog on User Inactivity when user on Idle:
 *    - Detect inactivity by monitoring user actions (e.g., mouse movements, keypresses).
 *    - Open a dialog if the user is idle for a specified time.
 *    - Provide options to extend the session or log out.
 * 
 * Notes:
 * - Ensure secure handling of session data.
 * - Consider multiple tabs and configurable idle time.
 */


export class InactivityService {

  private idleActivity: Subject<any> = new Subject();
  private idleActivitySubscription !: Subscription | null;
  private readonly IDLE_TIMEOUT = 600000; // 10 minutes in milliseconds

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) { }

  start() {
    if (this.idleActivitySubscription) {
      this.idleActivitySubscription.unsubscribe();
    }
    this.idleActivitySubscription = this.idleActivity.pipe(debounceTime(this.IDLE_TIMEOUT)).subscribe(() => {
      this.showIdleDialog();
    });

    this.initTimer(); // Initialize timer
  }

  stop() {
    if (this.idleActivitySubscription) {
      this.idleActivitySubscription.unsubscribe();
      this.idleActivitySubscription = null;
    }
  }

  initTimer() {
    this.idleActivity.next(this.IDLE_TIMEOUT);
  }

  showIdleDialog() {
    this.dialog.open(UserInactivityComponent, {
      disableClose: true,
      data: { message: 'Your token has expired. Please log in again.' }
    });
    this.stop();
    console.log("User token expired");
  }
}
