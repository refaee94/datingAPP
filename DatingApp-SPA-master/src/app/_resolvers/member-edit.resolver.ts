import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { User } from '../_models/User';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';
import { Observable, of } from 'rxjs';
import { UserService } from '../_services/user.service';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MemberEditResolver implements Resolve<User> {
  resolve(route: ActivatedRouteSnapshot): User | Observable<User> | Promise<User> {
    return this.userService.getUser(this.authService.decodedToken.nameid as number).pipe(catchError(
      () => {
        this.alertifyService.error('Problem retrieving data');
        this.router.navigate(['/members']);
        return of(null);
      }
    ));
  }

  /**
   *
   */
  constructor(
    private alertifyService: AlertifyService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}
}
