import { Component, Input } from '@angular/core';
import { PersonalizationService } from '../../services/personalization.service';

@Component({
  selector: 'app-nav-menu-item',
  templateUrl: './nav-menu-item.component.html',
  styleUrls: ['./nav-menu-item.component.scss'],
})
export class NavMenuItemComponent {
  @Input()
  routerLink?: string;

  @Input()
  navName?: string;

  @Input()
  count?: number;

  constructor(public pService: PersonalizationService) {}

  onClick(): void {
    this.pService.sideBarActive$.next(false);
  }
}
