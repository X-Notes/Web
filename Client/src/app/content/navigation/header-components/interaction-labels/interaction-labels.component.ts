import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Select } from '@ngxs/store';
import { Theme } from 'src/app/shared/models/Theme';

@Component({
  selector: 'app-interaction-labels',
  templateUrl: './interaction-labels.component.html',
  styleUrls: ['./interaction-labels.component.scss'],
})
export class InteractionLabelsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  deleteAllLabels() {}
}
