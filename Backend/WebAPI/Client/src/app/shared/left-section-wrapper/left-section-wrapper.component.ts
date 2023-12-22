import { Component, Input } from '@angular/core';
import { PersonalizationService, sideBarCloseOpen } from '../services/personalization.service';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';

@Component({
  selector: 'app-left-section-wrapper',
  templateUrl: './left-section-wrapper.component.html',
  styleUrls: ['./left-section-wrapper.component.scss'],
  animations: [sideBarCloseOpen],
})
export class LeftSectionWrapperComponent {
  @Input() isProfileActive = false;

  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  constructor(public pService: PersonalizationService) {}
}
