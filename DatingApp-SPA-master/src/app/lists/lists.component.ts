import { Component, OnInit } from '@angular/core';
import { User } from '../_models/User';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../_services/user.service';
import { AuthService } from '../_services/auth.service';
import { Pagination, PaginatedResult } from '../_models/pagination';
import { AlertifyService } from '../_services/alertify.service';
import { UserParams } from '../_models/UserParams';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
  users: User[];
  pagination: Pagination;
  userParams: UserParams = { Likers: true };
  likesParam = 'likers';
  constructor(
    private route: ActivatedRoute,
    private authSerivce: AuthService,
    private userService: UserService,
    private alertifyService: AlertifyService
  ) {}

  ngOnInit() {
    this.initialUsers();
  }

  initialUsers() {
    this.route.data.subscribe(
      (data: { paginatedResult: PaginatedResult<User[]> }) => {
        this.users = data.paginatedResult.result;
        this.pagination = data.paginatedResult.pagination;
        this.userParams.itemsPerPage = this.pagination.itemsPerPage;
        this.userParams.pageNumber = this.pagination.currentPage;
      }
    );
  }

  pageChanged(event: { page: number; itemsPerPage: number }) {
    this.loadUsers({
      pageNumber: event.page,
      itemsPerPage: event.itemsPerPage
    });
  }

  loadUsers(userParams?: UserParams) {
    if (this.likesParam === 'likees') {
      this.userParams.Likees = true;
      this.userParams.Likers = false;
    } else {
      this.userParams.Likers = true;
      this.userParams.Likees = false;
    }
    this.userService.getUsers(userParams).subscribe(
      response => {
        this.users = response.result;
        this.pagination = response.pagination;
      },
      error => {
        this.alertifyService.error(error);
      }
    );
  }
}
