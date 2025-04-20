import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ISignUp, IUserProfile, IUsers } from 'src/app/core/model';
import { UserService } from 'src/app/core/services/user-service';
import { ErrorHandlerService } from 'src/app/shared/service/error-handler.service';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';

/**
 * UserComponent is responsible for managing user-related functionalities such as loading users, following/unfollowing actions.
 */

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

 loader: boolean = true;
 loggedUser!: ISignUp;
 allUserStatus: IUsers[] = [];
 cloneUserStatus: IUsers[]=[];
 userProfile: IUserProfile[] = [];
 private subscriptions: Subscription[] = [];

  constructor(
    private userService: UserService,
    private store: InMemoryCache,
    private errorHandlerService: ErrorHandlerService,
    private router:Router
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

  // Method to perform follow action for a user
  followAction(user:IUsers, index: number): void {
    user.status = 1;
    this.updateUserStatus(user, index);
    this.loadUser();
  }

   // Method to perform unfollow action for a user
  unFollowAction(user:IUsers, index: number): void {
    user.status = 0;
    this.updateUserStatus(user, index);
    this.loadUser();
  }

  // Update user status and make a service call
  private updateUserStatus(user:IUsers, index: number): void {
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
   const userSubscription = this.userService.getAllUsers().subscribe((users: ISignUp[]) => {
      this.userProfile = users.map(({ id, profileImg,name }: IUserProfile) => ({ id, profileImg,name }));
      this.loadUserStatus();
    },(err:any)=>{
      this.errorHandlerService.handleErrors(err,"While retrieve all users");
    });
    this.subscriptions.push(userSubscription);
  }

  // Load user status and map profile images
  private loadUserStatus(): void {
    const userStatusSubscription = this.userService.getUserStatus(this.loggedUser.id).subscribe((data: any) => {
      this.allUserStatus = data.users;
      this.cloneUserStatus = [...this.allUserStatus]
      this.mapProfileImages();
    },(err:any)=>{
      this.errorHandlerService.handleErrors(err,"While retrieve user status");
    });
    this.subscriptions.push(userStatusSubscription);

   // Set loader flag to false after a delay of 1.5 seconds (1500 milliseconds)
    setTimeout(() => {
      this.loader = false;
    }, 1500);
  }

  // Map profile images to user posts
  private mapProfileImages(): void {
    this.allUserStatus.forEach((post: IUsers) => {
      const matchedUser = this.userProfile.find((user:IUserProfile) => user.id === post.id);
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

/**
 * Navigates to the view profile component to view a specific user.
 * 
 * This method is called to display the profile of a specific user,
 * including their profile details such as ID, name, and profile image.
 * 
 * @param user The user object containing the details of the specific user.
 */
navigateViewProfile(user: IUsers) {
    this.router.navigate(['profile/full/user-profile', user.id], {
      queryParams: {
        id:user.id,
        name: user.name,
        profileImg: user.profileImg,
        emailId: '',
        password: ''
      }
    });
  }  

   // Navigate to the message component for sending a message to a specific user
  openMessage(user:IUsers){
    this.router.navigate(['profile/full/message'],{
      queryParams: {
        id:user.id,
        name: user.name,
        profileImg: user.profileImg,
        emailId: '',
        password: ''
      }
    })
  }

   ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
