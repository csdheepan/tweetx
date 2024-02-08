import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InMemoryCache } from 'src/app/core/services/memory-cache';
import { PostServices } from 'src/app/core/services/post.services';
import { UserService } from 'src/app/core/services/user.service';
import { EditProfileComponent } from '../modal/edit-profile/edit-profile.component';
import { Subscription, take, timer } from 'rxjs';

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

  private getUserStatusSubscription: Subscription | undefined;

  constructor(private store: InMemoryCache, private postServices: PostServices,
    private dialog: MatDialog, private userService: UserService) { }

  ngOnInit(): void {

    let obj = this.store.getItem("USER_DETAILS");
    this.userDetails = JSON.parse(obj);

    this.person = this.userDetails.profileImg ? this.userDetails.profileImg : "assets/images/person.jpg";


    //retrive post services
    this.postServices.getUserPost(this.userDetails).subscribe((data: any) => {
      console.log(data);

      this.userPost = data

    });

    //Retrieve user status data based on follow and following
    this.userService.getAllUser().subscribe((res: any) => {

    //retrive all user and segerate the  id , profileImg
      this.userData = res.map(({ id, profileImg, name }: { id: string, profileImg: string, name: string }) => ({ id, profileImg, name }));

      //service get trigger unecsssary , want to fix 
      this.getUserStatusSubscription =  this.userService.getUserStatus(this.userDetails.id).subscribe((datas: any) => {

        if (datas != undefined) {

          this.allUserstatus = datas.users;

          // Iterate over userData
          this.userData.forEach((user: any) => {
            // Check if the user's id exists in getUserStatus
            const foundUser = this.allUserstatus.find((item: any) => item.id === user.id);
            // If the user's id does not exist in getUserStatus, add it with status 0
            if (!foundUser) {
              this.allUserstatus.push({ ...user, status: 0 });
            }
          });

          this.userService.allUserStatus(this.userDetails.id, this.allUserstatus);


          this.followerData = this.allUserstatus.filter((v: any) => {
            return v.status === 0;
          });

          this.followingData = this.allUserstatus.filter((v: any) => {
            return v.status === 1;
          });


        }

        else if (datas == undefined) {


          const indexToRemove = this.userData.findIndex((user: any) => user.id === this.userDetails.id);

          if (indexToRemove !== -1) {
            this.userData.splice(indexToRemove, 1);
          }
          this.followerData = this.userData.map((user: any) => ({ ...user, status: 0 }));

          this.userService.allUserStatus(this.userDetails.id, this.followerData);

          // Map profileImg into userPost based on ids
          this.followerData.forEach((obj: any) => {
            let userDataMatch = this.userData.find((user: any) => user.id === obj.id);
            if (userDataMatch) {
              obj.profileImg = userDataMatch.profileImg;
            }
          });
        }
      })

    // Unsubscribe after a 5 seconds
    timer(5000).pipe(take(1)).subscribe(() => {
      if (this.getUserStatusSubscription && !this.getUserStatusSubscription.closed) {
        this.getUserStatusSubscription.unsubscribe();
      }
    });
    });
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

          this.person = this.userDetails.profileImg
        })


      }
    });
  }




  followAction(value: any, index: any) {

    //update directly drom retrieve obj
    value.status = 1;

    this.userService.followReqAction(this.allUserstatus, this.userDetails.id);

    this.followerData = this.allUserstatus.filter((v: any) => {
      return v.status === 0;
    });

  }


  unFollowAction(value: any, index: any) {

    value.status = 0;

    this.userService.followReqAction(this.allUserstatus, this.userDetails.id);

    this.followingData = this.allUserstatus.filter((v: any) => {
      return v.status === 1;
    });

  }

}
