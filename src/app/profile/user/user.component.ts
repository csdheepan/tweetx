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

      this.individualFeed = data

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
    
    this.userService.getUserStatus(this.loggedUser.id).subscribe((data: any) => {

      if (data != undefined) {
        this.userPost = data.users;
      }
      else if (data == undefined) {

        this.userService.getAllUser().subscribe((data: any) => {

          const indexToRemove = data.findIndex((user:any) => user.id === this.loggedUser.id);

          if (indexToRemove !== -1) {
            data.splice(indexToRemove, 1);
          }
          this.userPost = data.map(({ id, name }: { id: string, name: string }) => ({ id, name }));
          this.userPost = this.userPost.map(user => ({ ...user, status: 0 }));

          this.userService.allUserStatus(this.loggedUser.id,this.userPost)

        })
      }


    })
  }
}
