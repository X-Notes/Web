import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { OperationDetailMini } from './models/long-term-operation';
import { LongTermOperationsHandlerService } from './services/long-term-operations-handler.service';

@Component({
  selector: 'app-long-term-operations-handler',
  templateUrl: './long-term-operations-handler.component.html',
  styleUrls: ['./long-term-operations-handler.component.scss'],
})
export class LongTermOperationsHandlerComponent implements OnInit, OnDestroy {
  @ViewChild('container') container: ElementRef;

  destroy = new Subject<void>();

  constructor(
    public longTermOperations: LongTermOperationsHandlerService,
    public prService: PersonalizationService,
    private renderer: Renderer2,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.prService.isSnackBarActive$
      .pipe(
        takeUntil(this.destroy),
        filter(() => !!this.container?.nativeElement),
      )
      .subscribe((flag) => {
        if (flag) {
          this.renderer.setStyle(this.container.nativeElement, 'bottom', '82px');
        } else {
          this.renderer.setStyle(this.container.nativeElement, 'bottom', '42px');
        }
      });
  }

  cancelAllHandler() {
    // TODO CONFIRMATION POP-UP
    this.longTermOperations.operations.forEach((op) =>
      op.details.forEach((d) => {
        d.obs.next();
        d.obs.complete();
      }),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  cancelSingleHandler(operation: OperationDetailMini) {
    // TODO CONFIRMATION POP-UP
    operation.obs.next();
    operation.obs.complete();
  }
}
