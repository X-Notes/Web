import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { PersonalizationService, uploader } from 'src/app/shared/services/personalization.service';
import { LongTermOperationsHandlerService } from './services/long-term-operations-handler.service';

@Component({
  selector: 'app-long-term-operations-handler',
  templateUrl: './long-term-operations-handler.component.html',
  styleUrls: ['./long-term-operations-handler.component.scss'],
  animations: [uploader],
})
export class LongTermOperationsHandlerComponent implements OnInit, OnDestroy {
  @ViewChild('container') container: ElementRef;

  destroy = new Subject<void>();

  constructor(
    public longTermOperations: LongTermOperationsHandlerService,
    public prService: PersonalizationService,
    private renderer: Renderer2,
  ) {}

  get positions() {
    return this.prService.isSnackBarActive$.pipe(map(isSnackbar => {
      if(isSnackbar) {
        return this.prService.isMobile() ? { 'top': '55px' } : { 'bottom': '62px'};
      }
      return this.prService.isMobile() ? {  'top': '5px' } : { 'bottom': '25px'};
    }));
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {}
}
