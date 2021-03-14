import { Component, OnInit } from '@angular/core';
import {
  PersonalizationService,
  sideBarCloseOpen,
} from 'src/app/shared/services/personalization.service';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user';
import { LabelStore } from '../state/labels-state';

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
  animations: [sideBarCloseOpen],
})
export class LabelsComponent implements OnInit {
  @Select(LabelStore.countAll)
  countAll$: Observable<number>;

  @Select(LabelStore.countDeleted)
  countDeleted$: Observable<number>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<ShortUser>;

  public photoError = false;

  constructor(public pService: PersonalizationService) {}

  async ngOnInit() {
    this.pService.onResize();
  }

  changeSource() {
    this.photoError = true;
  }
}
