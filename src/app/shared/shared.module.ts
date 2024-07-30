import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedRoutingModule } from './shared-routing.module';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { LogoutDialogComponent } from './components/logout-dialog/logout-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UserInactivityComponent } from './components/user-inactivity/user-inactivity.component';


@NgModule({
  declarations: [
    PageNotFoundComponent,
    ErrorDialogComponent,
    LogoutDialogComponent,
    UserInactivityComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    AngularMaterialModule,
    FlexLayoutModule
  ]
})
export class SharedModule { }
