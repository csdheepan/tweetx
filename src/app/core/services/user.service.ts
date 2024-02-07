import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SignUp } from '../model/signup-model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private afs: AngularFirestore) { }


  getAllUser() {
    return this.afs.collection("/register").valueChanges();
  }

  allUserStatus(loggedId: any, allUser: any) {
    const id = loggedId; // Generate a ID

    // Wrap the array in an object
    const dataObject = { users: allUser };

    // Use set to store the document with the  ID
    this.afs.collection('/register/' + loggedId + "/profile/").doc(id).set(dataObject);
  }

  followReqAction(update: any, loggedId: string) {

    // Wrap the array in an object
    const dataObj = { users: update };
    
    // Use set to store the document with the  ID
    this.afs.collection('/register/' + loggedId + "/profile/").doc(loggedId).update(dataObj);

  }

  getUserStatus(loggedId: string){

   return this.afs.collection('/register/' + loggedId + "/profile/").doc(loggedId).valueChanges();

  }


  updateProfile(loggedId:string,updateObj:SignUp){
    this.afs.collection('/register/').doc(loggedId).update(updateObj);
  }

  getIndividualUser(loggedId:string){
    return this.afs.collection('/register/').doc(loggedId).valueChanges()

  }
}
