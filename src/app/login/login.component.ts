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

     // Add keyup event listener to confirmPassword field
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
   * Check if email already exists in the database.
   * @param email The email to validate.
   */
  checkValidation(email: string): void {
    if (!email || !this.signupForm.controls['email'].valid) return;
    this.userService.getAllUsers().subscribe((users: any[]) => {
      const emailExists = users.some((user: any) => user.email === email);
      if (emailExists) this.signupForm.controls['email'].setErrors({ 'emailExists': true });
    });
  }

  /**
   * Attempt login using entered credentials.
   */
  login(): void {
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
      } else {
        console.log('Invalid login credentials');
        this.loginError = true;
      }
    }, (error:any) => {
      console.error('Error retrieving user details:', error);
    });
  }
  
  /**
   * Create a new user account.
   */
  signup(): void {
    const profileImg = "assets/images/person.jpg";
    this.signupDetails = {
      id: "",
      name: this.signupForm.controls['name'].value,
      email: this.signupForm.controls['email'].value,
      password: this.signupForm.controls['password'].value,
      profileImg: profileImg
    };
    this.authenticationService.signup(this.signupDetails);
    this.resetForms();
    this.isLoggedIn = true;
  }

  ngOnDestroy(): void {
      this.loginSubscription.unsubscribe();
  }
}
