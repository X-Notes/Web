import { Component, OnInit } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/enums/Theme';
import { SignalRService } from 'src/app/core/signal-r.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {

  theme = Theme;

  constructor(public pService: PersonalizationService, private signal: SignalRService) { }

  ngOnInit(): void {
  }

}
