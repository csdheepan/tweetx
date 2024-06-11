import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../core/services/authentication-service';
import { UserService } from '../core/services/user-service';
import { InMemoryCache } from '../shared/service/memory-cache.service';
import { Login, SignUp } from '../core/model/signup-model';
import { Subscription } from 'rxjs';

/**
 * Component responsible for handling user signup/login functionality.
 */

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  banner = "assets/images/login-banner.png";
  loader: boolean = false;
  showButton: boolean = true;
  hide: boolean = true;
  isLoggedIn: boolean = true; // Indicates whether a user is currently authenticated.
  loginError: boolean = false; // Show alert if login attempt was unsuccessful.
  signupForm!: FormGroup;
  loginForm!: FormGroup;
  signupDetails!: SignUp;
  private loginSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
    private store: InMemoryCache,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initializeForms();

     // Subscribe to changes in the 'confirmPassword' form control's value to dynamically check password match.
     this.signupForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
    });
  }

  /**
   * Initialize signup and login forms.
   */
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

  /**
   * Switch between login and signup views.
   * @param view The view to display ('login' or 'signup').
   */
  handleView(view: string): void {
    this.isLoggedIn = view === 'login';
    this.resetForms();
  }

  /**
   * Reset signup and login forms.
   */
  resetForms(): void {
    this.signupForm.reset();
    this.loginForm.reset();
    this.loginError = false;
  }

  /**
   * Check if password matches confirm password field in signup form.
   */
  checkPasswordMatch(): void {
    const password = this.signupForm.controls['password']?.value;
    const confirmPassword = this.signupForm.controls['confirmPassword']?.value;
    const passwordMatch = password === confirmPassword;
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
    this.userService.getAllUsers().subscribe((users: any[]) => {
      const emailExists = users.some((user: any) => user.email === email);
      if (emailExists) this.signupForm.controls['email'].setErrors({ 'emailExists': true });
    });
  }

 /**
 * Attempt to log in the user.
 * If the provided email and password match an existing registered user's credentials,
 * the user is authenticated and redirected to their profile page.
 * Otherwise, an error message is displayed indicating invalid login credentials.
 */
  login(): void {
    this.loader = true;
    this.showButton = false;
   setTimeout(() => {
    const loginDetails: Login = {
      userName: this.loginForm.controls['userName'].value,
      passcode: this.loginForm.controls['passcode'].value
    };
  
   this.loginSubscription = this.authenticationService.getRegisterUser().subscribe((users: any[]) => {
      const user = users.find(u => u.email === loginDetails.userName && u.password === loginDetails.passcode);
  
      if (user) {
        console.log('Login successful');
        this.store.setItem("USER_DETAILS", JSON.stringify(user));
        this.resetForms();
        this.router.navigate(["profile/full/user-profile"]);
        this.loader = false;
        this.showButton = true;
      } else {
        console.log('Invalid login credentials');
        this.loginError = true;
        this.loader = false;
        this.showButton = true;
      }
    }, (error:any) => {
      console.error('Error retrieving user details:', error);
      this.loader = false;
      this.showButton = true;
    });
   }, 1000);
  }
  
/**
 * Create a new user account and store the details in the database.
 * The user's name, email, and password are obtained from the signup form,
 * and upon successful creation of the account, the user is redirected to the login page.
 */
  signup(): void {
    this.loader = true;
    this.showButton = false;
  setTimeout(() => {
    const profileImg = "assets/images/person.jpg";
    this.signupDetails = {
      id: "",
      name: this.signupForm.controls['name'].value,
      email: this.signupForm.controls['email'].value,
      password: this.signupForm.controls['password'].value,
      profileImg: profileImg
    };
    this.authenticationService.signup(this.signupDetails);
    this.loader = false;
    this.showButton = true;
    this.resetForms();
    this.isLoggedIn = true;
  }, 1500);
  
  }

  ngOnDestroy(): void {
      this.loginSubscription.unsubscribe();
  }
}
