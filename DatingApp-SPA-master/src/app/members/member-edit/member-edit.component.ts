import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/_models/User';
import { NgForm } from '@angular/forms';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') editFrom: NgForm;
  user: User;
  constructor(
    private route: ActivatedRoute,
    private alertifyService: AlertifyService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.authService.currentUserObservable.subscribe(user => {
      this.user = user;
    });
    // this.route.data.subscribe(data => {
    //   this.user = data.user;
    // });
  }

  updateUser() {
    this.userService
      .updateUser(this.authService.decodedToken.nameid as number, this.user)
      .subscribe(
        () => {
          this.alertifyService.success('update profile successfully');
          this.editFrom.reset(this.user);
        },
        error => {
          this.alertifyService.error(error);
        }
      );
  }
}
