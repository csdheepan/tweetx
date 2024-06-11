import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FeedComponent } from './feed/feed.component';
import { UserComponent } from './user/user.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { EditProfileComponent } from './modal/edit-profile/edit-profile.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FullComponent } from './full/full.component';

@NgModule({
  declarations: [
    FeedComponent,
    UserComponent,
    ViewProfileComponent,
    EditProfileComponent,
    FullComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    AngularMaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    NgxSkeletonLoaderModule
  ] 
})
export class ProfileModule { }
