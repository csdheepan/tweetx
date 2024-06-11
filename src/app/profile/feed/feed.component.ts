import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { PostServices } from 'src/app/core/services/post-service';
import { UserService } from 'src/app/core/services/user-service';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';

/**
 * FeedComponent is responsible for managing feed-related functionalities such as posting content, retrieving user posts, and displaying user feeds.
 */

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit, OnDestroy {

  form: FormGroup=Object.create(null); // Form group for posting content
  userDetails: any; // Object to store user details
  userPost: any[] = []; // Array to store user posts
  followingStatus: any[] = []; // Array to store following status
  showButton = false; // Flag to control the visibility of the add post button
  loader = true; // Flag to control loading state
  showPost = false; // Flag to control the visibility of the post form
  showNoFeedPost = false; // Flag to control the visibility of no feed post message
  private getUserPostSubscription!: Subscription; // Subscription for user post retrieval
  @ViewChild('scrollUp', { static: true }) scrollUp!: ElementRef;

  constructor(
    private store: InMemoryCache,
    private postServices: PostServices,
    private fb: FormBuilder,
    private userService: UserService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.retrieveUserDetails();
    this.retrieveUserPosts();
  }

  ngOnDestroy(): void {
    if (this.getUserPostSubscription) {
      this.getUserPostSubscription.unsubscribe();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      "content": [null, Validators.required]
    });
  }

  retrieveUserDetails(): void {
    const obj = this.store.getItem("USER_DETAILS");
    this.userDetails = JSON.parse(obj);
  }

  retrieveUserPosts(): void {
    this.getUserPostSubscription = this.userService.getUserStatus(this.userDetails.id).subscribe((data: any) => {
      this.followingStatus = data.users.filter((v: any) => v.status === 1);
      this.handleFollowingStatus();
    });
  }

  handleFollowingStatus(): void {
    if (this.followingStatus.length === 0) {
      this.showButton = true;
      this.showNoFeedPost = true;
    } else {
      this.showButton = false;
      this.showNoFeedPost = false;
    }
    this.retrieveAndMapUserPosts();
  }

  retrieveAndMapUserPosts(): void {
    const userPosts: any[] = [];
     // Iterate over each user the current user is following
    this.followingStatus.forEach((user: any) => {
      // Fetch the posts of the user being iterated over
      this.userService.getStatusPost(user.id).subscribe((postData: any) => {
        userPosts.push(postData);
        // Check if we have fetched posts for all users in the followingStatus list
        if (userPosts.length === this.followingStatus.length) {
           // Flatten the array of arrays (userPosts) into a single array of posts
          this.userPost = userPosts.reduce((acc, val) => acc.concat(val), []);
          this.mapProfileImages();
          this.showButton = true;
          if (this.userPost.length === 0) {
            this.showNoFeedPost = true;
          }
        }
      });
    });
    this.setLoaderFalse();
  }

  mapProfileImages(): void {
    this.userPost.forEach((post: any) => {
      const follower = this.followingStatus.find((follower: any) => follower.id === post.id);
      post.profileImg = follower ? follower.profileImg : "assets/images/person.jpg";
    });
  }

  setLoaderFalse(): void {
    setTimeout(() => {
      this.loader = false;
    }, 1500);
  }

  handlePostView(value: string): void {
    this.showPost = value === 'post';
    if (this.showPost) {
      this.scrollUp.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' }); // Scroll to the top of the page from the starting point
   }
  }

  post(): void {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    const postObj = {
      content: this.form.controls['content'].value,
      time: formattedDate,
      name: this.userDetails.name
    };
    this.postServices.postContent(postObj, this.userDetails);
    this._snackBar.open('Post Added Sucessfully' + ' ', 'Close', {
      duration: 5000, // Duration in milliseconds
    });
    this.showPost = false;
    this.form.reset();
  }
}
