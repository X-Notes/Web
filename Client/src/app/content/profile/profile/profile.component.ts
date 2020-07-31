import { Component, OnInit } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [ sideBarCloseOpen ]
})
export class ProfileComponent implements OnInit {

  check = true;
  theme = Theme;
  items: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 , 12, 13];

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
    this.pService.onResize();
  }

  toggle() {
    this.check = !this.check;
  }
}
