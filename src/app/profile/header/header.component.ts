import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {


  profile : boolean = true;
  feed : boolean = false;
  user : boolean = false;


  constructor(private router : Router){}

  

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
}
