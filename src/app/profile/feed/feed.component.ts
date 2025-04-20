import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { PostServices } from 'src/app/core/services/post-service';
import { UserService } from 'src/app/core/services/user-service';
import { DateUtilsService } from 'src/app/shared/service/date-utils.service';
import { ErrorHandlerService } from 'src/app/shared/service/error-handler.service';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';
import { UserCommentService } from 'src/app/core/services/user-comment.service';
import { SharePostComponent } from '../modal/share-post/share-post.component';
import { ILikedPost, ISignUp, IUserPost, IUsers, UserPost } from 'src/app/core/model';

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
  userDetails!: ISignUp;
  userPost: IUserPost[] = [];
  followingStatus: IUsers[] = [];
  postDetails!: IUserPost;
  likedPostArray: ILikedPost[]=[];
  private subscriptions: Subscription[] = [];
  @ViewChild('scrollUp', { static: true }) scrollUp!: ElementRef;

  constructor(
    private store: InMemoryCache,
    private postServices: PostServices,
    private fb: FormBuilder,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private dateUtilsService: DateUtilsService,
    private errorHandlerService: ErrorHandlerService,
    private router: Router,
    private userCommentService:UserCommentService,
    private _bottomSheet: MatBottomSheet
  ) { }


  ngOnInit(): void {
    this.initForm();
    this.retrieveUserDetails();
    this.filterFollowingStatus();
    this.retrieveUserLikedPosts(); 
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
    this.followingStatus.forEach((user: IUsers) => {
      this.fetchUserPosts(user, userPosts);
    });
    this.setLoaderFalse();
  }

  retrieveUserLikedPosts(): void {
    this.postServices.getLikedPosts(this.userDetails.id).pipe(take(1)).subscribe((likedPosts: any[]) => {
      this.likedPostArray =  likedPosts[0] ? likedPosts[0].post : [];
    }, (error: any) => {
      this.errorHandlerService.handleErrors(error, "While retrieving liked posts");
    });
  }

  /**
   * Fetches posts of a single user and adds them to the userPosts array.
   * It subscribes to the getUserPost method of the UserService to retrieve the posts.
   * If all posts are fetched, it processes the posts for display.
   * 
   * @param user - The user whose posts are to be fetched.
   * @param userPosts - The array to store the fetched posts.
   */
  private fetchUserPosts(user: IUsers, userPosts: any[]): void {
    const userPostSubscription = this.userService.getUserPost(user.id).subscribe(
      (postData: IUserPost[]) => {
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
   * It flattens the array of arrays into a single array of posts, initializes the likedProduct array and map liked posted by user.
   * maps profile images to the posts, and updates the visibility of the post-related elements.
   * 
   * @param userPosts - The array of arrays containing user posts.
   */
  private processUserPosts(userPosts: IUserPost[]): void {
    this.userPost = userPosts.flat();
    this.likedProduct = new Array(this.userPost.length).fill(false);
    this.mapProfileImages();
    this.showButton = true;
    this.showNoFeedPost = this.userPost.length === 0;

    // Check if any post is liked by the user based on postId.
    this.userPost.forEach((post, index) => {
      if (this.likedPostArray.some((likedPost:ILikedPost) => likedPost.postId === post.postId)) {
        this.likedProduct[index] = true;
      }
    });
  }

  /**
   * Maps profile images to user posts.
   * It iterates over each post and assigns the profile image of the corresponding user from the followingStatus array.
   */
  mapProfileImages(): void {
    this.userPost.forEach((post: any) => {
      const follower = this.followingStatus.find((follower: IUsers) => follower.id === post.id);
      post.profileImg = follower ? follower.profileImg : "assets/images/person.jpg";
    });
  }

  /**
   * Function to handle like/unlike.
   * @param index - The index of the post to be liked or unliked.
   */
  handleLike(index: number, user: any): void {
    this.likedProduct[index] = !this.likedProduct[index]; // Toggle the liked state of the post at the given index     
    // Extract specific properties and add 'liked' property
    const { name, id, postId } = user;

    if (this.likedProduct[index]) {
      // Add to liked posts array
      const likedPostObj = { name, id, postId, liked: true };
      this.likedPostArray.push(likedPostObj);
    } else {
      // Remove from liked posts array
      this.likedPostArray = this.likedPostArray.filter(post => post.postId !== postId);
    }

    this.postServices.saveLikeStatus(this.likedPostArray, this.userDetails.id).pipe(take(1))
      .subscribe(response => {
        console.log('Like status updated successfully');
      },
        error => {
          console.error('Error updating like status', error);
          // Revert the liked state if the update fails
          this.likedProduct[index] = !this.likedProduct[index];
        }
      );
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
    this.postDetails = this.buildPayloadPostDeatils(formattedDateandTime);
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

  private buildPayloadPostDeatils(formattedDateandTime:any): IUserPost{
    return new UserPost({
      content: this.form.controls['content'].value,
      time: formattedDateandTime.formattedTime,
      name: this.userDetails.name,
      date: formattedDateandTime.formattedDate,
    })
  }

  openComment(user:IUserPost){
    this.router.navigate(["profile/full/comment"]);
    this.userCommentService.setPostDetails(user);
  }

  openBottomSheet(user:IUserPost): void {
    const bottomSheetRef = this._bottomSheet.open(SharePostComponent,
      { data: user } 
    );
    bottomSheetRef.afterDismissed().subscribe((result) => {
      if(result){
        console.log('Shared post details for users'+ result);
        this._snackBar.open('Post Shared Successfully' + ' ', 'Close', {
          duration: 2000
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
