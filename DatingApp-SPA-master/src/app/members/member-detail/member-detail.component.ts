import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/_models/User';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from '@kolkov/ngx-gallery';
import { AuthService } from 'src/app/_services/auth.service';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {

  @ViewChild('memberTabs',{static:true}) memberTabs: TabsetComponent;
 user: User;
  galleryOptions: NgxGalleryOptions[] ;
  galleryImages: NgxGalleryImage[]=[] ;
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private alertifyService: AlertifyService
  ) {}





  configGalleryImages() {
    this.user.photos.forEach(p => {
      console.log(p.url)
      this.galleryImages.push({
        small: p.url,
        big: p.url,
        medium: p.url
      });
    });
  }

  selectTab(tabId: number){
    this.memberTabs.tabs[tabId].active = true;
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data.user;
      this.user = this.authService.initialUser(this.user);

    });
  this.route.queryParams.subscribe(params =>
      {
        this.selectTab(params.tab > 0 ? params.tab : 0 );
      });

      this.configGalleryImages();

  this.galleryOptions = [
      {
        width: '600px',
        height: '400px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide
      },
      ];

  }
  sendLike(id: number) {
    this.userService
      .sendLike(this.authService.decodedToken.nameid, id)
      .subscribe(
        () => {
          this.alertifyService.success('You have liked: ' + this.user.knownAs);
        },
        error => {
          this.alertifyService.error(error);
        }
      );
  }
}
