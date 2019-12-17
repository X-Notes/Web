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
        style({ height: '*', overflow: 'hidden', borderRadius: '0px', 'background-color': '#FBFBFB' }),
        animate('3000ms ease-in', style({ height: '0', borderRadius: '0px' }))
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
  activeMenu = false;
  unsubscribe = new Subject();
  update = false;

  noteImage = 'assets/menu/note.svg';
  nootImage = 'assets/menu/noots.svg';
  labelsImage = 'assets/menu/labels.svg';
  peopleImage = 'assets/menu/people.svg';
  groupImage = 'assets/menu/groups.svg';
  binImage = 'assets/menu/bin.svg';
  invitesImage = 'assets/menu/invites.svg';
  dot = 'assets/under-menu/dot.svg';
  subscribes = 'assets/under-menu/subscribes.svg';

  ColorSubscribes = 'assets/colorfull-menu/subscribes.svg';
  Colorfulldot = 'assets/under-menu/colorful-dot.svg';
  ColornoteImage = 'assets/colorfull-menu/note.svg';
  ColornootImage = 'assets/colorfull-menu/noots.svg';
  ColorlabelsImage = 'assets/colorfull-menu/labels.svg';
  ColorpeopleImage = 'assets/colorfull-menu/people.svg';
  ColorgroupImage = 'assets/colorfull-menu/groups.svg';
  ColorbinImage = 'assets/colorfull-menu/bin.svg';
  ColorinvitesImage = 'assets/colorfull-menu/invites.svg';

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

    const menu = document.getElementsByTagName('aside')[0] as HTMLElement;
    if (this.activeMenu === true) {
      menu.style.display = 'block';
    } else {
      menu.style.display = 'none';
    }
  }

  @HostListener('window:resize', ['$event']) onresize(event) {
    if (event.target.innerWidth < 1100 && event.target.innerWidth > 991) {
      const menu = document.getElementsByTagName('aside')[0] as HTMLElement;
      menu.style.display = 'block';
    }
  }
  isCurrentRouteRight(route: string) {
    return route && this.router.url.search(route) !== -1;
  }
  changeRoute(rout: string) {}

  openDialog() {
    this.activeProfileMenu = !this.activeProfileMenu;
  }
  close() {
    this.activeProfileMenu = false;
  }
  exit() {
    this.authService.SignOut();
  }
}
