import { Component, Input, OnInit } from '@angular/core';
import { AudioModel } from '../../models/editor-models/audios-collection';
import { BaseCollection } from '../../models/editor-models/base-collection';

@Component({
  selector: 'app-note-preview-audios',
  templateUrl: './note-preview-audios.component.html',
  styleUrls: ['./note-preview-audios.component.scss'],
})
export class NotePreviewAudiosComponent implements OnInit {
  @Input()
  content: BaseCollection<AudioModel>;

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
