import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'shared',
    loadChildren: () => import('./shared/shared.module').then(m => m.SharedModule)
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: "",
    redirectTo: "login",
    pathMatch: 'full'
  },
  {
    path : "**" ,
    component : PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
