import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FeedComponent } from './feed/feed.component';
import { UserComponent } from './user/user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { EditProfileComponent } from './modal/edit-profile/edit-profile.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FullComponent } from './full/full.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { UserPostComponent } from './user-post/user-post.component';
import { MessageComponent } from './message/message.component';
import { UserMessageComponent } from './user-message/user-message.component';
import { SharePostComponent } from './modal/share-post/share-post.component';
import { UserCommentsComponent } from './user-comments/user-comments.component';

@NgModule({
  declarations: [
    FeedComponent,
    UserComponent,
    ViewProfileComponent,
    EditProfileComponent,
    FullComponent,
    UserPostComponent,
    MessageComponent,
    UserMessageComponent,
    SharePostComponent,
    UserCommentsComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    AngularMaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    NgxSkeletonLoaderModule,
    PickerModule,
    FormsModule
  ] 
})
export class ProfileModule { }
