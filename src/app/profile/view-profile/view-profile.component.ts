import { Component, OnInit } from '@angular/core';
import { InMemoryCache } from 'src/app/core/services/memory-cache';
import { PostServices } from 'src/app/core/services/post.services';
import { UserService } from 'src/app/core/services/user.service';

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



  userPost : any[] = [];
  userDetails : any;

  constructor(private store: InMemoryCache, private postServices: PostServices,private userService: UserService){}

  ngOnInit(): void {

    let obj = this.store.getItem("USER_DETAILS");
    this.userDetails = JSON.parse(obj);

    this.postServices.getUserPost(this.userDetails).subscribe((data: any) => {
      console.log(data);

      this.userPost = data

    });



    this.userService.getUserStatus(this.userDetails.id).subscribe((data: any) => {

      if (data != undefined) {
        let userData = data.users;

          this.followerData = userData.filter((v: any) => {
            return v.status === 0;
          });
        
          this.followingData = userData.filter((v: any) => {
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

          this.userService.allUserStatus(this.userDetails.id,this.followerData)

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
      // this.loadUser();
    }
    else if (value == "FOLLOWING"){
      this.showPost = false;
      this.showFollower = false;
      this.showFollowing = true;
      // this.loadUser();
    }
  }

}
