import { Component, OnInit } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  theme = Theme;
  innerNote = [
    'history', 'label', 'shared', 'copy', 'color', 'download', 'lock', 'archive', 'delete'
  ];

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
  }

}
