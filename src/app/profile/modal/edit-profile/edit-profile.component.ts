import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewProfileComponent } from '../../view-profile/view-profile.component';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';
import { UserService } from 'src/app/core/services/user-service';
import { SignUp } from 'src/app/core/model/user-model';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  // Array of available profile images with titles.
  images = [
    { image: "assets/images/person-1.jpg", title: "Avatar 1" },
    { image: "assets/images/person-2.jpg", title: "Avatar 2" },
    { image: "assets/images/person-3.jpg", title: "Avatar 3" },
    { image: "assets/images/person-4.jpg", title: "Avatar 4" },
    { image: "assets/images/person-5.jpg", title: "Avatar 5" },
    { image: "assets/images/person-6.jpg", title: "Avatar 6" },
    { image: "assets/images/person-7.jpg", title: "Avatar 7" },
    { image: "assets/images/person-8.jpg", title: "Avatar 8" },
    { image: "assets/images/person-9.jpg", title: "Avatar 9" },
    { image: "assets/images/person-10.jpg", title: "Avatar 10" },
    { image: "assets/images/person-11.jpg", title: "Avatar 11" },
    { image: "assets/images/person-12.jpg", title: "Avatar 12" },
    { image: "assets/images/person-13.jpg", title: "Avatar 13" },
    { image: "assets/images/person-14.jpg", title: "Avatar 14" },
    { image: "assets/images/person-15.jpg", title: "Avatar 15" }
  ];

  loggedUser!: SignUp; // Object to store logged-in user details
  profileImg: string = "assets/images/person.jpg"; // Default profile image
  selectedImageIndex!: number; // Index of the selected image

  // Dependency injection through constructor
  constructor(
    private store: InMemoryCache,
    private userService: UserService,
    public dialogRef: MatDialogRef<ViewProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  // Lifecycle hook to initialize component data
  ngOnInit(): void {
    // Retrieve the logged-in user details from local storage
    const obj = this.store.getItem("USER_DETAILS");
    this.loggedUser = JSON.parse(obj);
  }

  // Method to save the selected profile image
  onSave(): void {
    this.loggedUser.profileImg = this.profileImg; // Update the profile image
    // Save updated user details
    this.userService.updateProfile(this.loggedUser.id, this.loggedUser).subscribe((data: any) => {
      // Close the dialog and pass back success status
      this.dialogRef.close({ status: "success", message: "Profile updated.", refreshPage: true });
      console.log("Profile image updated sucessfully" + data);
    }, (err: any) => {
      console.log("Error to updating profile image" + err);
      // Close the dialog and pass back failure status
      this.dialogRef.close({ status: "failed", message: "Profile not updated.", refreshPage: false });
    });
  }

  // Method to select an avatar from the list
  selectedImage(value: any): void {
    this.profileImg = value.image; // Set the selected image as profile image
    this.selectedImageIndex = value; // Update the selected image index
  }
}
