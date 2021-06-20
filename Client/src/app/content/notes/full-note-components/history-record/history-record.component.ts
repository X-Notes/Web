import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { showDropdown } from 'src/app/shared/services/personalization.service';
import { NoteHistory } from '../../models/history/NoteHistory';

@Component({
  selector: 'app-history-record',
  templateUrl: './history-record.component.html',
  styleUrls: ['./history-record.component.scss'],
  animations: [showDropdown],
})
export class HistoryRecordComponent implements OnInit {
  @ViewChild('userHeight') userHeight: ElementRef;

  @ViewChild('scrollbar') scrollbar: ElementRef;

  @Input() history: NoteHistory;

  public positions = [
    new ConnectionPositionPair(
      {
        originX: 'end',
        originY: 'bottom',
      },
      { overlayX: 'end', overlayY: 'top' },
      0,
      5,
    ),
  ];

  seeAllUsers = false;

  constructor(public renderer: Renderer2) {}

  // eslint-disable-next-line class-methods-use-this
  ngOnInit(): void {}

  toggle() {
    this.seeAllUsers = !this.seeAllUsers;
    setTimeout(() => {
      this.renderer.setStyle(
        this.scrollbar?.nativeElement,
        'height',
        `${this.userHeight?.nativeElement?.clientHeight}px`,
      );
    });
  }
}
