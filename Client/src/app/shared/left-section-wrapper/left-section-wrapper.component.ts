import { Component, OnInit } from '@angular/core';
import { PersonalizationService, sideBarCloseOpen } from '../services/personalization.service';

@Component({
  selector: 'app-left-section-wrapper',
  templateUrl: './left-section-wrapper.component.html',
  styleUrls: ['./left-section-wrapper.component.scss'],
  animations: [sideBarCloseOpen],
})
export class LeftSectionWrapperComponent implements OnInit {
  constructor(public pService: PersonalizationService) {}

  ngOnInit(): void {}
}
