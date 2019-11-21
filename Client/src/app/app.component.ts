import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'Client';

  activeMenu = false;

  noteImage = 'assets/menu/note.svg';
  nootImage = 'assets/menu/noots.svg';
  labelsImage = 'assets/menu/labels.svg';
  peopleImage = 'assets/menu/people.svg';
  groupImage = 'assets/menu/groups.svg';
  binImage = 'assets/menu/bin.svg';
  invitesImage = 'assets/menu/invites.svg';

  ColornoteImage = 'assets/colorfull-menu/note.svg';
  ColornootImage = 'assets/colorfull-menu/noots.svg';
  ColorlabelsImage = 'assets/colorfull-menu/labels.svg';
  ColorpeopleImage = 'assets/colorfull-menu/people.svg';
  ColorgroupImage = 'assets/colorfull-menu/groups.svg';
  ColorbinImage = 'assets/colorfull-menu/bin.svg';
  ColorinvitesImage = 'assets/colorfull-menu/invites.svg';

  constructor(private router: Router) {

  }
  ngOnInit() {
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
}
