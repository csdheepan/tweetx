import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PostServices } from 'src/app/core/services/post.services';
import { UserService } from 'src/app/core/services/user.service';
import { EditProfileComponent } from '../modal/edit-profile/edit-profile.component';
import { Subscription } from 'rxjs';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnInit {

  //variable decleration
  person = "assets/images/person.jpg";
  showPost: boolean = true;
  showFollower: boolean = false;
  showFollowing: boolean = false;
  followerData: any[] = [];
  followingData: any[] = [];
  allUserstatus: any;
  userData: any;
  userPost: any[] = [];
  userDetails: any;
  loader: boolean = true;

  private serviceFlag: boolean = false;
  private getUserStatusSubscription: Subscription | undefined;

  constructor(private store: InMemoryCache, private postServices: PostServices,
    private dialog: MatDialog, private userService: UserService) { }


  ngOnInit(): void {
    // Retrieve user details from localStorage
    const userDetailsJson = this.store.getItem("USER_DETAILS");
    this.userDetails = userDetailsJson ? JSON.parse(userDetailsJson) : null;

    // Set profile image or default image if not provided
    this.person = this.userDetails && this.userDetails.profileImg ? this.userDetails.profileImg : "assets/images/person.jpg";

    // Retrieve user's posts
    if (this.userDetails) {
      this.getAndDisplayUserPosts();
      this.retrieveUserStatus();
    };
  }

  getAndDisplayUserPosts(): void {
    if (this.userDetails) {
      this.postServices.getUserPost(this.userDetails).subscribe((data: any) => {
        console.log(data);
        this.userPost = data;
      });
    }
  }

  retrieveUserStatus(): void {
    if (this.userDetails && this.userDetails.id) {

      this.userService.getAllUser().subscribe((res: any) => {

        // Retrieve all users and separate the id, profileImg
        this.userData = res.map(({ id, profileImg, name }: { id: string, profileImg: string, name: string }) => ({ id, profileImg, name }));

        // Call function to get user status
        this.getUserStatus();

      });
    }
  }

  getUserStatus(): void {

    // Check if there's an existing subscription, unsubscribe to avoid multiple calls
    if (this.getUserStatusSubscription) {
      this.getUserStatusSubscription.unsubscribe();
    }

    // Service call to get user status
    this.getUserStatusSubscription = this.userService.getUserStatus(this.userDetails.id).subscribe((datas: any) => {
      if (datas != undefined) {

        this.allUserstatus = datas.users;

        // Update user status based on retrieved data
        this.updateUserStatus();
      }
      else if (datas == undefined) {

        const indexToRemove = this.userData.findIndex((user: any) => user.id === this.userDetails.id);

        if (indexToRemove !== -1) {
          this.userData.splice(indexToRemove, 1);
        }
        this.followerData = this.userData.map((user: any) => ({ ...user, status: 0 }));

        this.userService.allUserStatus(this.userDetails.id, this.followerData);

        let i=0;
        console.log("User status service called" + i++ + "times");

        // Map profileImg into userPost based on ids
        this.followerData.forEach((obj: any) => {
          let userDataMatch = this.userData.find((user: any) => user.id === obj.id);
          if (userDataMatch) {
            obj.profileImg = userDataMatch.profileImg;
          }
        });
      }
    });
  }

  updateUserStatus(): void {

    // Iterate over userData
    this.userData.forEach((user: any) => {
      const foundUser = this.allUserstatus.find((item: any) => item.id === user.id);

      // If the user's id does not exist in getUserStatus, add it with status 0
      if (!foundUser) {
        this.allUserstatus.push({ ...user, status: 0 });
      }

    });

    // Remove current user from allUserstatus
    const indexToRemove = this.allUserstatus.findIndex((user: any) => user.id === this.userDetails.id);
    if (indexToRemove !== -1) {
      this.allUserstatus.splice(indexToRemove, 1);
    }

    // Set followerData and followingData based on status
    this.followerData = this.allUserstatus.filter((v: any) => v.status === 0);
    this.followingData = this.allUserstatus.filter((v: any) => v.status === 1);

    //to set loader false.
    setTimeout(() => {
      this.loader = false;
    }, 1500);

    //flag services - to avoid call service multiple times.
    if (!this.serviceFlag) {
      let i = 0;
      this.userService.allUserStatus(this.userDetails.id, this.allUserstatus);
      console.log("User status service called" + i++ + "times");
      this.serviceFlag = true;
    }
  }



  ngOnDestroy() {

    // Unsubscribe from getUserStatusSubscription when component is destroyed
    if (this.getUserStatusSubscription) {
      this.getUserStatusSubscription.unsubscribe();
    }
  }



  handleProfileView(value: any) {
    if (value == "POST") {
      this.showPost = true;
      this.showFollower = false;
      this.showFollowing = false;
    }
    else if (value == "FOLLOW") {
      this.showPost = false;
      this.showFollower = true;
      this.showFollowing = false;
    }
    else if (value == "FOLLOWING") {
      this.showPost = false;
      this.showFollower = false;
      this.showFollowing = true;
    }
  }

  openModal() {
    const dialogRef = this.dialog.open(EditProfileComponent, {
      width: "580px",
      height: '80%',
      autoFocus: false
    })

    dialogRef.afterClosed().subscribe(result => {

      // result contains the data passed when closing the dialog
      console.log('Dialog closed with result:', result);
      if (result == "data saved") {

        let obj = this.store.getItem("USER_DETAILS");
        let userDetails = JSON.parse(obj);

        this.userService.getIndividualUser(userDetails.id).subscribe((data: any) => {

          this.store.removeItem("USER_DETAILS");

          this.store.setItem("USER_DETAILS", JSON.stringify(data));

          let obj = this.store.getItem("USER_DETAILS");
          this.userDetails = JSON.parse(obj);

          this.person = this.userDetails.profileImg;
        })


      }
    });
  }




  followAction(value: any, index: any) {

    //update value in obj
    value.status = 1;

    this.userService.followReqAction(this.allUserstatus, this.userDetails.id);

    //fliter status 1 (followingUser)
    this.followerData = this.allUserstatus.filter((v: any) => {
      return v.status === 0;
    });

    //fliter status 0 (followUser)
    this.followingData = this.allUserstatus.filter((v: any) => {
      return v.status === 1;

    });
  }


  unFollowAction(value: any, index: any) {

    //update value in obj
    value.status = 0;

    this.userService.followReqAction(this.allUserstatus, this.userDetails.id);

    //fliter status 1 (followingUser)
    this.followingData = this.allUserstatus.filter((v: any) => {
      return v.status === 1;

    });

    //fliter status 0 (followUser)
    this.followerData = this.allUserstatus.filter((v: any) => {
      return v.status === 0;
    });

  }

}
