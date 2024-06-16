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
    { image: "assets/images/person-1.jpg", title: "Smiley Sally" },
    { image: "assets/images/person-2.jpg", title: "Happy Harry" },
    { image: "assets/images/person-3.jpg", title: "Cheerful Charlie" },
    { image: "assets/images/person-4.jpg", title: "Grinning Grace" },
    { image: "assets/images/person-5.jpg", title: "Giggly Gina" },
    { image: "assets/images/person-6.jpg", title: "Jolly Joe" },
    { image: "assets/images/person-7.jpg", title: "Laughing Larry" },
    { image: "assets/images/person-8.jpg", title: "Bubbly Bella" },
    { image: "assets/images/person-9.jpg", title: "Merry Mike" },
    { image: "assets/images/person-10.jpg", title: "Chirpy Chloe" },
    { image: "assets/images/person-11.jpg", title: "Joyful Tina" },
    { image: "assets/images/person-12.jpg", title: "Sunny Sam" },
    { image: "assets/images/person-13.jpg", title: "Peppy Penny" },
    { image: "assets/images/person-14.jpg", title: "Bright Billy" },
    { image: "assets/images/person-15.jpg", title: "Radiant Rita" }
  ];
  selectedImageIndex!: number; // Index of the selected image
  loggedUser!: SignUp;
  profileImg: string = "assets/images/person.jpg";

  constructor(
    private store: InMemoryCache,
    private userService: UserService,
    public dialogRef: MatDialogRef<ViewProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  // Lifecycle hook to initialize component data
  ngOnInit(): void {
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
      console.log("Profile image updated sucessfully");
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
