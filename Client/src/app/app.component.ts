import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'Client';

  activeMenu = false;

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
}
