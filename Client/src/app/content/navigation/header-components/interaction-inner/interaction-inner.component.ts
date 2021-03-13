import { AfterViewInit, ElementRef, Renderer2, ViewChild, Component, OnInit } from '@angular/core';

import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FullNote } from 'src/app/content/notes/models/fullNote';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import {
  PersonalizationService,
  showMenuLeftRight,
} from 'src/app/shared/services/personalization.service';
import { MenuButtonsService } from '../../menu-buttons.service';

@Component({
  selector: 'app-interaction-inner',
  templateUrl: './interaction-inner.component.html',
  styleUrls: ['./interaction-inner.component.scss'],
  animations: [showMenuLeftRight],
})
export class InteractionInnerComponent implements OnInit, AfterViewInit {
  user: string[] = [
    'person',
    'person',
    'person',
    'person',
    'person',
    'person',
    'person',
    'person',
    'person',
  ];

  @Select(NoteStore.oneFull)
  note$: Observable<FullNote>;

  @ViewChild('heightPeople') heightPeople: ElementRef;

  @ViewChild('scrollbar') scrollbar: ElementRef;

  constructor(
    public pService: PersonalizationService,
    public renderer: Renderer2,
    public buttonService: MenuButtonsService,
  ) {}

  ngAfterViewInit(): void {
    this.setHeightScrollbar();
  }

  ngOnInit(): void {}

  closeMenu(): void {
    console.log(this.pService.checkWidth());
    if (this.pService.checkWidth()) {
      this.pService.users = false;
    }

    if (!this.pService.check()) {
      this.pService.hideInnerMenu = false;
    }
  }

  hideMenu() {
    this.pService.hideInnerMenu = !this.pService.hideInnerMenu;
  }

  setHeightScrollbar(): void {
    if (this.pService.users) {
      this.pService.checkWidth()
        ? this.renderer.setStyle(
            this.scrollbar.nativeElement,
            'height',
            `${this.heightPeople.nativeElement.clientHeight}px`,
          )
        : this.renderer.setStyle(this.scrollbar.nativeElement, 'height', '100%');
    }
  }

  showUsers() {
    this.pService.users = !this.pService.users;
    setTimeout(() => this.setHeightScrollbar());
  }

  disableTooltpUser(): boolean {
    if (this.pService.checkWidth()) {
      return true;
    }
  }
}
