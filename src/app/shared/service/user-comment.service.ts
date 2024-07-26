import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserPost } from 'src/app/core/model/user-model';

@Injectable({
  providedIn: 'root'
})

export class UserCommentService {

  private postDetailsSubject = new BehaviorSubject<UserPost | null>(null);

  constructor() { }

  /**
   * Stores the details of a user's post.
   * @param userPost - The user post to be stored.
   */
  setPostDetails(userPost: UserPost): void {
    this.postDetailsSubject.next(userPost);
  }

  /**
   * Retrieves the details of a user's post as an observable.
   * @returns An observable of the user post details.
   */
  getPostDetails(): Observable<UserPost | null> {
    return this.postDetailsSubject.asObservable();
  }
}
