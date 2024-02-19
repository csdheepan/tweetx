import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Login, SignUp } from '../core/model/signup-model';
import { AuthenticationServices } from '../core/services/login.service';
import { Router } from '@angular/router';
import { UserService } from '../core/services/user.service';
import { InMemoryCache } from '../shared/service/memory-cache.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})


export class LoginComponent implements OnInit {

  // Variable declaration
  banner = "assets/images/login-banner.png";
  hide = true;
  userLoggedIn: boolean = true;
  showAlert: boolean = false;
  signupForm: FormGroup = Object.create(null);
  loginForm: FormGroup = Object.create(null);
  signUpPayload !: SignUp;
  loginPayload !: Login;

  //Constructor : Utilize Dependency Injection here.
  constructor(private fb: FormBuilder, private authenticationServices: AuthenticationServices,
    private router: Router, private store: InMemoryCache, private userService: UserService) { }


  //Onload function
  ngOnInit(): void {

    // Signup Form Validation
    this.signupForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(20), Validators.pattern("^[a-zA-Z ]+$")]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.*[0-9]).{8,}$/)]],
      confirmPassword: [null, [Validators.required]]
    });

    // Login Form Validation
    this.loginForm = this.fb.group({
      userName: [null, [Validators.required, Validators.email]],
      passcode: [null, [Validators.required]],
    });

    // Add keyup event listener to confirmPassword field
    this.signupForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
    });
  }


  //method to check Password and confirm password are same.
  checkPasswordMatch(): void {

    //form control value for  password and confirmPassword.
    const password = this.signupForm.controls['password']?.value;
    const confirmPassword = this.signupForm.controls['confirmPassword']?.value;

    if (password != null && confirmPassword != null) {

      // if password === Confirm password return null otherwise we set error passwordMismatch
      this.signupForm.controls['confirmPassword']?.setErrors(password === confirmPassword ? null : { 'passwordMismatch': true });
    }

  }

  //method to handle view for login and signup field.
  handleView(value: any) {

    //show login form field
    if (value == "login") {
      this.userLoggedIn = true;
    }

    //show signup form field
    else if (value == "signup") {
      this.userLoggedIn = false;
    }

    //reset the form
    this.signupForm.reset();
    this.loginForm.reset();
    this.showAlert = false;
  }


  //method for to restrict user to resitered using same email id.
  checkValidation(value: string) {
    let email = value ? value : "";

    if (email != "" && this.signupForm.controls['email'].valid) {

      //get all register details.
      this.userService.getAllUser().subscribe((data: any) => {

        // check email id already exist or not using some method (Js method).
        let emailExists = data.some((user: any) => user.email === email);

        if (emailExists) {
          // Set an error for the email form control if email already exist.
          this.signupForm.controls['email'].setErrors({ 'emailExists': true });
        }
      });
    }
  }

  //method for login
  login() {

    //retrieve all register user details.
    this.authenticationServices.getRegisterUser().subscribe((data: any[]) => {

      // Extract login details from the form
      const loginDetails = {
        userName: this.loginForm.controls['userName'].value,
        passcode: this.loginForm.controls['passcode'].value
      };

      // Iterate through the array of registered users
      for (const user of data) {

        this.showAlert = false;

        // Check if the email and password match ie user all already logged in.
        if (user.email === loginDetails.userName && user.password === loginDetails.passcode) {
          console.log('Login successful');

          //store individual user details
          this.store.setItem("USER_DETAILS", JSON.stringify(user));

          //reset form
          this.signupForm.reset();
          this.loginForm.reset();

          //navigate to view profile
          this.router.navigate(["profile/feed"]);
          return;
        }

        // If no match found ie login details are anot valid / not registered.
        else {
          console.log('Invalid login credentials');
          this.showAlert = true;
        }
      }
    });
  }

  //method for signup
  signup() {

    let profileImg = "assets/images/person.jpg"  //by default we store this particular img.

    //payload for to store details in database.
    this.signUpPayload = {
      id: "",
      name: this.signupForm.controls['name'].value,
      email: this.signupForm.controls['email'].value,
      password: this.signupForm.controls['password'].value,
      profileImg: profileImg
    }


    //service call - to store the register details in database
    this.authenticationServices.userSignUp(this.signUpPayload);

    //reset form
    this.signupForm.reset();
    this.loginForm.reset();
    this.userLoggedIn = true;

  }
}
