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

  ngOnInit(): void {
    this.initializeUserDetails();
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    if (this.getUserStatusSubscription) {
      this.getUserStatusSubscription.unsubscribe();
    }
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  // Initialize user details from local storage
  private initializeUserDetails(): void {
    const userDetailsJson = this.store.getItem("USER_DETAILS");
    this.userDetails = userDetailsJson ? JSON.parse(userDetailsJson) : null;
    this.person = this.userDetails?.profileImg || this.person;
  }

  // Load user profile including posts and user status
  private loadUserProfile(): void {
    this.loadUserPosts();
    this.loadAllUser();
  }

  // Load user posts from database
  private loadUserPosts(): void {
    if (this.userDetails) {
      this.postServices.getUserPost(this.userDetails).subscribe((data: any) => {
        this.userPost = data;
      }, (err: any) => {
        console.error('Error fetching user posts:', err)
      });
    }
  }

  // Load all users
  private loadAllUser(): void {
    if (this.userDetails?.id) {
      this.profileSubscription = this.userService.getAllUsers().subscribe((res: any) => {
        this.userData = res.map(({ id, profileImg, name }: { id: string, profileImg: string, name: string }) => ({ id, profileImg, name }));
        this.loadUserStatus();
      }, (err: any) => {
        console.error('Error fetching all users:', err)
      });
    }
  }

  // Load user status including followers and following users
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
      console.error('Error fetching/updating user status:', err)
    });
  }

  // Initialize user status if not available
  private initializeUserStatus(): void {
    const indexToRemove = this.userData.findIndex((user: any) => user.id === this.userDetails.id);
    if (indexToRemove !== -1) {
      this.userData.splice(indexToRemove, 1);
    }
    this.followerData = this.userData.map((user: any) => ({ ...user, status: 0 }));
    this.userService.allUserStatus(this.userDetails.id, this.followerData);

    this.followerData.forEach((obj: any) => {
      const userDataMatch = this.userData.find((user: any) => user.id === obj.id);
      if (userDataMatch) {
        obj.profileImg = userDataMatch.profileImg;
      }
    });
  }

  // Update user status based on fetched data
  private updateUserStatus(): void {
    this.userData.forEach((user: any) => {
      const foundUser = this.allUserstatus.find((item: any) => item.id === user.id);
      if (!foundUser) {
        this.allUserstatus.push({ ...user, status: 0 });
      }

      this.allUserstatus.forEach((obj: any) => {
        const userDataMatch = this.userData.find((user: any) => user.id === obj.id);
        if (userDataMatch) {
          obj.profileImg = userDataMatch.profileImg;
        }
      });
    });

    const indexToRemove = this.allUserstatus.findIndex((user: any) => user.id === this.userDetails.id);
    if (indexToRemove !== -1) {
      this.allUserstatus.splice(indexToRemove, 1);
    }

    this.followerData = this.allUserstatus.filter((v: any) => v.status === 0);
    this.followingData = this.allUserstatus.filter((v: any) => v.status === 1);

    setTimeout(() => this.loader = false, 1500);

    if (!this.serviceFlag) {
      this.userService.allUserStatus(this.userDetails.id, this.allUserstatus);
      this.serviceFlag = true;
    }
  }

  // Handle view switch between posts, followers, and following
  handleProfileView(view: string): void {
    this.showPost = view === 'POST';
    this.showFollower = view === 'FOLLOW';
    this.showFollowing = view === 'FOLLOWING';
  }

  // Open edit profile modal
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

  // Refresh user profile after editing
  private refreshUserProfile(): void {
    const userDetails = JSON.parse(this.store.getItem("USER_DETAILS") || '{}');
    this.userService.getIndividualUser(userDetails.id).subscribe((data: any) => {
      this.store.setItem("USER_DETAILS", JSON.stringify(data));
      this.userDetails = data;
      this.person = this.userDetails.profileImg;
    }, (err: any) => {
      console.error('Error refreshing user profile:', err)
    });
  }

  // Action to follow a user
  followAction(user: any): void {
    user.status = 1; // Update status to following
    this.updateUserStatusData();
  }

  // Action to unfollow a user
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

}
