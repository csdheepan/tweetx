import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { MessageService } from 'src/app/core/services/message.service';
import { ErrorHandlerService } from 'src/app/shared/service/error-handler.service';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';
import { DateUtilsService } from 'src/app/shared/service/date-utils.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Chats, IChats, IMessage, ISignUp, Message } from 'src/app/core/model';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  profileImage: string = "assets/images/person.jpg";
  senderId !: string;
  receiverId !: string;
  messages: IChats[] = [];
  loggedUserDetails!: ISignUp;
  receiverDetails!: ISignUp;
  showEmojiPicker: boolean = false;
  form: FormGroup = Object.create(null);
  private subscriptions: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService,
    private store: InMemoryCache,
    private errorHandlerService: ErrorHandlerService,
    private dateUtilsService: DateUtilsService,
  ) { }

  ngOnInit(): void {
    // Subscribe to route query parameters to get receiver details and initiate message retrieval between sender and receiver.
    this.activatedRoute.queryParams.subscribe((params: any) => {
      this.receiverDetails = params;
      this.receiverId = this.receiverDetails.id
      this.profileImage = params.profileImg || this.profileImage;
    });
    this.loggedUserDetails = this.getUserDetails();
    this.senderId = this.loggedUserDetails.id;
    this.retrieveUserMessages();
    this.initForm();
  }

  // Retrieve logged in user details from session storage
  private getUserDetails(): ISignUp {
    const userDetails: string = this.store.getItem("USER_DETAILS");
    const userDetailsJson = userDetails ? JSON.parse(userDetails) : null;
    return userDetailsJson
  }

  // Retrieve messages between logged in user and receiver
  private retrieveUserMessages(): void {
    const messageSubscription = this.messageService.getMessages(this.senderId, this.receiverId)
      .pipe(take(1))
      .subscribe(
        (receiverData: any) => {
          this.messages = receiverData ? receiverData.message : [];
          this.updateMessageStatuses('received');
        },
        (err: any) => {
          this.errorHandlerService.handleErrors(err, "while fetching users messages");
        }
      );
    this.subscriptions.push(messageSubscription);
  }

  initForm(): void {
    this.form = this.fb.group({
      "messageInput": [null]
    });
  }

  /**
   * Send a message from logged in user to receiver
   * The message is saved with both sender and receiver IDs under chat collection
   */
  sendMessage(): void {
    if (this.form.controls['messageInput'].value != "") {

      const newMessage = this.createMessage();
      // change Instance class of object to plain js object for restrict firestore error
      const serializeObject = Object.assign({},newMessage)
      this.messages.push(serializeObject);

      this.messageService.senderMessage(this.senderId, this.receiverId, this.messages)
        .subscribe(
          (data: any) => {
            console.log("Message sent successfully");
            this.form.controls['messageInput'].patchValue("");
          },
          (err: any) => {
            this.errorHandlerService.handleErrors(err, "while saving user message");
          }
        );

      this.messageService.recieverMessage(this.senderId, this.receiverId, this.messages)
        .subscribe(
          (data: any) => {
            console.log("Message received by receiver");
            this.updateMessageStatuses('received');
          },
          (err: any) => {
            this.errorHandlerService.handleErrors(err, "while saving receiver message");
          }
        );
      this.storeLastMessage(newMessage);

      this.form.reset();
    }
  }

  // Store last sent message in a collection
  private storeLastMessage(lastMessage: Chats): void {

    const trimmedContent = this.trimContent(lastMessage.content);
    const collection = this.buildMessagePayload(trimmedContent, lastMessage);

    this.messageService.storeLastMessage(this.senderId, this.receiverId, collection).subscribe((data: any) => { },
      (err: any) => {
        this.errorHandlerService.handleErrors(err, "while saving last chat message");
      })
  }

  private trimContent(content: string): string {
    return content.length > 25 ? `${content.substring(0, 24)}...` : content;
  }

  private buildMessagePayload(trimmedContent: string, lastMessage: any): IMessage {
    return new Message({
      profileImg: this.receiverDetails.profileImg,
      name: this.receiverDetails.name,
      chat: { ...lastMessage, content: trimmedContent },
      receiverId: this.receiverId
    })
  }

  // Create a new message object
  private createMessage(): IChats {
    const formattedDateTime = this.dateUtilsService.getCurrentFormattedDateTime();
    return new Chats({
      content: this.form.controls['messageInput'].value,
      senderId: this.loggedUserDetails.id,
      receiverId: this.receiverDetails.id,
      timestamp: formattedDateTime.formattedTime,
      date: formattedDateTime.formattedDate,
      status: 'sent'
    });
  }

  // Update message statuses based on the received timestamp
  private updateMessageStatuses(newStatus: any): void {
    this.messages.forEach(message => {
      message.status = newStatus;
    });
  }

  //To toggle show and hide emoji.
  toggleEmojiPicker(): void {
    this.showEmojiPicker = this.dateUtilsService.toggleEmojiPicker(this.showEmojiPicker);
  }

  // Insert selected emoji into message input.
  insertEmoji(event: any): void {
    this.dateUtilsService.insertEmoji(event, this.form.controls['messageInput']);
    this.showEmojiPicker = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
