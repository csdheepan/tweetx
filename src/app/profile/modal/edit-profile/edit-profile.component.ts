import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewProfileComponent } from '../../view-profile/view-profile.component';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';
import { UserService } from 'src/app/core/services/user-service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {


 // Variable declaration
  images = [
    {
      image: "assets/images/person-1.jpg",
      title: "Avatar 1"
    },
    {
      image: "assets/images/person-2.jpg",
      title: "Avatar 2"
    }, 
    {
      image: "assets/images/person-3.jpg",
      title: "Avatar 3"
    },
    {
      image: "assets/images/person-4.jpg",
      title: "Avatar 4"
    }, 
    {
      image: "assets/images/person-5.jpg",
      title: "Avatar 5"
    },
    {
      image: "assets/images/person-6.jpg",
      title: "Avatar 6"
    },
    {
      image: "assets/images/person-7.jpg",
      title: "Avatar 7"
    },
    {
      image: "assets/images/person-8.jpg",
      title: "Avatar 8"
    }
    ,{
      image: "assets/images/person-9.jpg",
      title: "Avatar 9"
    }
    ,{
      image: "assets/images/person-10.jpg",
      title: "Avatar 10"
    },
    {
      image: "assets/images/person-11.jpg",
      title: "Avatar 11"
    },
    {
      image: "assets/images/person-12.jpg",
      title: "Avatar 12"
    },
    {
      image: "assets/images/person-13.jpg",
      title: "Avatar 13"
    },
    {
      image: "assets/images/person-14.jpg",
      title: "Avatar 14"
    },
    {
      image: "assets/images/person-15.jpg",
      title: "Avatar 15"
    }
  ];
  loggedUser: any;
  profileImg: string = "assets/images/person.jpg";
  selectedImageIndex !: number;

 //constructor : Utilize Dependency Injection here.
  constructor(
    private store: InMemoryCache,
    private userService : UserService,
    public dialogRef: MatDialogRef<ViewProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) { }


  //onload method
  ngOnInit(): void {

    //retrieve the details from local storage
    let obj = this.store.getItem("USER_DETAILS");
    this.loggedUser = JSON.parse(obj);

  }


  //method to save profile Image
  onSave() {

    let obj = this.loggedUser;

    obj.profileImg = this.profileImg;

   //update profile image in register
    this.userService.updateProfile(this.loggedUser.id,obj);

    //pass data while dialog box closed.
    this.dialogRef.close("data saved");
    
  }

  //method for selecting avatar
  selectedImage(value: any) {
    this.profileImg = value.image;
    this.selectedImageIndex = value;
  }

}
