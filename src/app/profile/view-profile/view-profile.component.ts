import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { EditProfileComponent } from '../modal/edit-profile/edit-profile.component';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';
import { PostServices } from 'src/app/core/services/post-service';
import { UserService } from 'src/app/core/services/user-service';
import { SignUp, UserProfile, UserPost, Users } from 'src/app/core/model/user-model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorHandlerService } from 'src/app/shared/service/error-handler.service';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnInit, OnDestroy {

  person: string = "assets/images/person.jpg";
  selectedView: string = 'POST';
  showPost: boolean = true;
  showFollower: boolean = false;
  showFollowing: boolean = false;
  loader: boolean = true;
  serviceFlag: boolean = false;
  userPost: UserPost[] = [];
  followerData: Users[] = [];
  followingData: Users[] = [];
  allUserstatus: Users[] = [];
  userProfile: UserProfile[] = [];
  userDetails!: SignUp;
  private getUserStatusSubscription!: Subscription;
  private profileSubscription!: Subscription;

  constructor(
    private store: InMemoryCache,
    private postServices: PostServices,
    private dialog: MatDialog,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private errorHandlerService: ErrorHandlerService
  ) { }


  ngOnInit(): void {
    this.initializeUserDetails();
    this.loadUserProfile();
  }

  private initializeUserDetails(): void {
    const userDetailsJson:string = this.store.getItem("USER_DETAILS");
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
        this.errorHandlerService.handleErrors(err, 'While retrieve user posts');
      });
    }
  }

  private loadAllUser(): void {
    this.profileSubscription = this.userService.getAllUsers().subscribe((data: SignUp[]) => {
      // Map the response to extract user IDs, profile images, and names
      this.userProfile = data.map(({ id, profileImg, name }: UserProfile) => ({ id, profileImg, name }));
      this.loadUserStatus();
    }, (err: any) => {
      this.errorHandlerService.handleErrors(err, 'While retrieve all users');
    });
  }

  /**
   * Load user status including followers and following users
   * 1. If a new user use application, he doesn't have any user status with followers and following, initialize all users with status 0 (not following).
   * 2. If a user already has a user status,but we update status 0 for new upcoming users.
   */
  private loadUserStatus(): void {
    if (this.getUserStatusSubscription) {
      this.getUserStatusSubscription.unsubscribe();
    }
    this.getUserStatusSubscription = this.userService.getUserStatus(this.userDetails.id).subscribe((datas: any) => {
      if (datas) {
        this.allUserstatus = datas.users;
        this.updateUserStatus();
      } else {
        this.initializeUserStatus();
      }
    }, (err: any) => {
      this.errorHandlerService.handleErrors(err, 'While retrieve user status');
    });
  }

  /**
    * Initialize user status if not available.
    * This method is used for a user newly coming to use the application. 
    * It adds all existing users with status 0 (follow).
    */
  private initializeUserStatus(): void {
    // Find index of the current user in the user data and remove it.
    const currentUserIndex = this.userProfile.findIndex((user: UserProfile) => user.id === this.userDetails.id);
    if (currentUserIndex !== -1) {
      this.userProfile.splice(currentUserIndex, 1);
    }
    // Initialize follower data with all users and status as 0 (not following)
    this.followerData = this.userProfile.map((user: UserProfile) => ({ ...user, status: 0 }));
    this.userService.setUserStatus(this.userDetails.id, this.followerData);

    this.allUserstatus = this.followerData;
    this.mapProfileImage();
  }

  /**
    * Method is used to setting new users to status 0 (follow) and updating the profile images.
    * (ie) This will add status 0 for users who have recently joined the application.
    */
  private updateUserStatus(): void {
    this.userProfile.forEach((user: UserProfile) => {
      const foundUser = this.allUserstatus.find((item: Users) => item.id === user.id);
      // If user not found, add with status 0 (follow)
      if (!foundUser) {
        this.allUserstatus.push({ ...user, status: 0 });
      }
      this.mapProfileImage();
    });

    // Remove the current user from the user status data
    const currentUserIndex = this.allUserstatus.findIndex((user: Users) => user.id === this.userDetails.id);
    if (currentUserIndex !== -1) {
      this.allUserstatus.splice(currentUserIndex, 1);
    }

    // Filter follower and following data based on status
    this.followerData = this.allUserstatus.filter((v: Users) => v.status === 0);
    this.followingData = this.allUserstatus.filter((v: Users) => v.status === 1);

    setTimeout(() => this.loader = false, 1500);

    // Update user status in the service if not already updated
    if (!this.serviceFlag) {
      this.userService.setUserStatus(this.userDetails.id, this.allUserstatus);
      this.serviceFlag = true;
    }
  }

 /**
 * Map profile images for each user status entry.
 * 
 * When a user updates their profile image (avatar), the change is reflected in the 
 * registered user details (UserProfile) but not directly in the user status entries.
 * This is because updating user statuses in a NoSQL database can be complex and inefficient.
 * 
 * To address this, we map the profile images from the registered user details to the 
 * corresponding user statuses based on the user ID. This ensures that the most current 
 * profile image is displayed for each user status entry without needing to update the 
 * user status records directly.
 */
  private mapProfileImage(): void {
    this.allUserstatus.forEach((obj: Users) => {
      const matchedUser = this.userProfile.find((user: UserProfile) => user.id === obj.id);
      if (matchedUser) {
        obj.profileImg = matchedUser.profileImg;
      }
    });
  }

  /**
  * Handle view switch between posts, followers, and following
  * @param view The view to display ('posts'|'followers' | 'following').
  */
  handleProfileView(view: string): void {
    this.selectedView = view;
    this.showPost = view === 'POST';
    this.showFollower = view === 'FOLLOW';
    this.showFollowing = view === 'FOLLOWING';
  }

  openModal(): void {
    const dialogRef = this.dialog.open(EditProfileComponent, {
      width: "580px",
      height: '80%',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.status === "success" && result.refreshPage) {
        this.refreshUserProfile();
      } else if (result.status === "failed" && !result.refreshPage) {
        this._snackBar.open('Profile Image not upadted,Please try again later' + ' ', 'Close', {
          duration: 2000
        });
      }
    });
  }

  private refreshUserProfile(): void {
    const userDetails = JSON.parse(this.store.getItem("USER_DETAILS") || '{}');
    this.userService.getIndividualUser(userDetails.id).subscribe((data: any) => {
      this.store.setItem("USER_DETAILS", JSON.stringify(data));
      this.userDetails = data;
      this.person = this.userDetails.profileImg;
    }, (err: any) => {
      this.errorHandlerService.handleErrors(err, 'While retrieve user profile image');
    });
  }

  //Action to follow a user
  followAction(user: Users): void {
    user.status = 1;
    this.updateUserStatusData();
  }

  //Action to unfollow a user
  unFollowAction(user: Users): void {
    user.status = 0;
    this.updateUserStatusData();
  }

  // Update user status data in the database
  private updateUserStatusData(): void {
    this.userService.followReqAction(this.allUserstatus, this.userDetails.id).subscribe((data: any) => {
      this.followerData = this.allUserstatus.filter((v: Users) => v.status === 0);
      this.followingData = this.allUserstatus.filter((v: Users) => v.status === 1);
    }, (err: any) => {
      this.errorHandlerService.handleErrors(err, "while update user status data");
    });
  }

  ngOnDestroy(): void {
    if (this.getUserStatusSubscription) {
      this.getUserStatusSubscription.unsubscribe();
    }
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }
}