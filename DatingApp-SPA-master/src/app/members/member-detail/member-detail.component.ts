import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models/User';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage } from '@kolkov/ngx-gallery';
import { AuthService } from 'src/app/_services/auth.service';
import {  TimeAgoPipe} from "time-ago-pipe";
@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}
  user: User;
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];

  configGalleryOptions() {
    this.galleryOptions = [
      { imageAutoPlay: true, imageAutoPlayPauseOnHover: true, previewAutoPlay: true, previewAutoPlayPauseOnHover: true },
      { breakpoint: 500, width: '300px', height: '300px', thumbnailsColumns: 3 },
      { breakpoint: 300, width: '100%', height: '200px', thumbnailsColumns: 2 }
      ];
  }

  configGalleryImages() {
    this.user.photos.forEach(p => {
      this.galleryImages.push({
        small: p.url,
        big: p.url,
        medium: p.url
      });
    });
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data.user;
      this.user = this.authService.initialUser(this.user);
      this.configGalleryOptions();
      this.configGalleryImages();
    });
  }
}
