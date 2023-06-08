import { Component, Input, OnInit } from '@angular/core';
import { AudiosCollection } from 'src/app/editor/entities/contents/audios-collection';
import { ContentModelBase } from 'src/app/editor/entities/contents/content-model-base';

@Component({
  selector: 'app-note-preview-audios',
  templateUrl: './note-preview-audios.component.html',
  styleUrls: ['./note-preview-audios.component.scss'],
})
export class NotePreviewAudiosComponent implements OnInit {

  _content: AudiosCollection;

  @Input() set content(value: ContentModelBase) {
    this._content = value as AudiosCollection;
  }
  
  ngOnInit(): void {}

  padTo2Digits(val) {
    return val.toString().padStart(2, '0');
  }

  audioDuration(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${this.padTo2Digits(minutes)}:${this.padTo2Digits(seconds)}`;
  }
}
