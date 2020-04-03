import { Component, OnInit } from '@angular/core';
import { AuthService } from './_services/auth.service';
import { User } from './_models/User';
import { UserService } from './_services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}
  title = 'DatingAppSPA';

  ngOnInit(): void {
    this.authService.decodedToken = this.authService.jwtHelper.decodeToken(
      localStorage.getItem('token')
    );
    this.userService
      .getUser(this.authService.decodedToken.nameid)
      .subscribe(user => {
        if (user) {
          this.authService.changeCurrentUser(
            this.authService.initialUser(user)
          );
          this.authService.currentUserObservable.subscribe(
            u => (this.authService.currentUser = u)
          );
        }
      });
  }
}
