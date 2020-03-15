import { Component, OnInit, HostListener, NgModule, OnDestroy, Output, EventEmitter } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { User } from '../Models/User/User';
import { UserService } from '../Services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotesService } from '../Services/notes.service';
import { AuthService } from '../Services/auth.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.sass'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ height: '0' })),
      transition('void => *', [
        style({ height: '0', overflow: 'hidden' }),
        animate('300ms ease-in-out', style({ height: '*' }))
      ]),
      state('out', style({ height: '*' })),
      transition('* => void', [
        style({ height: '*', opacity: 0 }),
        animate('300ms ease-in-out', style({ height: '0' }))
      ])
    ]),
    trigger('sidebarCloseOpen', [
      state('out', style({ transform: 'translateX(0)' })),
      transition('void => *', [
        style({ transform: 'translateX(-100%)' }),
        animate('200ms ease-in-out')
      ]),
      transition('* => void', [
        animate('200ms ease-in-out', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})
export class MainComponent implements OnInit, OnDestroy {
  title = 'Client';
  user: User;

  activeSidebar = true;
  loading = true;
  activeProfileMenu = false;
  activeNotificationMenu = false;
  activeInvitesMenu = false;
  activeMenu = false;

  unsubscribe = new Subject();

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private notesService: NotesService,
  ) {
    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event);
    });
  }

  ngOnInit() {
    this.mobileSideBar();
    this.userService
      .Get()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        user => {
          this.user = user;
        },
        error => {
          this.router.navigate(['/about']);
        }
      );
  }
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.loading = true;
    }
    if (event instanceof NavigationEnd) {
      if( this.isCurrentRouteRight('profile') === true) {
        setTimeout(() => {
          this.loading = false;
        }, 8000);
      } else {
        this.loading = false;
      }
    }
    if (event instanceof NavigationCancel) {
      setTimeout(() => { 
        this.loading = false;
      }, 2000);
    }
    if (event instanceof NavigationError) {
      setTimeout(() => { 
        this.loading = false;
      }, 2000);
    }
  }
  isCurrentRouteRight(route: string) {
    return route && this.router.url.search(route) !== -1;
  }

  New() {
    this.notesService.newNote().subscribe(
      x => {
        this.router.navigate(['/notes', x]);
      },
      error => console.log('error')
    );
  }

  openSidebar() {
    this.activeSidebar = !this.activeSidebar;
    const thx = document.getElementsByClassName('wrapper')[0];
    const notes = document.getElementsByClassName('wrapper-main')[0];
    const body = document.getElementsByTagName('body')[0].clientWidth;
    if (this.activeSidebar === false) {
      thx.getElementsByTagName('main')[0].style.marginLeft = '0px';
      if( body > 767) {
        notes.classList.add('wrapper-more');
      }
      else {
        notes.classList.remove('wrapper-more');
      }
    } else {
      thx.getElementsByTagName('main')[0].style.marginLeft = '200px';
      notes.classList.remove('wrapper-more');
    }
  }
  mobileSideBar() {
    const body = document.getElementsByTagName('body')[0].clientWidth;
    if(body < 767) {
      this.activeSidebar = false;
    }
  }
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
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.unsubscribe();
  }
}
