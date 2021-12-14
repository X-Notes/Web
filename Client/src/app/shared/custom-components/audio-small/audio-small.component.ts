import { Component, Input, OnInit } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { AudioService } from 'src/app/content/notes/audio.service';
import { AudioModel } from 'src/app/content/notes/models/editor-models/audios-collection';

@Component({
  selector: 'app-audio-small',
  templateUrl: './audio-small.component.html',
  styleUrls: ['./audio-small.component.scss'],
})
export class AudioSmallComponent implements OnInit {
  @Input() audio: AudioModel;

  metadataParsed: Record<string, SafeUrl> = {
    duration: '',
    imageUrl: '',
  };

  constructor(public audioService: AudioService) {}

  async ngOnInit(): Promise<void> {
    this.metadataParsed = await this.audioService.getMetadata(this.audio.audioPath);
  }
}
