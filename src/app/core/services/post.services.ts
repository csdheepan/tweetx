import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SignUp } from '../model/signup-model';


@Injectable({
  providedIn: 'root'
})
export class PostServices {

  constructor(private afs : AngularFirestore) { }


  postContent(postObj:any,userDetails:SignUp){

    const generateId = this.afs.createId(); // Generate a ID


    const id = userDetails.id; // mapping  ID

     // Use set to store the document with the  ID
     this.afs.collection('/register/' + id + '/feed post').doc(generateId).set(postObj);
  }

  getUserPost(userDetails:SignUp){

    
    const id = userDetails.id; // mapping  ID

    return this.afs.collection('/register/' + id + '/feed post').valueChanges()
  }
}
