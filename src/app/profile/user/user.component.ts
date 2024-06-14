import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SignUp, UserPost, Users } from 'src/app/core/model/user-model';
import { PostServices } from 'src/app/core/services/post-service';
import { UserService } from 'src/app/core/services/user-service';
import { ErrorDialogComponent } from 'src/app/shared/components/error-dialog/error-dialog.component';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';

/**
 * UserComponent is responsible for managing user-related functionalities such as loading users, following/unfollowing actions, and displaying user posts.
 */

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

// Variable declaration
 showPost: boolean = false;
 showUser: boolean = true;
 allUserStatus: Users[] = [];
 person = "assets/images/person.jpg";
 loggedUser!: SignUp;
 individualFeed: UserPost[] = [];
 userData: any[] = [];
 loader: boolean = true;
 private subscription!: Subscription;

  constructor(
    private userService: UserService,
    private postServices: PostServices,
    private store: InMemoryCache,
    private dialog : MatDialog
  ) {}

  // OnInit lifecycle hook
  ngOnInit(): void {
    this.loggedUser = this.getUserDetails();
    if (this.loggedUser) {
      this.loadUser();
    }
  }

  // Retrieve user details from local storage
  private getUserDetails(): any {
    const userDetails = this.store.getItem("USER_DETAILS");
    return userDetails ? JSON.parse(userDetails) : null;
  }

  // Method to load feed content for a specific user
  loadFeed(userDetails: SignUp): void {
   this.subscription = this.postServices.getUserPost(userDetails).subscribe((data: UserPost[]) => {
      this.showPost = true;
      this.showUser = false;
      this.individualFeed = data;
      this.person = userDetails.profileImg;
    },(err:any)=>{
      this.handleErrors(err,"Retrieve user post")
    });
  }

  // Method to handle navigation back to the user list
  handleView(): void {
    this.showPost = false;
    this.showUser = true;
    this.individualFeed = [];
  }

  // Method to perform follow action for a user
  followAction(user:Users, index: number): void {
    user.status = 1;
    this.updateUserStatus(user, index);
    this.loadUser();
  }

   // Method to perform unfollow action for a user
  unFollowAction(user:Users, index: number): void {
    user.status = 0;
    this.updateUserStatus(user, index);
    this.loadUser();
  }

  // Update user status and make a service call
  private updateUserStatus(user:Users, index: number): void {
    this.allUserStatus[index] = user;
    this.userService.followReqAction(this.allUserStatus, this.loggedUser.id);
  }

    /**
   * Method to retrieve all users in our appliaction.
   * After retrieving user data, it subsequently calls loadUserStatus() to load the statuses of users and map them to profile images.
   */
  private loadUser(): void {
    this.subscription = this.userService.getAllUsers().subscribe((users: SignUp[]) => {
      this.userData = users.map(({ id, profileImg }: { id: string, profileImg: string }) => ({ id, profileImg }));
      this.loadUserStatus();
    },(err:any)=>{
      this.handleErrors(err,"Retrieve users")
    });
  }

  // Load user status and map profile images
  private loadUserStatus(): void {
    this.subscription = this.userService.getUserStatus(this.loggedUser.id).subscribe((data: any) => {
      this.allUserStatus = data.users;
      this.mapProfileImages();
    },(err:any)=>{
      this.handleErrors(err,"Retrieve user status")
    });

     // Set loader flag to false after a delay of 1.5 seconds (1500 milliseconds)
    setTimeout(() => {
      this.loader = false;
    }, 1500);
  }

  // Map profile images to user posts
  private mapProfileImages(): void {
    this.allUserStatus.forEach((post: any) => {
      const matchedUser = this.userData.find((user: any) => user.id === post.id);
      if (matchedUser) {
        post.profileImg = matchedUser.profileImg;
      }
    });
  }

  // Method to filter users by name
  filterUsers(event: any): void {
    const searchText = event.target.value.toLowerCase();
    if (event.key === 'Backspace' || searchText === "") {
      this.loadUserStatus();
    } else {
      this.allUserStatus = this.allUserStatus.filter(user => user.name.toLowerCase().includes(searchText));
    }
  }

   // Create a centralized error handling function
   private handleErrors(error: any, context: string): void {
    console.error(`Error fetching ${context}:`, error);
    this.dialog.open(ErrorDialogComponent,{
      width:'400px'
    });
  }

  //Lifecycle hook to clean up subscription
   ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
