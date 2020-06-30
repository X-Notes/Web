import { Component, OnInit } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  check = true;
  theme = Theme;

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
  }

  toggle() {
    this.check = !this.check;
  }

}
