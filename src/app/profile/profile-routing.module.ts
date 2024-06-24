import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullComponent } from './full/full.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { UserComponent } from './user/user.component';
import { FeedComponent } from './feed/feed.component';
import { UserPostComponent } from './user-post/user-post.component';
import { AuthGuard } from '../core/guard/auth-guard';
import { MessageComponent } from './message/message.component';
import { UserMessageComponent } from './user-message/user-message.component';

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
      },
      {
        path: 'user-profile/:id',
        component: ViewProfileComponent
      },
      {
        path: 'message',
        component: MessageComponent
      },
      {
        path: 'users-message',
        component: UserMessageComponent
      }

    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
