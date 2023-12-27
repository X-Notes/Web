import { Component, Input } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { LongTermOperation } from '../models/long-term-operation';

@Component({
  selector: 'app-long-term-operation',
  templateUrl: './long-term-operation.component.html',
  styleUrls: ['./long-term-operation.component.scss'],
})
export class LongTermOperationComponent {
 
  @Input()
  operation: LongTermOperation;

  constructor(private prService: PersonalizationService) {}

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
}
