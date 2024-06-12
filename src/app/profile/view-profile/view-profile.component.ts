import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { EditProfileComponent } from '../modal/edit-profile/edit-profile.component';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';
import { PostServices } from 'src/app/core/services/post-service';
import { UserService } from 'src/app/core/services/user-service';

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
  followerData: any[] = []; // Array to store follower data
  followingData: any[] = []; // Array to store following user data
  allUserstatus: any; // Object to store all user status
  userData: any; // Object to store user data
  userPost: any[] = []; // Array to store user posts
  userDetails: any; // Object to store user details
  loader: boolean = true; // Flag to control loading state
  private serviceFlag: boolean = false; // Flag to prevent multiple service calls
  private getUserStatusSubscription!: Subscription; // Subscription for fetching user status
  private profileSubscription !: Subscription;

  constructor(
    private store: InMemoryCache,
    private postServices: PostServices,
    private dialog: MatDialog,
    private userService: UserService,
  ) { }


  /**
  * Lifecycle hook to initialize component
  */
  ngOnInit(): void {
    this.initializeUserDetails();
    this.loadUserProfile();
  }

  /**
  * Initialize user details from local storage
  */
  private initializeUserDetails(): void {
    const userDetailsJson = this.store.getItem("USER_DETAILS");
    this.userDetails = userDetailsJson ? JSON.parse(userDetailsJson) : null;
    this.person = this.userDetails?.profileImg || this.person;
  }

  /**
  * Load user profile including posts, followers, and following status
  */
  private loadUserProfile(): void {
    this.loadUserPosts();
    // Load all users with their followers and following status
    this.loadAllUser();
  }


  /**
 * Load user posts from database
 */
  private loadUserPosts(): void {
    if (this.userDetails) {
      this.postServices.getUserPost(this.userDetails).subscribe((data: any) => {
        this.userPost = data;
      }, (err: any) => {
        this.handleErrors(err, 'user posts');
      });
    }
  }

  /**
 *  Load all users
 */
  private loadAllUser(): void {
      this.profileSubscription = this.userService.getAllUsers().subscribe((res: any) => {
        // Map the response to extract user IDs, profile images, and names
        this.userData = res.map(({ id, profileImg, name }: { id: string, profileImg: string, name: string }) => ({ id, profileImg, name }));
        this.loadUserStatus();
      }, (err: any) => {
        this.handleErrors(err, 'all users');
      });
  }

  /**
 * Load user status including followers and following users
 * 1. If a new user doesn't have any user status with followers and following, initialize all users with status 0 (not following).
 * 2. If a user already has a user status, update status 0 for new users.
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
        // Update user status if data available
        this.updateUserStatus();
      } else {
        // Initialize user status if not available
        this.initializeUserStatus();
      }
    }, (err: any) => {
      this.handleErrors(err, 'updating user status');
    });
  }

  /**
 * Initialize user status if not available
 */
  private initializeUserStatus(): void {
    // Find index of the current user in the user data
    const indexToRemove = this.userData.findIndex((user: any) => user.id === this.userDetails.id);
    // Remove the current user from the user data
    if (indexToRemove !== -1) {
      this.userData.splice(indexToRemove, 1);
    }
    // Initialize follower data with all users and status as 0 (not following)
    this.followerData = this.userData.map((user: any) => ({ ...user, status: 0 }));
    this.userService.allUserStatus(this.userDetails.id, this.followerData);

    // Map profile image for each follower
    this.followerData.forEach((obj: any) => {
      const userDataMatch = this.userData.find((user: any) => user.id === obj.id);
      if (userDataMatch) {
        obj.profileImg = userDataMatch.profileImg;
      }
    });
  }

  /**
 * Update user status based on fetched data
 */
  private updateUserStatus(): void {
    this.userData.forEach((user: any) => {
      // Find the user in the fetched user status data
      const foundUser = this.allUserstatus.find((item: any) => item.id === user.id);
      // If user not found, add with status 0 (not following)
      if (!foundUser) {
        this.allUserstatus.push({ ...user, status: 0 });
      }
      // Map profile image for each user
      this.allUserstatus.forEach((obj: any) => {
        const userDataMatch = this.userData.find((user: any) => user.id === obj.id);
        if (userDataMatch) {
          obj.profileImg = userDataMatch.profileImg;
        }
      });
    });

    // Remove the current user from the user status data
    const indexToRemove = this.allUserstatus.findIndex((user: any) => user.id === this.userDetails.id);
    if (indexToRemove !== -1) {
      this.allUserstatus.splice(indexToRemove, 1);
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
  * Handle view switch between posts, followers, and following
  * @param view The view to display ('posts'|'followers' | 'following').
  */
  handleProfileView(view: string): void {
    this.showPost = view === 'POST';
    this.showFollower = view === 'FOLLOW';
    this.showFollowing = view === 'FOLLOWING';
  }


  /**
   *Open edit profile modal
   */
  openModal(): void {
    const dialogRef = this.dialog.open(EditProfileComponent, {
      width: "580px",
      height: '80%',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === "data saved") {
        this.refreshUserProfile();
      }
    });
  }

  /**
   *Refresh user profile after editing
   */
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

  /**
  * Action to follow a user
  */
  followAction(user: any): void {
    user.status = 1; // Update status to following
    this.updateUserStatusData();
  }

  /**
   * Action to unfollow a user
   */
  unFollowAction(user: any): void {
    user.status = 0; // Update status to not following
    this.updateUserStatusData();
  }

  /**
  *  Update user status data in the database
  */
  private updateUserStatusData(): void {
    this.userService.followReqAction(this.allUserstatus, this.userDetails.id);
    this.followerData = this.allUserstatus.filter((v: any) => v.status === 0);
    this.followingData = this.allUserstatus.filter((v: any) => v.status === 1);
  }

  /**
 * Create a centralized error handling function
 */
  private handleErrors(error: any, context: string): void {
    console.error(`Error fetching ${context}:`, error);
  }

  /**
 * Lifecycle hook to clean up subscriptions
 */
  ngOnDestroy(): void {
    if (this.getUserStatusSubscription) {
      this.getUserStatusSubscription.unsubscribe();
    }
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

}
