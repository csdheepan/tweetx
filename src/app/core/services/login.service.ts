import { Injectable } from '@angular/core';
import { SignUp } from '../model/signup-model';
import { AngularFirestore } from '@angular/fire/compat/firestore';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationServices {

  constructor(private afs : AngularFirestore) { }

  userSignUp(signUp:SignUp){

    const id = this.afs.createId(); // Generate a ID
    signUp.id = id;

    // Use set to store the document with the  ID
    this.afs.collection('/register').doc(id).set(signUp);
  }


  getRegisterUser() {
    return this.afs.collection('/register').valueChanges()
  }

}
