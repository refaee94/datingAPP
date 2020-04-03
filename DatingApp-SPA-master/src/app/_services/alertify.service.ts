import { Injectable } from '@angular/core';
declare let alertify: any;
@Injectable({
  providedIn: 'root'
})
export class AlertifyService {
  constructor() {}

  confirm(message: string, okCallBack: () => any, cancelCallBack: () => any) {
    alertify.confirm(message, (e: any) => {
      if (e) {
        okCallBack();
      } else {
        cancelCallBack();
      }
    });
  }

  success(message: string) {
    alertify.success(message);
  }

  warning(message: string) {
    alertify.warning(message);
  }

  message(message: string) {
    alertify.message(message);
  }

  error(message: string) {
    alertify.error(message);
  }
}
