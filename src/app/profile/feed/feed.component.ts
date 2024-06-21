import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  private subscriptions: Subscription[] = [];
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
    const userDetailsJson: string = this.store.getItem("USER_DETAILS");
    this.userDetails = JSON.parse(userDetailsJson);
  }

  /**
   * Retrieves all users and filters following status.
   * We will show posts of users followed by the current user.
   */
  filterFollowingStatus(): void {
    const userPostSubscription = this.userService.getUserStatus(this.userDetails.id).subscribe((data:any) => {
      this.followingStatus = data.users.filter((v: any) => v.status === 1);
      this.handleFollowingStatus();
    }, (err: any) => {
      this.errorHandlerService.handleErrors(err, "While retrieving user status");
    });
    this.subscriptions.push(userPostSubscription);
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
    this.followingStatus.forEach((user: Users) => {
      this.fetchUserPosts(user, userPosts);
    });
    this.setLoaderFalse();
  }

  /**
   * Fetches posts of a single user and adds them to the userPosts array.
   * It subscribes to the getUserPost method of the UserService to retrieve the posts.
   * If all posts are fetched, it processes the posts for display.
   * 
   * @param user - The user whose posts are to be fetched.
   * @param userPosts - The array to store the fetched posts.
   */
  private fetchUserPosts(user: Users, userPosts: any[]): void {
    const userPostSubscription = this.userService.getUserPost(user.id).subscribe(
      (postData: UserPost[]) => {
        userPosts.push(postData);
        if (userPosts.length === this.followingStatus.length) {
          this.processUserPosts(userPosts);
        }
      },
      (err: any) => {
        this.errorHandlerService.handleErrors(err, "While retrieving user posts");
      }
    );
    this.subscriptions.push(userPostSubscription);
  }

  /**
   * Processes the user posts for display.
   * It flattens the array of arrays into a single array of posts, initializes the likedProduct array,
   * maps profile images to the posts, and updates the visibility of the post-related elements.
   * 
   * @param userPosts - The array of arrays containing user posts.
   */
  private processUserPosts(userPosts: UserPost[]): void {
    this.userPost = userPosts.flat();
    this.likedProduct = new Array(this.userPost.length).fill(false);
    this.mapProfileImages();
    this.showButton = true;
    this.showNoFeedPost = this.userPost.length === 0;
  }

  /**
   * Maps profile images to user posts.
   * It iterates over each post and assigns the profile image of the corresponding user from the followingStatus array.
   */
  mapProfileImages(): void {
    this.userPost.forEach((post: any) => {
      const follower = this.followingStatus.find((follower: Users) => follower.id === post.id);
      post.profileImg = follower ? follower.profileImg : "assets/images/person.jpg";
    });
  }

  /**
   * Function to handle like/unlike.
   * @param index - The index of the post to be liked or unliked.
   */
  handleLike(index: number): void {
    this.likedProduct[index] = !this.likedProduct[index]; // Toggle the liked state of the post at the given index
    // Api Integration - WIP (work-in progress)
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
    this.form.reset();
  }

 // Set loader flag to false after a delay of 1.5 seconds (1500 milliseconds)
  setLoaderFalse(): void {
    setTimeout(() => {
      this.loader = false;
    }, 1500);
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = this.dateUtilsService.toggleEmojiPicker(this.showEmojiPicker);
  }

  insertEmoji(event: any): void {
    this.dateUtilsService.insertEmoji(event, this.form.controls['content']);
    this.showEmojiPicker = false;
  }

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

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
