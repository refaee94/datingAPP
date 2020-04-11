import { Message } from 'src/app/_models/Message';
import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/_models/User';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @Input() user: User;
  messages: Message[];
  newMessage: Message = {};
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertifyService: AlertifyService
  ) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.userService
      .getMessagesThread(this.authService.decodedToken.nameid, this.user.id)
      .pipe(map( (ms: Message[]) => {
        ms.forEach(m => {
          if (!m.isRead && m.recipientId === +this.authService.decodedToken.nameid) {
            this.markMessageAsRead(m.id);
            m.isRead = true;
          }
        });
        return ms;
      }))
      .subscribe(
        response => {
          this.messages = response;
        },
        error => {
          this.alertifyService.error(error);
        }
      );
  }

  sendMessage() {
    this.newMessage.recipientId = this.user.id;
    this.userService
      .sendMessage(this.authService.decodedToken.nameid, this.newMessage)
      .subscribe(
        response => {
          this.messages.unshift(response);
          this.newMessage.content = '';
        },
        error => {
          this.alertifyService.error(error);
        }
      );
  }

  markMessageAsRead(id: number) {
    this.userService
      .markMessageAsRead(id, this.authService.decodedToken.nameid)
      .subscribe(() => {}, () => {});
  }
}
