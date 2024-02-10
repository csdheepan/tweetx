import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Login, SignUp } from '../core/model/signup-model';
import { AuthenticationServices } from '../core/services/login.service';
import { Router } from '@angular/router';
import { InMemoryCache } from '../core/services/memory-cache';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {



  banner = "assets/images/login-banner.png";
  hide = true;
  userLoggedIn: boolean = true;
  showAlert: boolean = false;
  signupForm: FormGroup = Object.create(null);

  loginForm: FormGroup = Object.create(null);

  signUpPayload !: SignUp;

  loginPayload !: Login;

  constructor(private fb: FormBuilder, private authenticationServices: AuthenticationServices,
    private router: Router, private store: InMemoryCache , private userService: UserService) {


  }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: [null, [Validators.required,Validators.maxLength(20),Validators.pattern("^[a-zA-Z ]+$")]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      confirmPassword: [null, [Validators.required]]
    });


    this.loginForm = this.fb.group({
      userName: [null, [Validators.required, Validators.email]],
      passcode: [null, [Validators.required]],
    });

    // Add keyup event listener to confirmPassword field
    this.signupForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
    });
  }



  checkPasswordMatch(): void {
    const password = this.signupForm.controls['password']?.value;
    const confirmPassword = this.signupForm.controls['confirmPassword']?.value;

    if (password != null && confirmPassword != null) {
      this.signupForm.controls['confirmPassword']?.setErrors(password === confirmPassword ? null : { 'passwordMismatch': true });
    }
  }

  handleView(value: any) {

    if (value == "login") {
      this.userLoggedIn = true;
    }
    else if (value == "signup") {
      this.userLoggedIn = false;
    }
    this.showAlert = false;
    this.signupForm.reset();
    this.loginForm.reset();
  }

  login() {
    this.authenticationServices.getRegisterUser().subscribe((data: any[]) => {
      console.log(data);

      // Extract login details from the form
      const loginDetails = {
        userName: this.loginForm.controls['userName'].value,
        passcode: this.loginForm.controls['passcode'].value
      };

      // Iterate through the array of registered users
      for (const user of data) {

        this.showAlert = false;

        // Check if the email and password match
        if (user.email === loginDetails.userName && user.password === loginDetails.passcode) {
          console.log('Login successful');
          this.router.navigate(["profile/feed"]);
          this.store.setItem("USER_DETAILS", JSON.stringify(user));
          this.signupForm.reset();
          this.loginForm.reset();
          return;
        }
        else {
          // If no match found,
          console.log('Invalid login credentials');

          this.showAlert = true;
        }
      }


    });
  }



  signup() {

    let profileImg = "assets/images/person.jpg"  //by default we show this particular img

    this.signUpPayload = {
      id: "",
      name: this.signupForm.controls['name'].value,
      email: this.signupForm.controls['email'].value,
      password: this.signupForm.controls['password'].value,
      profileImg : profileImg
    }


    this.authenticationServices.userSignUp(this.signUpPayload);

    this.userLoggedIn = true;

    this.signupForm.reset();
    this.loginForm.reset();
  }


  checkValidation(value:string){


    let email = value ? value : "";


    if(email != "" && this.signupForm.controls['email'].valid){
      this.userService.getAllUser().subscribe((data: any) => {

       // some method is used to test whether at least one element in the array passes. It returns true
        let emailExists = data.some((user: any) => user.email === email);
      
        if (emailExists) {
          // Set an error for the email form control
          this.signupForm.controls['email'].setErrors({ 'emailExists': true });
        }
      });
      
    }
  
  }
}
