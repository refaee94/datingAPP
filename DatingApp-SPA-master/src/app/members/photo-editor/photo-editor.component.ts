import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Photo } from 'src/app/_models/Photo';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() photos: Photo[];
  uploader: FileUploader;
  baseUrl = environment.apiUrl;
  afuConfig: any;
  resetVar: boolean;

  public hasBaseDropZoneOver = false;

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertifyService: AlertifyService
  ) {}

  ngOnInit() {
    this.initializeUploader();
  }
  public initializeUploader() {
    this.uploader = new FileUploader({
      url:
        this.baseUrl +
        'users/' +
        this.authService.decodedToken.nameid +
        '/photos',
      authToken: 'Bearer ' + localStorage.getItem('token'),
      allowedFileType: ['image'],
      isHTML5: true,
      autoUpload: false,
      removeAfterUpload: true,
      maxFileSize: 10 * 1024 * 1024,
      method: 'POST'
    });
    this.uploader.onSuccessItem = (item, response) => {
      if (response) {
        this.photos.push(JSON.parse(response) as Photo);
        this.authService.changePhotosForCurrentUser(this.photos);
      }
    };
  }

  setMainPhoto(photo: Photo) {
    this.userService
      .setMainPhoto(this.authService.decodedToken.nameid as number, photo.id)
      .subscribe(
        response => {
          this.photos.forEach(p => {
            if (p.isMain) {
              p.isMain = false;
            }
          });
          photo.isMain = true;
          this.alertifyService.success(JSON.stringify(response));
          this.authService.changePhotosForCurrentUser(this.photos);
        },
        error => {
          this.alertifyService.error(error);
        }
      );
  }

  deletePhoto(photo: Photo) {
    this.alertifyService.confirm('Are you sure you want to delele this. photo', () => {
      this.userService.deletePhoto(this.authService.decodedToken.nameid, photo.id)
      .subscribe(response => {
        this.photos.splice(this.photos.findIndex(p => p.id === photo.id), 1);
        this.authService.changePhotosForCurrentUser(this.photos);
        this.alertifyService.success('photo has been deleted');
      }, error => {
        this.alertifyService.error(error);
      });
    }, () => {});
  }
}
