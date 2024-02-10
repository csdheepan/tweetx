import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LoginComponent } from './login/login.component';
import { ProfileModule } from './profile/profile.module';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environment/environment';
import { AngularFireModule} from '@angular/fire/compat'
import { CORE_SERVICES_PROVIDERS } from './core/core-services';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FlexLayoutModule,
    ProfileModule,
    ReactiveFormsModule,
    SharedModule,
    AngularFireModule.initializeApp(environment.firebase)
  ],
  providers: [CORE_SERVICES_PROVIDERS],
  bootstrap: [AppComponent]
})
export class AppModule { }
