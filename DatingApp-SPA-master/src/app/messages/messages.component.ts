import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import { AuthService } from '../_services/auth.service';
import { Route, ActivatedRoute } from '@angular/router';
import { PaginatedResult, Pagination } from '../_models/pagination';
import { Message } from '../_models/Message';
import { AlertifyService } from '../_services/alertify.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  messageContainer = 'Unread';
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private alertifyService: AlertifyService
  ) {}

  ngOnInit() {
    this.route.data.subscribe(
      (data: { messagePaginatedResult: PaginatedResult<Message[]> }) => {
        this.messages = data.messagePaginatedResult.result;
        this.pagination = data.messagePaginatedResult.pagination;
      }
    );
  }

  loadMessages() {
    this.userService
      .getMessages(
        this.authService.decodedToken.nameid,
        this.pagination.itemsPerPage,
        this.pagination.currentPage,
        this.messageContainer
      )
      .subscribe(
        response => {
          this.messages = response.result;
          this.pagination = response.pagination;
        },
        error => {
          this.alertifyService.error(error);
        }
      );
  }

  pageChanged(event: any) {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }

  deleteMessage(id: number) {
    this.alertifyService.confirm(
      'Are you sure you wont to delete the message',
      () => {
        this.userService
          .deleteMessage(id, this.authService.decodedToken.nameid)
          .subscribe(
            () => {
              this.messages.splice(
                this.messages.findIndex(m => m.id === id),
                1
              );
              this.alertifyService.success('message has been deleted');
            },
            error => {
              this.alertifyService.error(error);
            }
          );
      },
      () => {}
    );
  }
}
