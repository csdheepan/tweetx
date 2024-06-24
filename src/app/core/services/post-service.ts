import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SignUp, UserPost } from '../model/user-model';
import { Observable, from } from 'rxjs';

/**
 * PostService provides functionalities related to managing user posts, such as posting new content and retrieving posts.
 */
@Injectable({
  providedIn: 'root'
})
export class PostServices {

  constructor(private firestore: AngularFirestore) { }

  /**
   * Posts new content created by a user.
   * @param postObj The content to be posted.
   * @param userDetails The details of the user posting the content.
   * @returns An observable that completes when the post is created.
   */
  postContent(postObj:UserPost, userDetails: SignUp): Observable<void> {
    const generateId = this.firestore.createId(); // Generate an ID
    postObj.id = userDetails.id;
    postObj.postId = generateId;

    return from(this.firestore.collection(`/register/${userDetails.id}/feed post`).doc(generateId).set(postObj));
  }

  /**
   * Retrieves posts created by a specific user.
   * @param userDetails The details of the user whose posts are to be retrieved.
   * @returns An observable that emits an array of user posts.
   */
  getUserPost(userDetails: SignUp): Observable<UserPost[]> {
    return this.firestore.collection<UserPost>(`/register/${userDetails.id}/feed post`).valueChanges();
  }

  /**
   * Updates content edited by a user in Firestore.
   * @param postObj The updated content object.
   * @param userDetails The details of the user editing the content.
   * @returns An observable that completes when the update is finished.
   */
  editContent(postObj:UserPost, userDetails: SignUp): Observable<void> {
    postObj.id = userDetails.id;

    return from(this.firestore.collection('register').doc(userDetails.id).collection('feed post').doc(postObj.postId).set(postObj, { merge: true }));
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
}
