import { Component, Input, OnInit } from '@angular/core';
import { AudioService } from 'src/app/content/notes/audio.service';
import { AudioModel } from 'src/app/content/notes/models/editor-models/audios-collection';

@Component({
  selector: 'app-audio-small',
  templateUrl: './audio-small.component.html',
  styleUrls: ['./audio-small.component.scss'],
})
export class AudioSmallComponent implements OnInit {
  @Input() audio: AudioModel;

  constructor(public audioService: AudioService) {}

  ngOnInit() {}
}
