import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './profile/header/header.component';

const routes: Routes = [

  {
    path : 'login',
    component : LoginComponent
  }
  ,
  {
    path : "",
    redirectTo : "login",
    pathMatch : 'full'
  }

  ,
  {
    path : 'profile',
    loadChildren : () => import('./profile/profile.module').then(m => m.ProfileModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
