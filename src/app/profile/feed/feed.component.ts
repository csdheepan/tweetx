import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { InMemoryCache } from 'src/app/core/services/memory-cache';
import { PostServices } from 'src/app/core/services/post.services';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {


  userDetails !: any;
  showPost: boolean = false;
  form: FormGroup = Object.create(null);
  person = "assets/images/person.jpg";
  userPost: any[] = [];
  followingStatus : any[]=[];
  private getUserPostSubscription !: Subscription ;



  constructor(private store: InMemoryCache, private postServices: PostServices
    , private fb: FormBuilder, private userService: UserService) { }


  ngOnInit(): void {


    this.form = this.fb.group({
      "content": [null, Validators.required]
    })

    let obj = this.store.getItem("USER_DETAILS");
    this.userDetails = JSON.parse(obj);

    this.person = this.userDetails.profileImg ? this.userDetails.profileImg : "assets/images/person.jpg";


    console.log(this.userDetails);


    this.getUserPostSubscription = this.userService.getUserStatus(this.userDetails.id).subscribe((data: any) => {
      console.log("User Status:" + data);

      // Filter users with status 1
      this.followingStatus = data.users.filter((v: any) => v.status == 1);

      if (this.getUserPostSubscription) {
        this.getUserPostSubscription.unsubscribe();
      }

      // Call the service for each user one by one
      this.callServiceForUsers(this.followingStatus);
    });
  
  }

  //load post content for loggedUser 
  loadFeedPost() {
    this.postServices.getUserPost(this.userDetails).subscribe((data: any) => {
      console.log(data);

      this.userPost = data

    })
  }
  handlePostView(value: any) {
    if (value == 'post') {
      this.showPost = true;
    }
    else if (value == 'cancel') {
      this.showPost = false;
    }
  }



  post() {

    // Get the current date
    const currentDate = new Date();

    // Extract day, month, and year components
    const day = currentDate.getDate().toString().padStart(2, '0'); // padStart ensures two digits
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // months are zero-based
    const year = currentDate.getFullYear();

    // Create the formatted date string
    const formattedDate = `${day}/${month}/${year}`;

    console.log(formattedDate);

    let postObj = {
      content: this.form.controls['content'].value,
      time: formattedDate,
      name: this.userDetails.name
    }

    this.postServices.postContent(postObj, this.userDetails);
    this.showPost = false;

    this.form.reset();

  }

  callServiceForUsers(users: any[]) {

    // Array to store user posts
    let userPosts: any[] = [];

    // Iterate through each user
    users.forEach((user: any) => {

      // Call the service for the user
      this.userService.getStatusPost(user.id).subscribe((postData: any) => {

        // Push user post to the array
        userPosts.push(postData);

        // Check if all users have been processed
        if (userPosts.length === users.length) {
          
          // change the array of arrays into a single array
          this.userPost = userPosts.reduce((acc, val) => acc.concat(val), []);


          this.userPost.forEach((post: any) => {

            //note currently fliter based on name we have to change it to  "id" 
            const follower = this.followingStatus.find((follower: any) => follower.id === post.id);
            if (follower) {
              post.profileImg = follower.profileImg;
            }
            else{
              post.profileImg = "assets/images/person.jpg";
            }
          });

          console.log(this.userPost); // Log user posts
        }
      });
    });
  }

  ngOnDestroy(): void {

    if (this.getUserPostSubscription) {
      this.getUserPostSubscription.unsubscribe();
    }
  }

}
