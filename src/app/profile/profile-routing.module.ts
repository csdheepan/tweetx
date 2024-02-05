import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';

const routes: Routes = [


  {
    path: "user-profile",
    component : ViewProfileComponent
  },
  {
    path: "feed",
    component : HeaderComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
