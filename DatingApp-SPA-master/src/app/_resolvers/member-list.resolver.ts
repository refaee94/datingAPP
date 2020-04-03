import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { User } from '../_models/User';
import { Observable, of } from 'rxjs';
import { UserService } from '../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { PaginatedResult } from '../_models/pagination';

@Injectable({
  providedIn: 'root'
})
export class MemberListReslover implements Resolve<PaginatedResult<User[]>> {
  resolve(
    route: ActivatedRouteSnapshot
  ): PaginatedResult<User[]> | Observable<PaginatedResult<User[]>> | Promise<PaginatedResult<User[]>> {
    return this.userService.getUsers().pipe(
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
    private router: Router
  ) {}
}
