import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SignUp, UserPost } from '../model/user-model';
import { Observable } from 'rxjs';

/**
 * UserService provides functionalities related to user management, such as retrieving user data and updating user profiles.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private afs: AngularFirestore) { }

  /**
   * Retrieves all users registered in the application.
   * @returns An observable that emits an array of registered users.
   */
  getAllUsers():Observable<SignUp[]> {
    return this.afs.collection<SignUp>("/register").valueChanges();
  }

  /**
   * Stores the following status of all users.
   * @param loggedId The ID of the logged-in user.
   * @param allUser An array containing the user data.
   */
  allUserStatus(loggedId: any, allUser: any) {
    const id = loggedId; // Generate a ID
    // Wrap the array in an object
    const dataObject = { users: allUser };
    // Use set to store the document with the ID
    this.afs.collection('/register/' + loggedId + "/profile/").doc(id).set(dataObject);
  }

  /**
   * Updates the following status of a user.
   * @param update An object containing the updated user data.
   * @param loggedId The ID of the logged-in user.
   */
  followReqAction(update: any, loggedId: string) {
    // Wrap the array in an object
    const dataObj = { users: update };
    // Use set to store the document with the ID
    this.afs.collection('/register/' + loggedId + "/profile/").doc(loggedId).update(dataObj);
  }

  /**
   * Retrieves the user status for a specific user.
   * @param loggedId The ID of the logged-in user.
   * @returns An observable that emits the user status data.
   */
  getUserStatus(loggedId: string):Observable<any>{
    return this.afs.collection<any>('/register/' + loggedId + "/profile/").doc(loggedId).valueChanges();
  }

  /**
   * Updates the user profile.
   * @param loggedId The ID of the logged-in user.
   * @param updateObj An object containing the updated user profile data.
   */
  updateProfile(loggedId:string,updateObj:SignUp){
    this.afs.collection('/register/').doc(loggedId).update(updateObj);
  }

  /**
   * Retrieves the data of an individual user.
   * @param loggedId The ID of the user.
   * @returns An observable that emits the user data.
   */
  getIndividualUser(loggedId:string):Observable<any>{
    return this.afs.collection<any>('/register/').doc(loggedId).valueChanges();
  }

  /**
   * Retrieves the post status for a specific user.
   * @param userDetails The ID of the user.
   * @returns An observable that emits the post status data.
   */
  getStatusPost(userDetails:string):Observable<UserPost[]>{
    return this.afs.collection<UserPost>('/register/' + userDetails + '/feed post').valueChanges();
  }
}
