import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InMemoryCache } from '../../service/memory-cache.service';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent {

  pageNotFound = "assets/images/404-page.png";
  
  constructor(private router : Router,private store : InMemoryCache){}

  goHomePage(){
    this.router.navigate(["login"]);
    this.store.clear();
  }
}
