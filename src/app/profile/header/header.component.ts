import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InMemoryCache } from 'src/app/core/services/memory-cache';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {


  profile : boolean = true;
  feed : boolean = false;
  user : boolean = false;


  constructor(private router : Router,private store : InMemoryCache){}

  

  navigateUser(){
    this.profile = false;
    this.feed = false;
    this.user = true;
  }

  navigateFeed(){
    this.profile = false;
    this.feed = true;
    this.user = false;
  }

  navigateProfile(){
    this.profile = true;
    this.feed = false;
    this.user = false;
  }

  logout(){
    this.router.navigate(["login"]);
    this.store.clear();
  }
}
