import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { SignUp, UserPost, Users } from 'src/app/core/model/user-model';
import { PostServices } from 'src/app/core/services/post-service';
import { UserService } from 'src/app/core/services/user-service';
import { DateUtilsService } from 'src/app/shared/service/date-utils.service';
import { ErrorHandlerService } from 'src/app/shared/service/error-handler.service';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';

@Component({
  selector: 'app-user-post',
  templateUrl: './user-post.component.html',
  styleUrls: ['./user-post.component.scss']
})
export class UserPostComponent {

  profileImg!: string;
  postId !: string;
  form: FormGroup = Object.create(null);
  showEmojiPicker: boolean = false;
  loader: boolean = true;
  showPost: boolean = false;
  showNoPost: boolean = false;
  userDetails!: SignUp;
  userPost: UserPost[] = [];
  postDetails!: UserPost;
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
    const obj = this.store.getItem("USER_DETAILS");
    this.userDetails = JSON.parse(obj);
    this.profileImg = this.userDetails.profileImg;
  }


  private retreiveUserPost(): void {
    this.subscription = this.userService.getUserPost(this.userDetails.id).subscribe((data: any) => {
      this.userPost = data;
      if (this.userPost.length == 0) {
        this.showNoPost = true;
      }
    }, (err: any) => {
      this.errorHandlerService.handleErrors(err, "While fetching user post");
    });
    this.setLoaderFalse();
  }

  setLoaderFalse(): void {
    setTimeout(() => {
      this.loader = false;
    }, 1500);
  }

  post(): void {
    const formattedDateandTime = this.dateUtilsService.getCurrentFormattedDateTime();
    this.postDetails = {
      id: "",
      content: this.form.controls['content'].value,
      time: formattedDateandTime.formattedTime,
      name: this.userDetails.name,
      date: formattedDateandTime.formattedDate,
      postId: this.postId
    };
    this.postServices.editContent(this.postDetails, this.userDetails).subscribe((data: any) => {
      this._snackBar.open('Post has been updated ' + ' ', 'Close', {
        duration: 2000
      });
      this.retreiveUserPost();
    }, (error: any) => {
      this.errorHandlerService.handleErrors(error, "While adding user post");
    });
    this.showPost = false;
    this.form.reset();
  }

  editContent(userPost: UserPost, value: string) {
    this.showPost = value === 'edit';
    this.postId = userPost.postId
    this.scrollUp.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' }); // Scroll to the top of the page from the starting point
    this.form.controls['content'].setValue(userPost.content)
  }

  deleteContent(userPost: UserPost) {
    this.postServices.deleteContent(userPost.postId, this.userDetails).subscribe((data: any) => {
      this._snackBar.open('Post has deleted Sucessfully' + ' ', 'Close', {
        duration: 2000
      });
    }, (err: any) => {
      this.errorHandlerService.handleErrors(err, "While delete user post");
    });
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = this.dateUtilsService.toggleEmojiPicker(this.showEmojiPicker);
  }

  insertEmoji(event: any): void {
    this.dateUtilsService.insertEmoji(event, this.form.controls['content']);
    this.showEmojiPicker = false;
  }

  handlePostView(value: string): void {
    this.showPost = value === 'post';
    if (this.showPost) {
      this.scrollUp.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' }); // Scroll to the top of the page from the starting point
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
