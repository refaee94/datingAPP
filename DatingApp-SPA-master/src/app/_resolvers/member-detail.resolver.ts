import {
  Resolve,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { User } from '../_models/User';
import { UserService } from '../_services/user.service';
import { Observable , of} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MemberDetailResolver implements Resolve<User> {
  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    return this.userService.getUser(route.params.id as number).pipe(
      catchError(error => {
        this.alertifyService.error('Problem retrieving data');
        this.router.navigate(['/members']);
        return of(null);
      })
    );
  }
  /**
   *
   */
  constructor(
    private userService: UserService,
    private router: Router,
    private alertifyService: AlertifyService
  ) {}
}
