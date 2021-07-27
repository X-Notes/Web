import { Component, Input, OnInit } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SmallNote } from '../../models/small-note.model';

@Component({
  selector: 'app-left-section-content',
  templateUrl: './left-section-content.component.html',
  styleUrls: ['./left-section-content.component.scss'],
})
export class LeftSectionContentComponent implements OnInit {
  @Input()
  public notesLink: SmallNote[];

  constructor(public pService: PersonalizationService) {}

  ngOnInit(): void {}
}
