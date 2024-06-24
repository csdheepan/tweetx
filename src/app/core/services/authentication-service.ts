import { Injectable } from '@angular/core';
import { SignUp } from '../model/user-model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';

/**
 * AuthenticationServices provides functionalities related to user authentication, such as user registration.
 */

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

  constructor(private firestore: AngularFirestore) { }

  /**
   * Registers a new user.
   * @param signUp The SignUp object containing user registration details.
   */
  signup(signUp: SignUp) {
    const id = this.firestore.createId(); // Generate a ID
    signUp.id = id;
    // Use set to store the data with the  document ID
    return from(this.firestore.collection('/register').doc(id).set(signUp));
  }


  /**
 * Retrieves all registered users.
 * @returns An observable that emits an array of registered users.
 */
  getRegisterUser():Observable<SignUp[]> {
    return this.firestore.collection<SignUp>('/register').valueChanges()
  }

}
