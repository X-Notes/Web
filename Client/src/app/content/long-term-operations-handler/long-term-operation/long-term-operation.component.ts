import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { LongTermOperation, OperationDetailMini } from '../models/long-term-operation';

@Component({
  selector: 'app-long-term-operation',
  templateUrl: './long-term-operation.component.html',
  styleUrls: ['./long-term-operation.component.scss'],
})
export class LongTermOperationComponent implements OnInit {
  @Output()
  cancelAllEvent = new EventEmitter();

  @Output()
  cancelSingleEvent = new EventEmitter<OperationDetailMini>();

  @Input()
  operation: LongTermOperation;

  constructor(private prService: PersonalizationService) {}

  // eslint-disable-next-line class-methods-use-this
  ngOnInit(): void {}

  toogleIsDetailViewActive() {
    this.operation.isDetailViewOpened = !this.operation.isDetailViewOpened;
  }

  get firstItem(): OperationDetailMini {
    return this.operation.details[0];
  }

  get isShortActive(): boolean {
    return (
      (!this.operation.isDetailViewActive || !this.operation.isDetailViewOpened) && !!this.firstItem
    );
  }

  get title() {
    const width = this.prService.windowWidth$.getValue();
    if (width > 1425) {
      return this.operation?.title;
    }
    if (width < 1425 && width > 1225) {
      return this.operation?.titleMedium;
    }
    return this.operation?.titleShort;
  }

  get isOpened() {
    return this.operation.isDetailViewOpened && this.operation.isDetailViewActive;
  }
}
