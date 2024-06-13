import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { EditProfileComponent } from '../modal/edit-profile/edit-profile.component';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';
import { PostServices } from 'src/app/core/services/post-service';
import { UserService } from 'src/app/core/services/user-service';
import { SignUp, UserPost, Users } from 'src/app/core/model/user-model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnInit, OnDestroy {

  //variable declaration
  person: string = "assets/images/person.jpg"; // Default profile picture
  showPost: boolean = true; // Flag to control visibility of posts
  showFollower: boolean = false; // Flag to control visibility of followers
  showFollowing: boolean = false; // Flag to control visibility of following users
  userPost: UserPost[] = []; // Array to store user posts
  followerData: Users[] = []; // Array to store follower data
  followingData: Users[] = []; // Array to store following user data
  allUserstatus: Users[] = []; // Object to store all user status
  userData: any[] = []; // Object to store user data
  userDetails!: SignUp; // Object to store user details
  loader: boolean = true; // Flag to control loading state
  private serviceFlag: boolean = false; // Flag to prevent multiple service calls
  private getUserStatusSubscription!: Subscription; // Subscription for fetching user status
  private profileSubscription !: Subscription;

  constructor(
    private store: InMemoryCache,
    private postServices: PostServices,
    private dialog: MatDialog,
    private userService: UserService,
    private _snackBar: MatSnackBar
  ) { }


  ngOnInit(): void {
    this.initializeUserDetails();
    this.loadUserProfile();
  }

  private initializeUserDetails(): void {
    const userDetailsJson = this.store.getItem("USER_DETAILS");
    this.userDetails = userDetailsJson ? JSON.parse(userDetailsJson) : null;
    this.person = this.userDetails?.profileImg || this.person;
  }

  // Load user profile including posts, followers, and following status
  private loadUserProfile(): void {
    this.loadUserPosts();
    this.loadAllUser();
  }

  private loadUserPosts(): void {
    if (this.userDetails) {
      this.postServices.getUserPost(this.userDetails).subscribe((data: UserPost[]) => {
        this.userPost = data;
      }, (err: any) => {
        this.handleErrors(err, 'user posts');
      });
    }
  }

  private loadAllUser(): void {
    this.profileSubscription = this.userService.getAllUsers().subscribe((data: SignUp[]) => {
      // Map the response to extract user IDs, profile images, and names
      this.userData = data.map(({ id, profileImg, name }: { id: string, profileImg: string, name: string }) => ({ id, profileImg, name }));
      this.loadUserStatus();
    }, (err: any) => {
      this.handleErrors(err, 'all users');
    });
  }

  /**
   * Load user status including followers and following users
   * 1. If a new user use application, he doesn't have any user status with followers and following, initialize all users with status 0 (not following).
   * 2. If a user already has a user status,but we update status 0 for new upcoming users.
   */
  private loadUserStatus(): void {
    // Unsubscribe from any existing subscriptions
    if (this.getUserStatusSubscription) {
      this.getUserStatusSubscription.unsubscribe();
    }
    // Fetch user status data from the service
    this.getUserStatusSubscription = this.userService.getUserStatus(this.userDetails.id).subscribe((datas: any) => {
      if (datas) {
        this.allUserstatus = datas.users;
        this.updateUserStatus();
      } else {
        this.initializeUserStatus();
      }
    }, (err: any) => {
      this.handleErrors(err, 'updating user status');
    });
  }

  /**
    * Initialize user status if not available.
    * This method is used for a user newly coming to use the application. 
    * It adds all existing users with status 0 (follow).
    */
  private initializeUserStatus(): void {
    // Find index of the current user in the user data
    const currentUserIndex = this.userData.findIndex((user: any) => user.id === this.userDetails.id);
    if (currentUserIndex !== -1) {
      this.userData.splice(currentUserIndex, 1);
    }
    // Initialize follower data with all users and status as 0 (not following)
    this.followerData = this.userData.map((user: any) => ({ ...user, status: 0 }));
    this.userService.allUserStatus(this.userDetails.id, this.followerData);

    this.allUserstatus = this.followerData;
    this.mapProfileImage();
  }

  /**
    * Update user status by setting new users to status 0 (follow) and updating the profile images.
    * This will add status 0 for users who have recently joined the application.
    */
  private updateUserStatus(): void {
    this.userData.forEach((user: any) => {
      const foundUser = this.allUserstatus.find((item: any) => item.id === user.id);
      // If user not found, add with status 0 (not following || follow)
      if (!foundUser) {
        this.allUserstatus.push({ ...user, status: 0 });
      }
      this.mapProfileImage();
    });

    // Remove the current user from the user status data
    const currentUserIndex = this.allUserstatus.findIndex((user: any) => user.id === this.userDetails.id);
    if (currentUserIndex !== -1) {
      this.allUserstatus.splice(currentUserIndex, 1);
    }

    // Filter follower and following data based on status
    this.followerData = this.allUserstatus.filter((v: any) => v.status === 0);
    this.followingData = this.allUserstatus.filter((v: any) => v.status === 1);

    setTimeout(() => this.loader = false, 1500);

    // Update user status in the service if not already updated
    if (!this.serviceFlag) {
      this.userService.allUserStatus(this.userDetails.id, this.allUserstatus);
      this.serviceFlag = true;
    }
  }

 /**
 * Map profile images for each user status entry.
 * This method ensures that when a user updates their profile image (avatar), 
 * it is reflected across all user statuses. Since the user status data does not
 * store profile images directly, we use the updated images from the userData
 * and map them to the corresponding user statuses.
 */
  private mapProfileImage(): void {
    this.allUserstatus.forEach((obj: any) => {
      const userDataMatch = this.userData.find((user: any) => user.id === obj.id);
      if (userDataMatch) {
        obj.profileImg = userDataMatch.profileImg;
      }
    });
  }

  /**
  * Handle view switch between posts, followers, and following
  * @param view The view to display ('posts'|'followers' | 'following').
  */
  handleProfileView(view: string): void {
    this.showPost = view === 'POST';
    this.showFollower = view === 'FOLLOW';
    this.showFollowing = view === 'FOLLOWING';
  }

  //Open edit profile modal
  openModal(): void {
    const dialogRef = this.dialog.open(EditProfileComponent, {
      width: "580px",
      height: '80%',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.status === "success" && result.refreshPage) {
        this.refreshUserProfile();
      }else if(result.status === "failed" && !result.refreshPage){
        this._snackBar.open('profile image not upadted,Please try again later' + ' ', 'Close');
      }
    });
  }

  //Refresh user profile after editing
  private refreshUserProfile(): void {
    const userDetails = JSON.parse(this.store.getItem("USER_DETAILS") || '{}');
    this.userService.getIndividualUser(userDetails.id).subscribe((data: any) => {
      this.store.setItem("USER_DETAILS", JSON.stringify(data));
      this.userDetails = data;
      this.person = this.userDetails.profileImg;
    }, (err: any) => {
      this.handleErrors(err, 'user profile');
    });
  }

  //Action to follow a user
  followAction(user: any): void {
    user.status = 1; // Update status to following
    this.updateUserStatusData();
  }

  //Action to unfollow a user
  unFollowAction(user: any): void {
    user.status = 0; // Update status to not following
    this.updateUserStatusData();
  }

  // Update user status data in the database
  private updateUserStatusData(): void {
    this.userService.followReqAction(this.allUserstatus, this.userDetails.id);
    this.followerData = this.allUserstatus.filter((v: any) => v.status === 0);
    this.followingData = this.allUserstatus.filter((v: any) => v.status === 1);
  }

  // Create a centralized error handling function
  private handleErrors(error: any, context: string): void {
    console.error(`Error fetching ${context}:`, error);
  }

  //Lifecycle hook to clean up subscription
  ngOnDestroy(): void {
    if (this.getUserStatusSubscription) {
      this.getUserStatusSubscription.unsubscribe();
    }
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }
}