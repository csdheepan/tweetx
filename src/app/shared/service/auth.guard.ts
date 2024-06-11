import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { InMemoryCache } from './memory-cache.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private store: InMemoryCache) {}

  canActivate(): boolean {
    const userDetails = this.store.getItem("USER_DETAILS");
    if (userDetails) {
      // User details exist, allow navigation
      return true;
    } else {
      // User details don't exist, clear cache and navigate to login page
      this.store.clear();
      this.router.navigate(['/login']);
      return false;
    }
  }
}
