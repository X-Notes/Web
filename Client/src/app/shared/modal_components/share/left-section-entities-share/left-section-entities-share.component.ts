import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { LeftSectionShareEntity } from './entities/left-section-share-entity';

@Component({
  selector: 'app-left-section-entities-share',
  templateUrl: './left-section-entities-share.component.html',
  styleUrls: ['./left-section-entities-share.component.scss'],
})
export class LeftSectionEntitiesShareComponent implements OnInit {
  @Output() clickEvent = new EventEmitter<LeftSectionShareEntity>();

  @Output() cancelEvent = new EventEmitter<LeftSectionShareEntity>();

  @Input() unnamedTitle: string;

  @Input() titleMessage: string;

  @Input() entities: LeftSectionShareEntity[] = [];

  @Input() selectedEntityId: string;

  @Input() isCancelActive = false;

  @Input()
  theme: ThemeENUM;

  get themeClass(): string {
    if (this.theme === ThemeENUM.Light) {
      return 'light';
    }
    return 'dark';
  }

  ngOnInit(): void {}

  onClick(ent: LeftSectionShareEntity): void {
    this.clickEvent.emit(ent);
  }

  onCancel(ent: LeftSectionShareEntity): void {
    this.cancelEvent.emit(ent);
  }
}
