import { Component, Input } from '@angular/core';
import { AudioService } from 'src/app/content/notes/audio.service';
import { AudioModel } from 'src/app/content/notes/models/content-model.model';

@Component({
  selector: 'app-audio-small',
  templateUrl: './audio-small.component.html',
  styleUrls: ['./audio-small.component.scss'],
})
export class AudioSmallComponent {
  @Input() audio: AudioModel;

  constructor(public audioService: AudioService) {}
}
