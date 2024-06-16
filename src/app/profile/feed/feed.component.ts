import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { SignUp, UserPost, Users } from 'src/app/core/model/user-model';
import { PostServices } from 'src/app/core/services/post-service';
import { UserService } from 'src/app/core/services/user-service';
import { DateUtilsService } from 'src/app/shared/service/date-utils.service';
import { ErrorHandlerService } from 'src/app/shared/service/error-handler.service';
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

  form: FormGroup = Object.create(null);
  likedProduct: boolean[] = [];
  showEmojiPicker: boolean = false;
  showButton: boolean = false;
  loader: boolean = true;
  showPost: boolean = false;
  showNoFeedPost: boolean = false;
  userDetails!: SignUp;
  userPost: UserPost[] = [];
  followingStatus: Users[] = [];
  postDetails!: UserPost;
  private getUserPostSubscription!: Subscription;
  @ViewChild('scrollUp', { static: true }) scrollUp!: ElementRef;

  constructor(
    private store: InMemoryCache,
    private postServices: PostServices,
    private fb: FormBuilder,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private dateUtilsService: DateUtilsService,
    private errorHandlerService: ErrorHandlerService
  ) { }


  ngOnInit(): void {
    this.initForm();
    this.retrieveUserDetails();
    this.filterFollowingStatus();
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

  /**
   * Retrieves all users and filters following status.
   * We will show posts of users followed by the current user.
   */
  filterFollowingStatus(): void {
    this.getUserPostSubscription = this.userService.getUserStatus(this.userDetails.id).subscribe((data: any) => {
      this.followingStatus = data.users.filter((v: any) => v.status === 1);
      this.handleFollowingStatus();
    }, (err: any) => {
      this.errorHandlerService.handleErrors(err, "While retrieving user status");
    });
  }

  /**
 * Handles the following status of users to determine whether to display the add post button or no feed post message.
 */
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

  /**
 * Retrieves and maps user posts for display.
 * It iterates over each user the current user is following, retrieves their posts, and maps profile images.
 */
  retrieveAndMapUserPosts(): void {
    const userPosts: any[] = [];
    // Iterate over each user the current user is following
    this.followingStatus.forEach((user: any) => {
      // Fetch the posts of the user being iterated over
      this.userService.getUserPost(user.id).subscribe((postData: UserPost[]) => {
        userPosts.push(postData);
        // Check if we have fetched posts for all users in the followingStatus list
        if (userPosts.length === this.followingStatus.length) {
          // Flatten the array of arrays (userPosts) into a single array of posts
          this.userPost = userPosts.reduce((acc, val) => acc.concat(val), []);
          // Initialize likedProduct array with false values for each post
          this.likedProduct = new Array(this.userPost.length).fill(false);
          this.mapProfileImages();
          this.showButton = true;
          if (this.userPost.length === 0) {
            this.showNoFeedPost = true;
          }
        }
      }, (err: any) => {
        this.errorHandlerService.handleErrors(err, "While retrieving user post");
      });
    });
    this.setLoaderFalse();
  }

  /**
  * Maps profile images to user posts.
  */
  mapProfileImages(): void {
    this.userPost.forEach((post: any) => {
      const follower = this.followingStatus.find((follower: Users) => follower.id === post.id);
      post.profileImg = follower ? follower.profileImg : "assets/images/person.jpg";
    });
  }

  /**
 * Sets the loader flag to false after a delay.
 */
  setLoaderFalse(): void {
    setTimeout(() => {
      this.loader = false;
    }, 1500);
  }

  /**
  * Function to handle like/unlike
  */
  handleLike(index: number) {
    this.likedProduct[index] = !this.likedProduct[index]; // Toggle the liked state of the post at the given index
    /**
     *Api Intergeration - WIP (work-in progress)
    */
  }

  /**
 * Toggles the visibility of the post form and scrolls to the top if the form is shown.
 * @param value The value indicating whether to show or hide the post form.
 */
  handlePostView(value: string): void {
    this.showPost = value === 'post';
    if (this.showPost) {
      this.scrollUp.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' }); // Scroll to the top of the page from the starting point
    }
  }

  /**
   * Posts content to the feed.
   */
  post(): void {
    const formattedDateandTime = this.dateUtilsService.getCurrentFormattedDateTime();
    this.postDetails = {
      id: "",
      content: this.form.controls['content'].value,
      time: formattedDateandTime.formattedTime,
      name: this.userDetails.name,
      date: formattedDateandTime.formattedDate,
      postId: ""
    };
    this.postServices.postContent(this.postDetails, this.userDetails).subscribe((data: any) => {
      this._snackBar.open('Post Added Sucessfully' + ' ', 'Close', {
        duration: 2000
      });
    }, (error: any) => {
      this.errorHandlerService.handleErrors(error, "While adding user post");
    });
    this.showPost = false;
    this.form.reset();
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = this.dateUtilsService.toggleEmojiPicker(this.showEmojiPicker);
  }

  insertEmoji(event: any): void {
    this.dateUtilsService.insertEmoji(event, this.form.controls['content']);
    this.showEmojiPicker = false;
  }

  ngOnDestroy(): void {
    if (this.getUserPostSubscription) {
      this.getUserPostSubscription.unsubscribe();
    }
  }
}
