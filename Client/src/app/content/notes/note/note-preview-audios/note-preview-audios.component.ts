import { Component, Input } from '@angular/core';
import { AudioModel } from '../../models/editor-models/audios-collection';
import { BaseCollection } from '../../models/editor-models/base-collection';

@Component({
  selector: 'app-note-preview-audios',
  templateUrl: './note-preview-audios.component.html',
  styleUrls: ['./note-preview-audios.component.scss'],
})
export class NotePreviewAudiosComponent {
  @Input()
  content: BaseCollection<AudioModel>;
}
