import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SignUp, UserPost, UserProfile, Users } from 'src/app/core/model/user-model';
import { PostServices } from 'src/app/core/services/post-service';
import { UserService } from 'src/app/core/services/user-service';
import { ErrorHandlerService } from 'src/app/shared/service/error-handler.service';
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

 person:string = "assets/images/person.jpg";
 showPost: boolean = false;
 showUser: boolean = true;
 loader: boolean = true;
 loggedUser!: SignUp;
 allUserStatus: Users[] = [];
 cloneUserStatus: Users[]=[];
 individualFeed: UserPost[] = [];
 userProfile: UserProfile[] = [];
 private subscription!: Subscription;

  constructor(
    private userService: UserService,
    private postServices: PostServices,
    private store: InMemoryCache,
    private errorHandlerService: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loggedUser = this.getUserDetails();
    if (this.loggedUser) {
      this.loadUser();
    }
  }

  // Retrieve user details from local storage
  private getUserDetails(): any {
    const userDetailsJson:string = this.store.getItem("USER_DETAILS");
    return userDetailsJson ? JSON.parse(userDetailsJson) : null;
  }

  // Method to load feed content for a specific user
  loadFeed(userDetails: SignUp): void {
   this.subscription = this.postServices.getUserPost(userDetails).subscribe((data: UserPost[]) => {
      this.showPost = true;
      this.showUser = false;
      this.individualFeed = data;
      this.person = userDetails.profileImg;
    },(err:any)=>{
      this.errorHandlerService.handleErrors(err,"While retrieve user post");
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
    this.userService.followReqAction(this.allUserStatus, this.loggedUser.id).subscribe((data:any)=>{}
  ,(err:any)=>{
    this.errorHandlerService.handleErrors(err,"While update users follow request");
  });
  }

    /**
   * Method to retrieve all users in our appliaction.
   * After retrieving user data, it subsequently calls loadUserStatus() to load the statuses of users and map them to profile images.
   */
  private loadUser(): void {
    this.subscription = this.userService.getAllUsers().subscribe((users: SignUp[]) => {
      this.userProfile = users.map(({ id, profileImg,name }: UserProfile) => ({ id, profileImg,name }));
      this.loadUserStatus();
    },(err:any)=>{
      this.errorHandlerService.handleErrors(err,"While retrieve all users");
    });
  }

  // Load user status and map profile images
  private loadUserStatus(): void {
    this.subscription = this.userService.getUserStatus(this.loggedUser.id).subscribe((data: any) => {
      this.allUserStatus = data.users;
      this.cloneUserStatus = [...this.allUserStatus]
      this.mapProfileImages();
    },(err:any)=>{
      this.errorHandlerService.handleErrors(err,"While retrieve user status");
    });

   // Set loader flag to false after a delay of 1.5 seconds (1500 milliseconds)
    setTimeout(() => {
      this.loader = false;
    }, 1500);
  }

  // Map profile images to user posts
  private mapProfileImages(): void {
    this.allUserStatus.forEach((post: Users) => {
      const matchedUser = this.userProfile.find((user:UserProfile) => user.id === post.id);
      if (matchedUser) {
        post.profileImg = matchedUser.profileImg;
      }
    });
  }

  // Method to filter users by name
  filterUsers(event: any): void {
    const searchText = event.target.value.toLowerCase();
    if (event.key === 'Backspace' || searchText === "") {
      this.allUserStatus = this.cloneUserStatus;
    } else {
      this.allUserStatus = this.allUserStatus.filter(user => user.name.toLowerCase().includes(searchText));
    }
  }
   ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
