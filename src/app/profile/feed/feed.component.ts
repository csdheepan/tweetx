import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InMemoryCache } from 'src/app/core/services/memory-cache';
import { PostServices } from 'src/app/core/services/post.services';

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
  userPost : any[]= [];
  

  constructor(private store: InMemoryCache, private postServices: PostServices
    , private fb: FormBuilder) { }


  ngOnInit(): void {


    this.form = this.fb.group({
      "content": [null, Validators.required]
    })

    let obj = this.store.getItem("USER_DETAILS");
    this.userDetails = JSON.parse(obj);

    this.person = this.userDetails.profileImg ? this.userDetails.profileImg : "assets/images/person.jpg" ;


    console.log(this.userDetails);

    this.loadFeedPost();
  }

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
      name : this.userDetails.name
    }

    this.postServices.postContent(postObj, this.userDetails);
    this.showPost = false;

    this.form.reset();

    this.loadFeedPost();
  }
}
