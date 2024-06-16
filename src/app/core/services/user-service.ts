import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SignUp, UserPost, Users } from '../model/user-model';
import { Observable, from } from 'rxjs';

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
  getAllUsers(): Observable<SignUp[]> {
    return this.afs.collection<SignUp>('/register').valueChanges();
  }

  /**
   * Stores the following status of all users.
   * @param loggedId The ID of the logged-in user.
   * @param allUser An array containing the user data.
   */
  setUserStatus(loggedId: string, allUser:Users[]): void {
    const dataObject = { users: allUser };
    this.afs.collection('/register').doc(loggedId).collection('profile').doc(loggedId).set(dataObject);
  }

  /**
   * Updates the following status of a user.
   * @param update An object containing the updated user data.
   * @param loggedId The ID of the logged-in user.
   * @returns An observable that completes when the update is finished.
   */
  followReqAction(update:Users[], loggedId: string): Observable<void> {
    const dataObj = { users: update };
    return from(this.afs.collection('/register').doc(loggedId).collection('profile').doc(loggedId).update(dataObj));
  }

  /**
   * Retrieves the user status for a specific user.
   * @param loggedId The ID of the logged-in user.
   * @returns An observable that emits the user status data.
   */
  getUserStatus(loggedId: string): Observable<any> {
    return this.afs.collection('/register').doc(loggedId).collection('profile').doc(loggedId).valueChanges();
  }

  /**
   * Updates the user profile.
   * @param loggedId The ID of the logged-in user.
   * @param updateObj An object containing the updated user profile data.
   * @returns An observable that completes when the update is finished.
   */
  updateProfile(loggedId: string, updateObj: SignUp): Observable<void> {
    return from(this.afs.collection('/register').doc(loggedId).update(updateObj));
  }

  /**
   * Retrieves the data of an individual user.
   * @param loggedId The ID of the user.
   * @returns An observable that emits the user data.
   */
  getIndividualUser(loggedId: string): Observable<any> {
    return this.afs.collection<any>('/register').doc(loggedId).valueChanges();
  }

  /**
   * Retrieves the post status for a specific user.
   * @param userId The ID of the user.
   * @returns An observable that emits the post status data.
   */
  getUserPost(userId: string): Observable<UserPost[]> {
    return this.afs.collection<UserPost>('/register/' + userId + '/feed post').valueChanges();
  }
}
