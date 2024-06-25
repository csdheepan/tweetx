import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { SignUp, UserPost } from 'src/app/core/model/user-model';
import { PostServices } from 'src/app/core/services/post-service';
import { UserService } from 'src/app/core/services/user-service';
import { DateUtilsService } from 'src/app/shared/service/date-utils.service';
import { ErrorHandlerService } from 'src/app/shared/service/error-handler.service';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';

/**
 * Component responsible for handling loggedIn user post (Create,Read,Update,delete -post (CRUD)).
 */

@Component({
  selector: 'app-user-post',
  templateUrl: './user-post.component.html',
  styleUrls: ['./user-post.component.scss']
})

export class UserPostComponent {

  profileImg!: string;
  buttonMessage:string ="Add";
  postId !: string;
  showEmojiPicker: boolean = false;
  loader: boolean = true;
  showPost: boolean = false;
  showNoPost: boolean = false;
  showButton:boolean = true;
  userDetails!: SignUp;
  userPost: UserPost[] = [];
  postDetails!: UserPost;
  form: FormGroup = Object.create(null);
  private subscription!: Subscription;
  @ViewChild('scrollUp', { static: true }) scrollUp!: ElementRef;

  constructor(
    private store: InMemoryCache,
    private postServices: PostServices,
    private fb: FormBuilder,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private dateUtilsService: DateUtilsService,
    private errorHandlerService: ErrorHandlerService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.retrieveUserDetails();
    this.retreiveUserPost();
  }

  initForm(): void {
    this.form = this.fb.group({
      "content": [null, Validators.required]
    });
  }

  retrieveUserDetails(): void {
    const userDetailsObj:string = this.store.getItem("USER_DETAILS");
    this.userDetails = JSON.parse(userDetailsObj);
    this.profileImg = this.userDetails.profileImg;
  }

  // Retrieves user post which posted by loggedIn user
  private retreiveUserPost(): void {
    this.subscription = this.userService.getUserPost(this.userDetails.id).subscribe((data: any) => {
      this.userPost = data;
      this.showNoPost = this.userPost.length == 0 ? true : false;
    }, (err: any) => {
      this.errorHandlerService.handleErrors(err, "While fetching user post");
    });
    this.setLoaderFalse();
  }

  // Set loader flag to false after a delay of 1.5 seconds (1500 milliseconds)
  setLoaderFalse(): void {
    setTimeout(() => {
      this.loader = false;
    }, 1500);
  }

  // To toggle show and hide emoji.
  toggleEmojiPicker(): void {
    this.showEmojiPicker = this.dateUtilsService.toggleEmojiPicker(this.showEmojiPicker);
  }

  insertEmoji(event: any): void {
    this.dateUtilsService.insertEmoji(event, this.form.controls['content']);
    this.showEmojiPicker = false;
  }

 /**
 * Toggles the visibility of the post form and scrolls to the top if the form is shown.
 * @param value The value indicating whether to show or hide the post form.
 */
  handlePostView(value: string): void {
    this.showPost = value === 'post';
    this.buttonMessage = value == 'post' ? 'Add' : "";
    this.form.reset();
    if (this.showPost) {
      this.scrollUp.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' }); // Scroll to the top of the page from the starting point
    }
  }

 /**
 * Add or edit a post by the user.
 * This method handles both adding a new post and updating an existing one based on the value parameter.
 * @param value - A string that determines the action to be performed ('Add' or 'Update').
 */
  post(value:string): void {
    const formattedDateandTime = this.dateUtilsService.getCurrentFormattedDateTime();
    this.postDetails = {
      id: "",
      content: this.form.controls['content'].value,
      time: formattedDateandTime.formattedTime,
      name: this.userDetails.name,
      date: formattedDateandTime.formattedDate,
      postId: this.postId
    };
    if(value == 'Update'){
      this.postServices.editContent(this.postDetails, this.userDetails).subscribe((data: any) => {
        this._snackBar.open("Post Updated Sucessfully" + ' ', 'Close', {
          duration: 2000
        });
      }, (error: any) => {
        this.errorHandlerService.handleErrors(error, "While updating user post");
      });
    } else if(value =='Add'){
      this.postDetails.postId = '';
      this.postServices.postContent(this.postDetails, this.userDetails).subscribe((data: any) => {
        this._snackBar.open('Post Added Sucessfully' + ' ', 'Close', {
          duration: 2000
        });
      }, (error: any) => {
        this.errorHandlerService.handleErrors(error, "While adding user post");
      });
    }
    this.retreiveUserPost();
    this.showPost = false;
    this.form.reset();
  }

  /**
 * Edit a post by the user.
 * @param userPost - The user post object to be edited.
 * @param value - A string that determines if the edit view should be shown ('edit').
 */
  editPost(userPost: UserPost, value: string) {
    this.showPost = value === 'edit';
    this.postId = userPost.postId;
    this.buttonMessage = "Update";
    this.scrollUp.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' }); // Scroll to the top of the page from the starting point
    this.form.controls['content'].setValue(userPost.content)
  }

/**
 * Delete a post by the user.
 * This method deletes the specified user post and displays a confirmation message.
 * @param userPost - The user post object to be deleted.
 */
  deletePost(userPost: UserPost) {
    this.postServices.deleteContent(userPost.postId, this.userDetails).subscribe((data: any) => {
      this._snackBar.open('Post deleted Sucessfully' + ' ', 'Close', {
        duration: 2000
      });
    }, (err: any) => {
      this.errorHandlerService.handleErrors(err, "While delete user post");
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
