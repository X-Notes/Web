import { Component, Input } from '@angular/core';
import { PersonalizationService, sideBarCloseOpen } from '../services/personalization.service';

@Component({
  selector: 'app-left-section-wrapper',
  templateUrl: './left-section-wrapper.component.html',
  styleUrls: ['./left-section-wrapper.component.scss'],
  animations: [sideBarCloseOpen],
})
export class LeftSectionWrapperComponent {
  @Input() isProfileActive = false;

  constructor(public pService: PersonalizationService) {}
}
