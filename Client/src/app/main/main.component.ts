import { Component, OnInit, HostListener, NgModule } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { User } from '../Models/User/User';
import { AuthService } from '../Services/auth.service';
import { UserService } from '../Services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@NgModule({
  imports: [BrowserAnimationsModule, BrowserModule]
})

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass'],
  animations: [
    trigger('slideInOut', [
      state('out', style({ height: '*' , overflow: 'hidden'})),
      transition('* => void', [
        style({ height: '*', overflow: 'hidden', 'background-color': '#FBFBFB' }),
        animate('300ms ease-in', style({ height: '0', borderRadius: '0px' }))
      ]),
      state('in', style({ height: '0' })),
      transition('void => *', [
        style({ height: '0', overflow: 'hidden'}),
        animate('300ms ease-out', style({ height: '*' , overflow: 'hidden'}))
      ])
    ])
  ]
})
export class MainComponent implements OnInit {
  title = 'Client';
  user: User;
  activeProfileMenu = false;
  activeNotificationMenu = false;
  activeInvitesMenu = false;
  activeMenu = false;
  unsubscribe = new Subject();

  constructor(private router: Router, private authService: AuthService, private userService: UserService) {

  }
  ngOnInit() {
    this.userService.Get()
    .pipe(takeUntil(this.unsubscribe))
    .subscribe(user => { this.user = user; }, error => {
      this.router.navigate(['/about']);
    });
  }
  DropMenu() {
    this.activeMenu = !this.activeMenu;
    const menu = document.getElementById('mobile-menu') as HTMLElement;
    if (this.activeMenu === true) {
      menu.classList.remove('display-none');
      menu.classList.add('display-active');
    } else {
      menu.classList.remove('display-active');
      menu.classList.add('display-none');
    }
  }
  GetUpdates() {
    this.userService.GetUpdates().subscribe(x => x, error => console.log(error));
  }
  isCurrentRouteRight(route: string) {
    return route && this.router.url.search(route) !== -1;
  }
  changeRoute(rout: string) {}

  openProfileDialog() {
    this.activeNotificationMenu = false;
    this.activeInvitesMenu = false;
    this.activeProfileMenu = !this.activeProfileMenu;
  }
  openNotificationDialog() {
    this.activeProfileMenu = false;
    this.activeInvitesMenu = false;
    this.activeNotificationMenu = !this.activeNotificationMenu;
  }
  openInvitesDialog() {
    this.activeProfileMenu = false;
    this.activeNotificationMenu = false;
    this.activeInvitesMenu = !this.activeInvitesMenu;
  }
  close() {
    this.activeProfileMenu = false;
    this.activeNotificationMenu = false;
    this.activeInvitesMenu = false;
  }
  exit() {
    this.authService.SignOut();
  }
}
