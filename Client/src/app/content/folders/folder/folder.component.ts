import { Component, OnInit, Input } from '@angular/core';
import { Folder } from '../models/folder';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {

  isHighlight = false;
  @Input() folder: Folder;

  constructor() { }

  ngOnInit(): void {
  }

  highlight() {
    this.isHighlight = !this.isHighlight;
  }

}
