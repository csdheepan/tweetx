import { Component, OnInit } from '@angular/core';
import { SignUp, UserStatus } from 'src/app/core/model/signup-model';
import { PostServices } from 'src/app/core/services/post.services';
import { UserService } from 'src/app/core/services/user.service';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {


  // Variable declaration
  showPost: boolean = false;
  showUser: boolean = true;
  userPost : UserStatus[] = [];
  person = "assets/images/person.jpg";
  loggedUser !: any;
  individualFeed: any[] = [];
  userData : any [] = [];
  loader : boolean = true;


  //constructor : Utilize Dependency Injection here.
  constructor(private userService: UserService, private postServices: PostServices, private store: InMemoryCache) { }

//onload method
  ngOnInit(): void {

    //retrieve the details from local storage.
    let obj = this.store.getItem("USER_DETAILS");
    this.loggedUser = JSON.parse(obj);

    this.loadUser();

  }

  //method to load feed content for user
  loadFeed(userDetails: SignUp) {
    this.postServices.getUserPost(userDetails).subscribe((data: any) => {

      this.showPost = true;
      this.showUser = false;
      this.individualFeed = data;
      this.person = userDetails.profileImg;

    })
  }

  handleView() {
    this.showPost = false;
    this.showUser = true;
    this.individualFeed = [];
  }

  //method for follow user action
  followAction(value: any, index: any) {

    value.status = 1;

    this.userPost[index] = value;

    //service call - update user status
    this.userService.followReqAction(this.userPost, this.loggedUser.id);

    this.loadUser();
  }

  //method for unfollow user action
  unFollowAction(value: any, index: any) {

    value.status = 0;

    this.userPost[index] = value;

    //service call - update user status
    this.userService.followReqAction(this.userPost, this.loggedUser.id);

    this.loadUser();
  }


  //method retrieve all the user in our application.
  loadUser() {

    //service call - retrieve all the user in our application.
    this.userService.getAllUser().subscribe((datas: any) => {

      this.userData = datas.map(({ id, profileImg }: { id: string, profileImg: string }) => ({ id, profileImg }));

      this.userStatus();
    });

  }
  
  userStatus(){
    
     //service call - retrieve all user status
     this.userService.getUserStatus(this.loggedUser.id).subscribe((data: any) => {
      this.userPost = data.users;
  
      // Map profileImg userData to userPost based on ids
      this.userPost.forEach((obj: any) => {
        let userDataMatch = this.userData.find((user: any) => user.id === obj.id);
        if (userDataMatch) {
          obj.profileImg = userDataMatch.profileImg;
        }
      });
    });

    // to set loader false after 1500ms
    setTimeout(() => {
      this.loader = false;
    }, 1500);
  }

  //method to fliter all user name
  filterUsers(event:any) {

    const searchText = event.target.value.toLowerCase();
    
    //block will execute only when backspace key or text is empty.
    if ( event.key === 'Backspace' || searchText == "") {
      this.userStatus();
    }
     else {
      this.userPost = this.userPost.filter(user =>  user.name.toLowerCase().includes(searchText));
    }
  }
  
}
