import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InMemoryCache } from 'src/app/core/services/memory-cache';
import { UserService } from 'src/app/core/services/user.service';
import { ViewProfileComponent } from '../../view-profile/view-profile.component';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {


  images = [
    {
      image: "assets/images/person-1.jpg",
      title: "Avatar 1"

    },
    {
      image: "assets/images/person-2.jpg",
      title: "Avatar 2"

    }, {
      image: "assets/images/person-3.jpg",
      title: "Avatar 3"

    }, {
      image: "assets/images/person-4.jpg",
      title: "Avatar 4"

    }, {
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

    }, {
      image: "assets/images/person-9.jpg",
      title: "Avatar 9"

    },

  ]
  loggedUser: any;
  form: FormGroup = Object.create(null);
  profileImg: string = "assets/images/person.jpg";
  selectedImageIndex !: number;



  constructor(private fb: FormBuilder, private store: InMemoryCache,private userService : UserService
    ,public dialogRef: MatDialogRef<ViewProfileComponent>, @Inject(MAT_DIALOG_DATA) public data : any) { }
  ngOnInit(): void {

    this.form = this.fb.group({
      name: [null,[Validators.maxLength(20)]],
    });


    let obj = this.store.getItem("USER_DETAILS");
    this.loggedUser = JSON.parse(obj);

    this.form.controls['name'].patchValue(this.loggedUser.name);
  }

  onSave() {

    let obj = this.loggedUser;

    obj.profileImg = this.profileImg;
    // obj.name = this.form.controls['name'].value;

    console.log("Payload" + obj);

   //update profile image in register
    this.userService.updateProfile(this.loggedUser.id,obj);

    this.dialogRef.close("data saved");
    

  }

  selectedImage(value: any) {
    console.log(value);
    this.profileImg = value.image;
    this.selectedImageIndex = value;

  }




}
