import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from } from 'rxjs';
import { serializeForFirestore } from 'src/app/shared/service/firestore-utils';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private firestore: AngularFirestore
  ) { }

  /**
  * Stores the messages sent by the logged-in user to a specific receiver.
  * @param senderId The ID of the logged-in user (sender).
  * @param receiverId The ID of the message receiver.
  * @param messages An array of messages to be stored.
  * @returns An Observable of DocumentReference after storing the messages.
  */
  senderMessage(loggedId: string, receiverId: string, messages:any[]) {
    const messageObject = { message: messages };
    const serializeFireStoreObj = serializeForFirestore(messageObject);
    return from(this.firestore.collection('/register').doc(loggedId).collection('message').doc(receiverId).collection('chat collection').doc(receiverId).set(serializeFireStoreObj));
  }

  /**
   * Stores messages received from a user on the receiver's side.
   * @param senderId The ID of the logged-in user (sender).
   * @param receiverId The ID of the message receiver.
   * @param messages An array of messages to be stored.
   */
  recieverMessage(senderId: string, receiverUserId: string, messages:any[]) {
    const messageObject = { message: messages };
    const serializeFireStoreObj = serializeForFirestore(messageObject);
    return from(this.firestore.collection('/register').doc(receiverUserId).collection('message').doc(senderId).collection('chat collection').doc(senderId).set(serializeFireStoreObj));
  }

  /**
    * Retrieves the messages received by the logged-in user from a specific sender.
    * @param senderId The ID of the message sender.
    * @param receiverId The ID of the logged-in user (receiver).
    * @returns An Observable of the messages received.
    */
  getMessages(senderId: string, receiverUserId: string) {
    return this.firestore.collection('/register').doc(senderId).collection('message').doc(receiverUserId).collection('chat collection').doc(receiverUserId).valueChanges();
  }

  /**
  * Stores the last message sent by the logged-in user to a specific receiver.
  * @param senderId The ID of the logged-in user (sender).
  * @param receiverId The ID of the message receiver.
  * @param message The last message object to be stored.
  */
  storeLastMessage(senderId: string, receiverId: string, message: any) {
    const serializeFireStoreObj = serializeForFirestore(message);
    return from(this.firestore.collection('/register').doc(senderId).collection('message').doc(receiverId).set(serializeFireStoreObj));
  }

  /**
  * Retrieves the message collection of a specific user.
  * @param userId The ID of the user.
  * @returns An Observable of the message collection.
  */
  getUserMessageCollection(senderId: string) {
    return from(this.firestore.collection('/register').doc(senderId).collection('message').valueChanges());
  }

}
