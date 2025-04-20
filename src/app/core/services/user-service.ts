import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { ISignUp, IUserPost, IUsers, SignUp } from '../model';
import { serializeForFirestore } from 'src/app/shared/service/firestore-utils';

/**
 * UserService provides functionalities related to user management, such as retrieving user data and updating user profiles.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private firestore: AngularFirestore
  ) { }

  /**
   * Retrieves all users registered in the application.
   * @returns An observable that emits an array of registered users.
   */
  getAllUsers(): Observable<ISignUp[]> {
    return this.firestore.collection<ISignUp>('/register').valueChanges();
  }

  /**
   * Stores the following status of all users.
   * @param loggedId The ID of the logged-in user.
   * @param allUser An array containing the user data.
   */
  setUserStatus(loggedId: string, allUser:IUsers[]) {
    const dataObject = { users: allUser };
    const serializeFireStoreObj = serializeForFirestore(dataObject);
    return from(this.firestore.collection('/register').doc(loggedId).collection('profile').doc(loggedId).set(serializeFireStoreObj));
  }

  /**
   * Updates the following status of a user.
   * @param update An object containing the updated user data.
   * @param loggedId The ID of the logged-in user.
   * @returns An observable that completes when the update is finished.
   */
  followReqAction(update:IUsers[], loggedId: string): Observable<void> {
    const dataObj = { users: update };
    const serializeFireStoreObj = serializeForFirestore(dataObj);
    return from(this.firestore.collection('/register').doc(loggedId).collection('profile').doc(loggedId).update(serializeFireStoreObj));
  }

  /**
   * Retrieves the user status for a specific user.
   * @param loggedId The ID of the logged-in user.
   * @returns An observable that emits the user status data.
   */
  getUserStatus(loggedId: string): Observable<any> {
    return this.firestore.collection('/register').doc(loggedId).collection('profile').doc(loggedId).valueChanges();
  }

  /**
   * Updates the user profile.
   * @param loggedId The ID of the logged-in user.
   * @param updateObj An object containing the updated user profile data.
   * @returns An observable that completes when the update is finished.
   */
  updateProfile(loggedId: string, updateObj: SignUp): Observable<void> {
    return from(this.firestore.collection('/register').doc(loggedId).update(updateObj));
  }

  /**
   * Retrieves the data of an individual user.
   * @param loggedId The ID of the user.
   * @returns An observable that emits the user data.
   */
  getIndividualUser(loggedId: string): Observable<any> {
    return this.firestore.collection<any>('/register').doc(loggedId).valueChanges();
  }

  /**
   * Retrieves the post status for a specific user.
   * @param userId The ID of the user.
   * @returns An observable that emits the post status data.
   */
  getUserPost(userId: string): Observable<IUserPost[]> {
    return this.firestore.collection<IUserPost>('/register/' + userId + '/feed post').valueChanges();
  }
}
