import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'Client';

  activeMenu = false;

  noteImage = 'assets/menu/note.svg';
  nootImage = 'assets/colorfull-menu/noots.svg';
  labelsImage = 'assets/menu/labels.svg';
  peopleImage = 'assets/menu/people.svg';
  groupImage = 'assets/menu/groups.svg';
  binImage = 'assets/menu/bin.svg';
  invitesImages = 'assets/menu/invites.svg';

  constructor() {

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
}
