import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { User } from '../_models/User';
import { Observable, of } from 'rxjs';
import { UserService } from '../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/UserParams';

@Injectable({
  providedIn: 'root'
})


export class ListsReslover implements Resolve<PaginatedResult<User[]>> {
  userParams: UserParams = { itemsPerPage: 5, pageNumber: 1, Likers: true };

  /**
   * resolver constructor
   */
  constructor(
    private userService: UserService,
    private alertifyService: AlertifyService,
    private router: Router
  ) {}
  resolve(
    route: ActivatedRouteSnapshot
  ): PaginatedResult<User[]> | Observable<PaginatedResult<User[]>> | Promise<PaginatedResult<User[]>> {
    return this.userService.getUsers(this.userParams).pipe(
      catchError(error => {
        this.alertifyService.error('Problem retrieving data');
        this.alertifyService.warning('please refresh page');
        this.router.navigate(['/home']);
        return of(null);
      })
    );
  }
}
