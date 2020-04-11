import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable()
export class ErrorInterceprtor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(errorResponse => {
        if (errorResponse instanceof HttpErrorResponse) {
          if (errorResponse.headers) {
            const applicationError = errorResponse.headers.get(
              'Application-Error'
            );
            if (applicationError) {
              return throwError(applicationError);
            }
          }
          if (errorResponse.error) {
            const serverError = errorResponse.error;
            let modelStateError;
            if (serverError && typeof serverError === 'object') {
              modelStateError = '';
              for (const key in serverError) {
                if (serverError[key]) {
                  modelStateError += serverError[key] + '\n';
                }
              }
            }
            return throwError(modelStateError || serverError || 'Server Error');
          }
        }
      })
    );
  }
}

export const ErrorInterceprtorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ErrorInterceprtor,
  multi: true
};
