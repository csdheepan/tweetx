import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { IUserPost, SignUp, UserPost } from '../model';
import { serializeForFirestore } from 'src/app/shared/service/firestore-utils';

/**
 * PostService provides functionalities related to managing user posts, such as posting new content and retrieving posts.
 */
@Injectable({
  providedIn: 'root'
})
export class PostServices {

  constructor(
    private firestore: AngularFirestore
  ) { }

  /**
   * Posts new content created by a user.
   * @param postObj The content to be posted.
   * @param userDetails The details of the user posting the content.
   * @returns An observable that completes when the post is created.
   */
  postContent(postObj: UserPost, userDetails: SignUp): Observable<void> {

    const generateId = this.firestore.createId(); // Generate an ID
    postObj.id = userDetails.id;
    postObj.postId = generateId;
    const serializeFireStoreObj = serializeForFirestore(postObj);

    return from(this.firestore.collection(`/register/${userDetails.id}/feed post`).doc(generateId).set(serializeFireStoreObj));
  }

  /**
   * Retrieves posts created by a specific user.
   * @param userDetails The details of the user whose posts are to be retrieved.
   * @returns An observable that emits an array of user posts.
   */
  getUserPost(userDetails: SignUp): Observable<IUserPost[]> {
    return this.firestore.collection<IUserPost>(`/register/${userDetails.id}/feed post`).valueChanges();
  }

  /**
   * Updates content edited by a user in Firestore.
   * @param postObj The updated content object.
   * @param userDetails The details of the user editing the content.
   * @returns An observable that completes when the update is finished.
   */
  editContent(postObj: UserPost, userDetails: SignUp): Observable<void> {

    postObj.id = userDetails.id;
    const serializeFireStoreObj = serializeForFirestore(postObj);

    return from(this.firestore.collection('register').doc(userDetails.id).collection('feed post').doc(postObj.postId).set(serializeFireStoreObj, { merge: true }));
  }

  /**
   * Deletes content from Firestore.
   * @param postId The ID of the content to delete.
   * @param userDetails The details of the user deleting the content.
   * @returns An observable that completes when the delete operation is finished.
   */
  deleteContent(postId: string, userDetails: SignUp): Observable<void> {
    return from(this.firestore.collection('register').doc(userDetails.id).collection('feed post').doc(postId).delete());
  }

  // Method to save liked posts for a user
  saveLikeStatus(likedPostArray: any, userId: string): Observable<any> {
    const likedPostObj = { post: likedPostArray };
    const serializeFireStoreObj = serializeForFirestore(likedPostObj);
    return from(this.firestore.collection('register').doc(userId).collection('liked post').doc(userId).set(serializeFireStoreObj, { merge: true }));
  }

  // Method to retrieve liked posts for a user
  getLikedPosts(userId: string): Observable<any> {
    return from(this.firestore.collection('register').doc(userId).collection('liked post').valueChanges());
  }

  /**
  * Updates content edited by a user in Firestore.
  * @param postObj The updated content object.
  * @param id update the editing content based on Id.
  * @returns An observable that completes when the update is finished.
  */
  updateComment(postObj: UserPost, id: string): Observable<void> {

    const serializeFireStoreObj = serializeForFirestore(postObj);

    return from(this.firestore.collection('register').doc(id).collection('feed post').doc(postObj.postId).set(serializeFireStoreObj, { merge: true }));
  }
}
