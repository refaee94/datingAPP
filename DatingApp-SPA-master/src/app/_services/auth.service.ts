import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs/internal/observable/throwError';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../_models/User';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Photo } from '../_models/Photo';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}
  photoUrl = new BehaviorSubject<string>('');
  baseUrl = environment.apiUrl + 'auth/';
  userToken: any;
  jwtHelper = new JwtHelperService();
  decodedToken: any;
  private userBehaviorSubject = new BehaviorSubject<User>(null);
  currentUserObservable: Observable<
    User
  > = this.userBehaviorSubject.asObservable();
  currentUser: User = {} as User;

  changeCurrentUser(user: User) {
    this.currentUser = user;
    this.changePhotosForCurrentUser(user.photos);
  }
  changePhotosForCurrentUser(photos: Photo[]) {
    this.currentUser.photos = photos;
    this.userBehaviorSubject.next(this.initialUser(this.currentUser));
    // localStorage.setItem('user', JSON.stringify(this.currentUser));
  }

  initialUser(user: User) {
    if (user) {
      if (user.photos) {
        const mainPhoto = user.photos.find(p => p.isMain === true);
        if (mainPhoto) {
          user.mainPhotoUrl = mainPhoto.url;
        }
      }
      if (!user.mainPhotoUrl) {
        user.mainPhotoUrl = '../../assets/116 user.png';
      }
      return user;
    } else {
      return { mainPhotoUrl: '../../assets/116 user.png' } as User;
    }
  }

  login(model: any) {
    return this.http
      .post(this.baseUrl + 'login', model, this.requestOptions())
      .pipe(
        map((response: any) => {
          if (response) {
            localStorage.setItem('token', response.tokenString);
            // localStorage.setItem('user', JSON.stringify(response.user));
            this.userToken = response.tokenString;
            const user = response.user as User;
            this.changeCurrentUser(this.initialUser(user));
            this.decodedToken = this.jwtHelper.decodeToken(this.userToken);
          }
        })
      );
  }

  reigster(user: User) {
    return this.http.post(
      this.baseUrl + 'register',
      user,
      this.requestOptions()
    );
  }

  requestOptions() {
    return {
      headers: new HttpHeaders({ 'Content-type': 'application/json' })
    };
  }

  loggedIn() {
    return !this.jwtHelper.isTokenExpired(localStorage.getItem('token'));
  }
}
