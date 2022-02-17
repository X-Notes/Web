import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-nav-menu-item',
  templateUrl: './nav-menu-item.component.html',
  styleUrls: ['./nav-menu-item.component.scss'],
})
export class NavMenuItemComponent {
  @Input()
  routerLink: string;

  @Input()
  navName: string;

  @Input()
  count: number;
}
