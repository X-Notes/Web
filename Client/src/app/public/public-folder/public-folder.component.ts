import { Component, OnInit } from '@angular/core';
import { DeltaConverter } from '../../content/notes/full-note/content-editor/converter/delta-converter';

@Component({
  selector: 'app-public-folder',
  templateUrl: './public-folder.component.html',
  styleUrls: ['./public-folder.component.scss'],
})
export class PublicFolderComponent implements OnInit {
  async ngOnInit(): Promise<void> {
    DeltaConverter.initQuill();
  }
}
