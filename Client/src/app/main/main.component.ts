import {
  Component,
  OnInit,
  HostListener,
  NgModule,
  OnDestroy
} from '@angular/core';
import {
  trigger,
  transition,
  animate,
  style,
  state
} from '@angular/animations';
import { Router } from '@angular/router';
import { User } from '../Models/User/User';
import { AuthService } from '../Services/auth.service';
import { UserService } from '../Services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotesService } from '../Services/notes.service';


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

  activeProfileMenu = false;
  activeNotificationMenu = false;
  activeInvitesMenu = false;
  activeMenu = false;

  unsubscribe = new Subject();

  constructor(
    private router: Router,
    private userService: UserService,
    private notesService: NotesService
  ) {}

  ngOnInit() {
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
  isCurrentRouteRight(route: string) {
    return route && this.router.url.search(route) !== -1;
  }

  New() {
    this.notesService.newNote()
    .pipe(takeUntil(this.unsubscribe))
    .subscribe(
      x => {
        this.router.navigate(['/notes', x]);
      },
      error => console.log('error')
    );
  }

  openSidebar() {
    this.activeSidebar = !this.activeSidebar;
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
