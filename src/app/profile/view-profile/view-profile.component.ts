import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InMemoryCache } from 'src/app/core/services/memory-cache';
import { PostServices } from 'src/app/core/services/post.services';
import { UserService } from 'src/app/core/services/user.service';
import { EditProfileComponent } from '../modal/edit-profile/edit-profile.component';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnInit {
  

  person = "assets/images/person.jpg";

  showPost : boolean = true;

  showFollower : boolean = false;
  showFollowing : boolean = false;



  followerData : any[] = [];
  followingData : any[] = [];

  allUserstatus :any;
  userData : any;
  userPost : any[] = [];
  userDetails : any;

  constructor(private store: InMemoryCache, private postServices: PostServices,
    private dialog : MatDialog,private userService: UserService){}

  ngOnInit(): void {

    let obj = this.store.getItem("USER_DETAILS");
    this.userDetails = JSON.parse(obj);

    this.person = this.userDetails.profileImg ? this.userDetails.profileImg : "assets/images/person.jpg" ;


    this.userService.getAllUser().subscribe((datas: any) => {
      this.userData = datas.map(({ id, profileImg }: { id: string, profileImg: string }) => ({ id, profileImg }));

    });

    this.postServices.getUserPost(this.userDetails).subscribe((data: any) => {
      console.log(data);

      this.userPost = data

    });

   this.loadFollowerdata();

  }


  loadFollowerdata(){
      this.userService.getUserStatus(this.userDetails.id).subscribe((data: any) => {

      if (data != undefined) {


        this.allUserstatus = data.users;
        let allUser = data.users;


          // Map profileImg into userPost based on ids
          allUser.forEach((obj: any) => {
            let userDataMatch = this.userData.find((user: any) => user.id === obj.id);
            if (userDataMatch) {
              obj.profileImg = userDataMatch.profileImg;
            }
          });

          this.followerData = allUser.filter((v: any) => {
            return v.status === 0;
          });
        
          this.followingData = allUser.filter((v: any) => {
            return v.status === 1;
          });
        
      }
      else if (data == undefined) {

        this.userService.getAllUser().subscribe((data: any) => {

          const indexToRemove = data.findIndex((user:any) => user.id === this.userDetails.id);

          if (indexToRemove !== -1) {
            data.splice(indexToRemove, 1);
          }
          this.followerData = data.map(({ id, name }: { id: string, name: string }) => ({ id, name }));
          this.followerData = this.followerData.map(user => ({ ...user, status: 0 }));

          this.userService.allUserStatus(this.userDetails.id,this.followerData);

          // Map profileImg into userPost based on ids
          this.followerData.forEach((obj: any) => {
            let userDataMatch = this.userData.find((user: any) => user.id === obj.id);
            if (userDataMatch) {
              obj.profileImg = userDataMatch.profileImg;
            }
          });

        })
      }


    })
  }

  handleProfileView(value:any){
    if(value == "POST"){
      this.showPost = true;
      this.showFollower = false;
      this.showFollowing = false;
    }
    else if (value == "FOLLOW"){
      this.showPost = false;
      this.showFollower = true;
      this.showFollowing = false;
    }
    else if (value == "FOLLOWING"){
      this.showPost = false;
      this.showFollower = false;
      this.showFollowing = true;
    }
  }

  openModal(){
  const dialogRef = this.dialog.open(EditProfileComponent,{
    width : "580px",
    height : '80%',
    autoFocus : false
  })

  dialogRef.afterClosed().subscribe(result => {
    // result contains the data passed when closing the dialog
    console.log('Dialog closed with result:', result);
     if(result == "data saved"){


      let obj = this.store.getItem("USER_DETAILS");
      let userDetails = JSON.parse(obj);

   this.userService.getIndividualUser(userDetails.id).subscribe((data:any)=>{

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

    this.userService.followReqAction(this.allUserstatus, this.userDetails .id);

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
