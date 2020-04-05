import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';
import { User } from '../_models/User';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};
  user: User;
  constructor(
    public authService: AuthService,
    private alertifyService: AlertifyService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUserObservable.subscribe(user => {
      this.user = user;
    });
    this.router.navigateByUrl('/members');
    
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  login() {
    this.authService.login(this.model).subscribe(
      data => {
        this.alertifyService.success('logged in successfully');
      },
      error => {
        this.alertifyService.error('Faild to log in');
      },
      () => {
        this.router.navigate(['/members']);
      }
    );
  }

  logout() {
    this.authService.userToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.alertifyService.message('looged out');
    this.router.navigate(['/home']);
  }
}
