import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-audio-small',
  templateUrl: './audio-small.component.html',
  styleUrls: ['./audio-small.component.scss'],
})
export class AudioSmallComponent {
  @Input() name: string;
}
