import { Component, OnInit } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Store, Select } from '@ngxs/store';
import { LabelStore } from '../state/labels-state';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
  animations: [ sideBarCloseOpen ],
})
export class LabelsComponent implements OnInit {

  @Select(LabelStore.countAll)
  countAll$: Observable<number>;

  @Select(LabelStore.countDeleted)
  countDeleted$: Observable<number>;

  theme = Theme;

  constructor(
    private store: Store,
    public pService: PersonalizationService) {}

  async ngOnInit() {
    this.pService.onResize();
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

}
