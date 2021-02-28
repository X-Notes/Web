import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ShortUser } from 'src/app/core/models/short-user';
import { UserStore } from 'src/app/core/stateUser/user-state';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Input() size: number;

  @HostBinding('style.--target-color')
  @Input() color: string;

  constructor() { }

  ngOnInit(): void {
  }

}
