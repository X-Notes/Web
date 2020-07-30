import { Component, OnInit } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';



@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
  animations: [ sideBarCloseOpen ],
})
export class LabelsComponent implements OnInit {

  theme = Theme;

  constructor(public pService: PersonalizationService) {}

  async ngOnInit() {
    this.pService.onResize();
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

}
