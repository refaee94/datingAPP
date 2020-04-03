import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { User } from '../_models/User';
import { Observable, throwError, of, observable } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { PaginatedResult, Pagination } from '../_models/pagination';
import { UserParams } from '../_models/UserParams';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  requestOptions() {
    return {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      observe: 'response' as 'body'
    };
  }

  getUsers(userParams?: UserParams) {
    console.log(userParams);
    return this.http
      .get<HttpResponse<any>>(
        this.baseUrl +
          'users' +
          (userParams || userParams != null
            ? '?' +
              (userParams.pageNumber != null
                ? 'pageNumber=' + userParams.pageNumber + '&'
                : '') +
              (userParams.itemsPerPage != null
                ? 'pageSize=' + userParams.itemsPerPage + '&'
                : '') +
              (userParams.gender != null
                ? 'gender=' + userParams.gender + '&'
                : '') +
              (userParams.orderBy != null
                ? 'orderBy=' + userParams.orderBy + '&'
                : '') +
              (userParams.minAge != null
                ? 'minAge=' + userParams.minAge + '&'
                : '') +
              (userParams.maxAge != null ? 'maxAge=' + userParams.maxAge + '&' : '') +
              (userParams.Likees ? 'likees=' + userParams.Likees : '') +
              (userParams.Likers ? 'likers=' + userParams.Likers : '')
            : ''),
        this.requestOptions()
      )
      .pipe(
        map(response => {
          const paginatedResult = new PaginatedResult<User[]>();
          paginatedResult.pagination = JSON.parse(
            response.headers.get('Pagination')
          ) as Pagination;
          paginatedResult.result = response.body;
          return paginatedResult;
        }),
        catchError(this.handleError)
      );
  }

  sendLike(id: number, likeeId: number) {
    return this.http
      .post(this.baseUrl + 'users/' + id + '/like' + '/' + likeeId, {})
      .pipe(catchError(this.handleError));
  }

  getUser(id: number): Observable<User> {
    return this.http
      .get(this.baseUrl + 'users/' + id)
      .pipe(catchError(this.handleError)) as Observable<User>;
  }

  updateUser(id: number, user: User) {
    return this.http
      .put(this.baseUrl + 'users/' + id, user)
      .pipe(catchError(this.handleError));
  }

  setMainPhoto(userId: number, id: number) {
    return this.http
      .post(this.baseUrl + 'users/' + userId + '/photos/' + id + '/setMain', {})
      .pipe(catchError(this.handleError));
  }

  deletePhoto(userId: number, id: number) {
    return this.http
      .delete(this.baseUrl + 'users/' + userId + '/photos/' + id, {})
      .pipe(catchError(this.handleError));
  }

  private handleError(errorResponse: HttpErrorResponse) {
    if (errorResponse.status === 400) {
      return throwError(errorResponse.error);
    }
    const applicationError = errorResponse.headers.get('Application-Error');
    if (applicationError) {
      return throwError(applicationError);
    }
    const serverError = errorResponse.error.errors;
    if (serverError) {
      let modelStateError = '';
      for (const key in serverError) {
        if (serverError[key]) {
          modelStateError += serverError[key] + '\n';
        }
      }
      return throwError(modelStateError || 'Server Error');
    }
  }
}
