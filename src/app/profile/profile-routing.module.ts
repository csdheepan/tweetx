import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullComponent } from './full/full.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { UserComponent } from './user/user.component';
import { FeedComponent } from './feed/feed.component';
import { AuthGuard } from '../shared/service/auth.guard';
import { UserPostComponent } from './user-post/user-post.component';

const routes: Routes = [
  {
    path: 'full',
    component: FullComponent,
    canActivate: [AuthGuard],  //Router Guard
    children: [
      {
        path: 'user-profile',
        component: ViewProfileComponent
      },
      {
        path: 'users',
        component: UserComponent
      },
      {
        path: 'feed',
        component: FeedComponent
      },
      {
        path: 'user-post',
        component: UserPostComponent
      }

    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
