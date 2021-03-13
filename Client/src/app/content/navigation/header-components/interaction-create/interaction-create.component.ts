import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-interaction-create',
  templateUrl: './interaction-create.component.html',
  styleUrls: ['./interaction-create.component.scss'],
})
export class InteractionCreateComponent implements OnInit {
  @Select(AppStore.getName)
  public route$: Observable<string>;

  @Select(AppStore.isProfile)
  public isProfile$: Observable<boolean>;

  constructor(public pService: PersonalizationService) {}

  ngOnInit(): void {}

  newButton() {
    this.pService.subject.next(true);
  }
}
