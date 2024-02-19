import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PostServices } from 'src/app/core/services/post.services';
import { UserService } from 'src/app/core/services/user.service';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {

  // Variable declaration
  userDetails !: any;
  showPost: boolean = false;
  form: FormGroup = Object.create(null);
  userPost: any[] = [];
  followingStatus: any[] = [];
  showButton: boolean = false;
  loader: boolean = true;
  private getUserPostSubscription !: Subscription;
  showNoFeedPost: boolean = false;


  //Constructor : Utilize Dependency Injection here.
  constructor(private store: InMemoryCache, private postServices: PostServices, private fb: FormBuilder, private userService: UserService) { }


  //onload method
  ngOnInit(): void {

    //form validation
    this.form = this.fb.group({
      "content": [null, Validators.required]
    })

    //retrieve the details from local storage
    let obj = this.store.getItem("USER_DETAILS");
    this.userDetails = JSON.parse(obj);

    //service call - retrieve all the user of our application.
    this.getUserPostSubscription = this.userService.getUserStatus(this.userDetails.id).subscribe((data: any) => {

      // segregate the following user status 
      this.followingStatus = data.users.filter((v: any) => v.status == 1);


      if (this.followingStatus.length == 0) {
        this.showButton = true;
        this.showNoFeedPost = true;
      }
      else {
        this.showButton = false;
        this.showNoFeedPost = false;
      }

      //unsubscribe the user status service.
      if (this.getUserPostSubscription) {
        this.getUserPostSubscription.unsubscribe();
      }

      this.callServiceForUsers(this.followingStatus);
    });

  }

  //method for handle show post field and hide field.
  handlePostView(value: any) {
    if (value == 'post') {
      this.showPost = true;
      //to scroll to the top of the page
      window.scrollTo(0, 0);
    }
    else if (value == 'cancel') {
      this.showPost = false;
    }
  }


  //method for post the content
  post() {

    // Get the current date
    const currentDate = new Date();

    // Extract day, month, and year components
    const day = currentDate.getDate().toString().padStart(2, '0'); // padStart ensures two digits
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // months are zero-based
    const year = currentDate.getFullYear();

    // Create the formatted date string
    const formattedDate = `${day}/${month}/${year}`;

    //payload for feed post
    let postObj = {
      content: this.form.controls['content'].value,
      time: formattedDate,
      name: this.userDetails.name
    }

    //service call for post content
    this.postServices.postContent(postObj, this.userDetails);
    this.showPost = false;

    //reset the form
    this.form.reset();

  }

  // method used for retrive post content for user following status.
  callServiceForUsers(users: any[]) {

    let userPosts: any[] = [];

    // Iterate through each user
    users.forEach((user: any) => {

      // Call the service for Invidual User
      this.userService.getStatusPost(user.id).subscribe((postData: any) => {

        // Push user post to the array
        userPosts.push(postData);

        if (userPosts.length === users.length) {

          // change the array of arrays into a single array
          this.userPost = userPosts.reduce((acc, val) => acc.concat(val), []);


          this.userPost.forEach((post: any) => {

            //map profileImg here.
            const follower = this.followingStatus.find((follower: any) => follower.id === post.id);

            if (follower) {
              post.profileImg = follower.profileImg;
            }
            //by default Image
            else {
              post.profileImg = "assets/images/person.jpg";
            }
          });

          this.showButton = true; // show add button

          if (this.userPost.length == 0) {
            this.showNoFeedPost = true;
          }
        }
      });
    });

    //to set a loader false.
    setTimeout(() => {

      this.loader = false;
    }, 1500);
  }

  //unsubscribe the user status service when component is destoryed.
  ngOnDestroy(): void {
    if (this.getUserPostSubscription) {
      this.getUserPostSubscription.unsubscribe();
    }
  }
}
