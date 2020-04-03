import { Component, OnInit } from '@angular/core';
import { UserService } from '../../_services/user.service';
import { AlertifyService } from '../../_services/alertify.service';
import { User } from '../../_models/User';
import { ActivatedRoute } from '@angular/router';
import { PaginatedResult, Pagination } from 'src/app/_models/pagination';
import { AuthService } from 'src/app/_services/auth.service';
import { UserParams } from 'src/app/_models/UserParams';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  users: User[];
  pagination: Pagination;
  genderList = [
    { value: 'male', display: 'Males' },
    { value: 'female', display: 'Females' }
  ];
  userParams: UserParams = { minAge: 18, maxAge: 99, orderBy: 'lastActive' };
  currentUser: User = {};

  constructor(
    private userService: UserService,
    private alertifyService: AlertifyService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUserObservable.subscribe(user => {
      this.currentUser = user;
      this.userParams.gender =
      this.currentUser.gender === 'male' ? 'female' : 'male';
    });
    this.initialUsers();
  }
  filterUsers() {
    this.loadUsers(this.userParams);
  }

  loadUsers(userParams?: UserParams) {
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

  resetFilters() {
    this.userParams.gender =
      this.currentUser.gender === 'male' ? 'female' : 'male';
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.userParams.orderBy = 'lastActive';
    this.filterUsers();
  }

  pageChanged(event: { page: number; itemsPerPage: number }) {
    this.loadUsers({
      pageNumber: event.page,
      itemsPerPage: event.itemsPerPage
    });
  }

  initialUsers() {
    this.route.data.subscribe(
      (data: { paginatedResult: PaginatedResult<User[]> }) => {
        this.users = data.paginatedResult.result;
        this.pagination = data.paginatedResult.pagination;
      }
    );
  }
}
