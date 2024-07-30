import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { InMemoryCache } from '../../service/memory-cache.service';

@Component({
  selector: 'app-user-inactivity',
  templateUrl: './user-inactivity.component.html',
  styleUrls: ['./user-inactivity.component.scss']
})
export class UserInactivityComponent {


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private store:InMemoryCache
  ) {}

  logout() {
    this.store.clear();
    this.router.navigate(['']);
  }
}
