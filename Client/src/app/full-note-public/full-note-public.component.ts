import { Component, OnInit } from '@angular/core';
import { DeltaConverter } from '../content/notes/full-note/content-editor/converter/delta-converter';
import { SignalRService } from '../core/signal-r.service';

@Component({
  selector: 'app-full-note-public',
  templateUrl: './full-note-public.component.html',
  styleUrls: ['./full-note-public.component.scss'],
})
export class FullNotePublicComponent implements OnInit {
  constructor(private signalRService: SignalRService) {}

  async ngOnInit(): Promise<void> {
    DeltaConverter.initQuill();
    await this.signalRService.init();
  }
}
