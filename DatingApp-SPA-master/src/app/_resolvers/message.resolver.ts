import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { User } from '../_models/User';
import { Observable, of } from 'rxjs';
import { UserService } from '../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { PaginatedResult } from '../_models/pagination';
import { Message } from '../_models/Message';
import { AuthService } from '../_services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessageReslover implements Resolve<PaginatedResult<User[]>> {
  pageNumber = 1;
  pageSize = 10;
  messageContainer = 'Unread';
  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<PaginatedResult<Message[]>> {
    return this.userService
      .getMessages(
        this.authService.decodedToken.nameid,
        this.pageSize,
        this.pageNumber,
        this.messageContainer
      )
      .pipe(
        catchError(error => {
          this.alertifyService.error('Problem retrieving data');
          this.router.navigate(['/home']);
          return of(null);
        })
      );
  }
  /**
   *
   */
  constructor(
    private userService: UserService,
    private alertifyService: AlertifyService,
    private router: Router,
    private authService: AuthService
  ) {}
}
