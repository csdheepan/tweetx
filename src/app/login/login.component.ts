import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../core/services/authentication-service';
import { UserService } from '../core/services/user-service';
import { InMemoryCache } from '../shared/service/memory-cache.service';
import { ILogin, ISignUp, Login, SignUp } from '../core/model';
import { Subscription, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { InactivityService } from '../shared/service/inactivity.service';

/**
 * Component responsible for handling user signup/login functionality.
 */

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, AngularMaterialModule, FlexLayoutModule, ReactiveFormsModule,],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginBanner: string = "assets/images/login-banner.png";
  errorMessage !: string;
  loader: boolean = false;
  showLoginButton: boolean = true;
  showSignupButton: boolean = true;
  hide: boolean = true;
  isLoggedIn: boolean = true;
  loginError: boolean = false;
  signupError: boolean = false;
  disableViewButton: boolean = false;
  signupForm: FormGroup = Object.create(null);
  loginForm: FormGroup = Object.create(null);
  signupDetails!: ISignUp;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
    private store: InMemoryCache,
    private userService: UserService,
    private inactivityService: InactivityService
  ) { }


  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms(): void {

    this.signupForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(20), Validators.pattern("^[a-zA-Z ]+$")]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.*[0-9]).{8,}$/)]],
      confirmPassword: [null, [Validators.required]]
    });

    this.loginForm = this.fb.group({
      userName: [null, [Validators.required, Validators.email]],
      passcode: [null, [Validators.required]],
    });
  }

  resetForms(): void {
    this.signupForm.reset();
    this.loginForm.reset();
    this.loginError = false;
    this.signupError = false;
  }

  checkPasswordMatch(): void {
    const password: string = this.signupForm.controls['password']?.value;
    const confirmPassword: string = this.signupForm.controls['confirmPassword']?.value;
    const passwordMatch: boolean = password === confirmPassword;
    this.signupForm.controls['confirmPassword']?.setErrors(passwordMatch ? null : { 'passwordMismatch': true });
  }

  /**
  * Check if the provided email already exists in the database.
  * This method is used to prevent conflicts and ensure uniqueness of email addresses.
  * If the email exists, an error is displayed to the user indicating that the email is already registered.
  * @param email The email to be checked for existence in the database.
  */
  checkValidation(email: string): void {
    if (!email || !this.signupForm.controls['email'].valid) return;
    const userSubscription = this.userService.getAllUsers().pipe(take(1)).subscribe((users: ISignUp[]) => {
      const emailExists: boolean = users.some((user: any) => user.email === email);
      if (emailExists) this.signupForm.controls['email'].setErrors({ 'emailExists': true });
    });
    this.subscriptions.push(userSubscription);
  }

  /**
   * Switch between login and signup views.
   * @param view The view to display ('login' or 'signup').
   */
  handleView(view: string): void {
    this.isLoggedIn = view === 'login';
    this.resetForms();
  }

  /**
  * Attempt to login the user.
  * If the provided email and password match an existing registered user's credentials,
  * The user is authenticated and redirected to their profile page.
  * Otherwise, an error message is displayed indicating invalid login credentials.
  */
  login(): void {
    this.loader = true;
    this.showLoginButton = false;
    this.loginError = false;
    this.disableViewButton = true;
    this.loginForm.disable();
    setTimeout(() => {
      const loginDetails = this.buildLoginPayload();
      const loginSubscription = this.authenticationService.getRegisterUser().subscribe((users: ISignUp[]) => {
        const user = users.find(user => user.email === loginDetails.userName && user.password === loginDetails.passcode);
        if (user) {
          console.log('Login successful');
          this.store.setItem("USER_DETAILS", JSON.stringify(user));
          this.inactivityService.start();
          this.router.navigate(["profile/full/user-profile"]);
          this.loader = false;
          this.showLoginButton = true;
          this.resetForms();
          this.disableViewButton = false;
          this.loginForm.enable();
        } else {
          console.error('Invalid login credentials');
          this.errorMessage = "Invalid Login Credentials"
          this.loginError = true;
          this.loader = false;
          this.showLoginButton = true;
          this.disableViewButton = false;
          this.loginForm.enable();
        }
      }, (error: any) => {
        console.error('Error retrieving user details:', error);
        this.errorMessage = "Login Failed"
        this.loader = false;
        this.showLoginButton = true;
        this.disableViewButton = false;
        this.loginForm.enable();
      });
      this.subscriptions.push(loginSubscription);
    }, 1000);
  }

  /**
   * Create a new user account and store the details in the database.
   * The user's name, email, and password are obtained from the signup form,
   * and upon successful creation of the account, the user is redirected to the login page.
   */
  signup(): void {
    this.loader = true;
    this.showSignupButton = false;
    this.signupError = false;
    this.disableViewButton = true;
    this.signupForm.disable(); //Disable signup form
   setTimeout(() => {
    this.signupDetails = this.buildSignUpPayload();
    const signupSubscription = this.authenticationService.signup(this.signupDetails).subscribe((data: any) => {
      console.log('Signup successful');
      this.loader = false;
      this.showSignupButton = true;
      this.signupError = false;
      this.isLoggedIn = true;
      this.resetForms();
      this.disableViewButton = false;
      this.signupForm.enable(); //Enable signup form
    }, (error: any) => {
      console.error('Error retrieving user details:', error);
      this.errorMessage = "Signup Failed, Please Try again later"
      this.loader = false;
      this.showSignupButton = true;
      this.signupError = true;
      this.isLoggedIn = false;
      this.disableViewButton = false;
      this.signupForm.enable();
    });
    this.subscriptions.push(signupSubscription);
   }, 1000);
  }

  private buildSignUpPayload(): ISignUp {
    return new SignUp({
      name: this.signupForm.controls['name'].value,
      email: this.signupForm.controls['email'].value,
      password: this.signupForm.controls['password'].value,
    });
  }

  private buildLoginPayload(): ILogin{
    return new Login({
      userName: this.loginForm.controls['userName'].value,
      passcode: this.loginForm.controls['passcode'].value
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
