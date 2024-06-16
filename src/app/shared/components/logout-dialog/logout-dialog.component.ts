import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InMemoryCache } from '../../service/memory-cache.service';

@Component({
  selector: 'app-logout-dialog',
  templateUrl: './logout-dialog.component.html',
  styleUrls: ['./logout-dialog.component.scss']
})
export class LogoutDialogComponent {

  constructor(
    private router: Router, 
    private store: InMemoryCache
  ){}

  logout() {
    this.store.clear();
    this.router.navigate(['']);
  }

}
