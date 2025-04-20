import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/core/services/user-service';
import { ErrorHandlerService } from 'src/app/shared/service/error-handler.service';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';
import { FeedComponent } from '../../feed/feed.component';
import { ISignUp, IUsers } from 'src/app/core/model';

@Component({
  selector: 'app-share-post',
  templateUrl: './share-post.component.html',
  styleUrls: ['./share-post.component.scss']
})
export class SharePostComponent {

  userDetails!: ISignUp;
  userProfile: IUsers[] = [];
  private subscriptions: Subscription[] = [];
  selectedProfiles: any = {};
  selectedUsers: IUsers[] = [];

  constructor(
    private store: InMemoryCache,
    private userService: UserService,
    private errorHandlerService: ErrorHandlerService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<FeedComponent>
  ) { }

  ngOnInit(): void {
    this.retrieveUserDetails();
    this.getUserProfile();
  }

  private retrieveUserDetails(): void {
    const userDetailsJson: string = this.store.getItem("USER_DETAILS");
    this.userDetails = JSON.parse(userDetailsJson);
  }

  private getUserProfile(): void {
    const userProfileSubscription = this.userService.getUserStatus(this.userDetails.id).subscribe((userData: any) => {
      this.userProfile = userData.users.filter((v: any) => v.status === 1);
      this.userProfile = this.userProfile.filter((v: any) => v.id !== this.data.id);
    }, (err: any) => {
      this.errorHandlerService.handleErrors(err, "While retrieving user status");
    });
    this.subscriptions.push(userProfileSubscription);
  }

  sendData() {
    this.bottomSheetRef.dismiss(this.selectedUsers);
  }

  updateSelectedProfiles(profile: any) {
    if (this.selectedProfiles[profile.name]) {
      // Add profile to selectedUsers array
      this.selectedUsers.push(profile);
    } else {
      // Remove profile from selectedUsers array
      this.selectedUsers = this.selectedUsers.filter(user => user.name !== profile.name);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
