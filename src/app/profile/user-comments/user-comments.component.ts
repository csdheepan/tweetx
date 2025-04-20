import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PostServices } from 'src/app/core/services/post-service';
import { DateUtilsService } from 'src/app/shared/service/date-utils.service';
import { ErrorHandlerService } from 'src/app/shared/service/error-handler.service';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';
import { UserCommentService } from 'src/app/core/services/user-comment.service';
import { Comments, IComments, IReplyComments, ISignUp, IUserPost, ReplyComments } from 'src/app/core/model';

@Component({
  selector: 'app-user-comments',
  templateUrl: './user-comments.component.html',
  styleUrls: ['./user-comments.component.scss']
})
export class UserCommentsComponent {


  postDetails!: any;
  comment = '';
  replyText: string = '';
  userDetails!: ISignUp;
  showNoComment: boolean = false;
  commentDetails: IComments[] = [];
  editingCommentIndex !: number | null;
  replyCommentIndex: number | null = null;
  viewReplyIndex: number | null = null;

  constructor(
    private userCommentService: UserCommentService,
    private dateUtilsService: DateUtilsService,
    private errorHandlerService: ErrorHandlerService,
    private postServices: PostServices,
    private store: InMemoryCache,
    private router: Router,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.retrieveUserDetails();
    this.subscribeToPostData();
  }

  private retrieveUserDetails(): void {
    const userDetailsJson: string = this.store.getItem('USER_DETAILS');
    this.userDetails = JSON.parse(userDetailsJson);
  }

  private subscribeToPostData(): void {
    this.userCommentService.getPostDetails().subscribe((data: IUserPost | null) => {
      if (data) {
        this.postDetails = data;
        this.showNoComment = !data.comments || data.comments.length === 0;
        this.commentDetails = data.comments ? data.comments : [];
      } else {
        this.navigatePostFeed();
      }
    });
  }

  navigatePostFeed() {
    this.router.navigate(["profile/full/feed"]);
  }

  addComment(): void {
    if (this.comment.trim() === '') return;

    const formattedDateTime = this.dateUtilsService.getCurrentFormattedDateTime();
    const newComment = this.buildPayloadComments(formattedDateTime);

    this.commentDetails.push(newComment);
    this.postDetails = { ...this.postDetails, comments: this.commentDetails };
    this.showNoComment = false;
    this.updateCommentDetails();
  }

  private buildPayloadComments(formattedDateTime:any): IComments {
    return new Comments({
      comment: this.comment,
      time: formattedDateTime.formattedTime,
      profileImg: this.userDetails.profileImg,
      senderId: this.userDetails.id,
      date: formattedDateTime.formattedDate,
      name: this.userDetails.name,
      replyComments: []
    })
  }

  deleteComment(comment: IComments) {
    // Remove the comments from the commentDetails
    const deletedCommentIndex = this.commentDetails.findIndex((c) => c === comment);
    if (deletedCommentIndex !== -1) {
      this.commentDetails.splice(deletedCommentIndex, 1);
    }
    this.updateCommentDetails();
  }

  startEditComment(index: number): void {
    this.editingCommentIndex = index;
    const commentDetails: any = this.commentDetails[index];
    if (commentDetails) {
      commentDetails.editedComment = commentDetails.comment;
    }
  }

  saveComment(commentDetails: any): void {
    if (commentDetails.editedComment) {
      const formattedDateTime = this.dateUtilsService.getCurrentFormattedDateTime();
      commentDetails.comment = commentDetails.editedComment;
      commentDetails.time = formattedDateTime.formattedTime;
      commentDetails.date = formattedDateTime.formattedDate;
      this.editingCommentIndex = null;
      this.updateCommentDetails();
    }
  }

  isEditingComment(index: number): boolean {
    return this.editingCommentIndex === index;
  }

  isCommentOwner(comment: IComments): boolean {
    return comment.senderId === this.userDetails.id;
  }

  isReplyOwner(commentId: string) {
    return commentId === this.userDetails.id;
  }

  showReplyComment(index: number): void {
    this.replyCommentIndex = index;
    this.replyText = "";
  }

  isReplyingToComment(index: number): boolean {
    return this.replyCommentIndex === index;
  }

  saveReply(): void {
    if (this.replyCommentIndex !== null && this.replyText.trim() !== '') {
      const formattedDateTime = this.dateUtilsService.getCurrentFormattedDateTime();
      const newReply= this.buildPayloadReplyComments(formattedDateTime);
      this.postDetails.comments[this.replyCommentIndex].replyComments.push(newReply);
      this.updateCommentDetails();
      this.replyCommentIndex = null;
    }
  }

  private buildPayloadReplyComments(formattedDateTime:any):IReplyComments{
    return new ReplyComments({
          profileImg: this.userDetails.profileImg,
        name: this.userDetails.name,
        comment: this.replyText,
        date: formattedDateTime.formattedDate,
        time: formattedDateTime.formattedTime,
        commentId: this.userDetails.id
    })
  }

  toggleViewReply(index: number): void {
    this.viewReplyIndex = this.viewReplyIndex === index ? null : index;
    if (this.commentDetails[index].replyComments.length === 0) {
      this._snackBar.open("No reply was found for the comment" + ' ', 'Close', {
        duration: 2000
      });
    }
  }

  deleteReply(commentIndex: number, replyIndex: number): void {
    this.postDetails.comments[commentIndex].replyComments.splice(replyIndex, 1);
    this.updateCommentDetails();
  }

  private updateCommentDetails() {
    this.postServices.updateComment(this.postDetails, this.postDetails.id).subscribe(
      () => {
        this.userCommentService.setPostDetails(this.postDetails);
        this.comment = '';
        this.replyText = '';
      },
      (err: any) => {
        this.errorHandlerService.handleErrors(err, 'Error while updating post comment');
      }
    );
  }
}
