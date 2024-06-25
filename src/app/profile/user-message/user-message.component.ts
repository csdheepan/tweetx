import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/core/services/message.service';
import { InMemoryCache } from 'src/app/shared/service/memory-cache.service';

@Component({
  selector: 'app-user-message',
  templateUrl: './user-message.component.html',
  styleUrls: ['./user-message.component.scss']
})
export class UserMessageComponent implements OnInit {

  messages: any[] = [];
  showNoMessage: boolean = false;

  constructor(
    private messageService: MessageService,
    private store: InMemoryCache,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userDetailsJson: string = this.store.getItem("USER_DETAILS");
    const userDetails = userDetailsJson ? JSON.parse(userDetailsJson) : null;

     // Fetch user's message collection from the service
    if (userDetails && userDetails.id) {
      this.messageService.getUserMessageCollection(userDetails.id).subscribe((data: any) => {
        const messageCollection = data;
        this.processMessages(messageCollection);
      });
    } else {
      this.showNoMessage = true;
    }
  }

  navigateAllUsers(): void {
    this.router.navigate(['profile/full/users']);
  }

// Process message collection to extract required fields
  processMessages(messageCollection: any[]): void {
    this.messages = messageCollection.map((message: any) => ({
      profileImg: message.profileImg,
      name: message.name,
      content: message.chat.content,
      date: message.chat.date,
      timestamp: message.chat.timestamp,
      receiverId: message.receiverId
    }));
    this.showNoMessage = this.messages.length === 0; // Display no messages found message if user details are not available
  }

  // Open message view for a specific user
  openMessage(user: any): void {
    this.router.navigate(['profile/full/message'], {
      queryParams: {
        id: user.receiverId,
        name: user.name,
        profileImg: user.profileImg,
        emailId: '',
        password: ''
      }
    });
  }
}
