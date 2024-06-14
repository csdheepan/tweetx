import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedRoutingModule } from './shared-routing.module';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { AngularMaterialModule } from '../angular-material/angular-material.module';


@NgModule({
  declarations: [
    PageNotFoundComponent,
    ErrorDialogComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    AngularMaterialModule
  ]
})
export class SharedModule { }
