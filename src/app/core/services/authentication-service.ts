import { Injectable } from '@angular/core';
import { SignUp } from '../model/signup-model';
import { AngularFirestore } from '@angular/fire/compat/firestore';

/**
 * AuthenticationServices provides functionalities related to user authentication, such as user registration.
 */

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

  constructor(private afs: AngularFirestore) { }

  /**
   * Registers a new user.
   * @param signUp The SignUp object containing user registration details.
   */
  signup(signUp: SignUp) {
    const id = this.afs.createId(); // Generate a ID
    signUp.id = id;
    // Use set to store the data with the  document ID
    this.afs.collection('/register').doc(id).set(signUp);
  }


  /**
 * Retrieves all registered users.
 * @returns An observable that emits an array of registered users.
 */
  getRegisterUser() {
    return this.afs.collection('/register').valueChanges()
  }

}
