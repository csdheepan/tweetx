import { Component, OnInit } from '@angular/core';
import { Login, SignUp } from 'src/app/core/model/signup-model';
import { InMemoryCache } from 'src/app/core/services/memory-cache';
import { PostServices } from 'src/app/core/services/post.services';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {


  showPost: boolean = false;
  hideUser: boolean = true;

  userPost: any[] = [];

  person = "assets/images/person.jpg";
  loggedUser !: any;

  individualFeed: any[] = [];
  userData : any


  constructor(private userService: UserService, private postServices: PostServices, private store: InMemoryCache) { }



  ngOnInit(): void {

    let obj = this.store.getItem("USER_DETAILS");
    this.loggedUser = JSON.parse(obj);


    this.loadUser();

  }

  loadFeed(userDetails: SignUp) {
    this.postServices.getUserPost(userDetails).subscribe((data: any) => {
      console.log(data);
      this.showPost = true;
      this.hideUser = false;

      this.individualFeed = data;
      this.person = userDetails.profileImg

    })
  }

  handleView() {
    this.showPost = false;
    this.hideUser = true;
    this.individualFeed = [];

  }

  followAction(value: any, index: any) {

    value.status = 1;

    // Replace the object at the specified index with the modified object
    this.userPost[index] = value;

    this.userService.followReqAction(this.userPost, this.loggedUser.id);

    this.loadUser();
  }

  unFollowAction(value: any, index: any) {
    value.status = 0;

    // Replace the object at the specified index with the modified object
    this.userPost[index] = value;

    this.userService.followReqAction(this.userPost, this.loggedUser.id);

    this.loadUser();
  }


  loadUser() {


    this.userService.getAllUser().subscribe((datas: any) => {
      this.userData = datas.map(({ id, profileImg }: { id: string, profileImg: string }) => ({ id, profileImg }));

      this.mapFunction();
    });


  }
  

  mapFunction(){
    
     // Load user statuses
     this.userService.getUserStatus(this.loggedUser.id).subscribe((data: any) => {
      this.userPost = data.users;
  
      // Map profileImg into userPost based on ids
      this.userPost.forEach((obj: any) => {
        let userDataMatch = this.userData.find((user: any) => user.id === obj.id);
        if (userDataMatch) {
          obj.profileImg = userDataMatch.profileImg;
        }
      });
    });
  }
  
}
