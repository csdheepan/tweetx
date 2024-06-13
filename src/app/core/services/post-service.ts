import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SignUp, UserPost } from '../model/user-model';
import { Observable } from 'rxjs';

/**
 * PostService provides functionalities related to managing user posts, such as posting new content and retrieving posts.
 */

@Injectable({
  providedIn: 'root'
})

export class PostServices {

  // Constructor
  constructor(private afs: AngularFirestore) { }

   /**
   * Posts new content created by a user.
   * @param userId The ID of the user posting the content.
   * @param content The content to be posted.
   */
  postContent(postObj: any, userDetails: SignUp) {
    const generateId = this.afs.createId(); // Generate a ID
    //map id in postObj
    postObj.id = userDetails.id;
    const id = userDetails.id; // mapping  ID
    // Use set to store the document with the  ID
    this.afs.collection('/register/' + id + '/feed post').doc(generateId).set(postObj);
  }

    /**
   * Retrieves posts created by a specific user.
   * @param userId The ID of the user whose posts are to be retrieved.
   * @returns An observable that emits an array of user posts.
   */
  getUserPost(userDetails: SignUp):Observable<UserPost[]> {
    const id = userDetails.id; // mapping  ID
    return this.afs.collection<UserPost>('/register/' + id + '/feed post').valueChanges();
  }
}
