import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';

@Component({
  selector: 'app-full',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})
export class FullComponent {


  constructor(
    private store : InMemoryCache,
    private router : Router
  ){}


  logout(){
    this.store.clear();
    this.router.navigate(['login']);
  }
}
