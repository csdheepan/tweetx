import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})


export class HeaderComponent {

  // Variable declaration
  profile : boolean = true;
  feed : boolean = false;
  user : boolean = false;


 //constructor : Utilize Dependency Injection here.
  constructor(private router : Router,private store : InMemoryCache){}


  //method used show user
  navigateUser(){
    this.profile = false;
    this.feed = false;
    this.user = true;
  }

  //method used show feed post
  navigateFeed(){
    this.profile = false;
    this.feed = true;
    this.user = false;
  }

  //method used show profile
  navigateProfile(){
    this.profile = true;
    this.feed = false;
    this.user = false;
  }

  //method used for logout session
  logout(){
    this.router.navigate(["login"]);
    this.store.clear();
  }

}
