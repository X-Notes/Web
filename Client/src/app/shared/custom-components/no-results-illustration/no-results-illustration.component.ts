import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { smoothOpacity } from '../../services/personalization.service';

@Component({
  selector: 'app-no-results-illustration',
  templateUrl: './no-results-illustration.component.html',
  styleUrls: ['./no-results-illustration.component.scss'],
  animations: [smoothOpacity(300)],
})
export class NoResultsIllustrationComponent implements AfterViewInit, OnDestroy {
  @Input() message: string;

  @Input() illustration: string;

  @Input() typeClass: string;

  @Input() isShow: boolean;

  @ViewChild('wrapper') wrapper: ElementRef;

  resizeObservable$: Observable<Event>;

  resizeSubscription$: Subscription;

  isCheck = false;

  constructor(public renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.setSize();
    this.resizeObservable$ = fromEvent(window, 'resize');
    this.resizeSubscription$ = this.resizeObservable$.subscribe(() => this.setSize());
  }

  ngOnDestroy(): void {
    this.resizeSubscription$.unsubscribe();
  }

  setSize(): void {
    if (this.wrapper) {
      const element = this.wrapper?.nativeElement;
      if (element?.clientHeight === element?.clientWidth) {
        this.renderer.setStyle(element, 'height', 'auto');
        this.renderer.setStyle(element, 'width', `100%`);
        if (!this.isCheck) {
          this.isCheck = true;
          this.setSize();
        }
        return;
      }
      if (element?.clientHeight > element?.clientWidth) {
        this.renderer.setStyle(element, 'height', `${element?.clientWidth}px`);
        this.renderer.setStyle(element, 'width', `${element?.clientWidth}px`);
      } else {
        this.renderer.setStyle(element, 'height', `${element?.clientHeight}px`);
        this.renderer.setStyle(element, 'width', `${element?.clientHeight}px`);
      }
    }
  }
}
