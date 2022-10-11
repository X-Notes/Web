import {
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChildren,
  AfterViewInit,
} from '@angular/core';
import { PersonalizationService } from '../../../shared/services/personalization.service';
import { FullFolderNotesService } from '../full-folder/services/full-folder-notes.service';
import { EntitiesSizeENUM } from '../../../shared/enums/font-size.enum';

@Component({
  selector: 'app-full-folder-content',
  templateUrl: './full-folder-content.component.html',
  styleUrls: ['./full-folder-content.component.scss'],
})
export class FullFolderContentComponent implements AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @Input()
  folderId;

  @Input()
  userId;

  @Input()
  loaded = false;

  fontSize = EntitiesSizeENUM;

  constructor(public pService: PersonalizationService, public ffnService: FullFolderNotesService) {}

  ngAfterViewInit(): void {
    this.ffnService.murriInitialize(this.refElements);
  }
}
