import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  HostBinding,
  DoCheck,
  Renderer2,
} from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'textarea[autosize]',
})
export class AutosizeDirective implements AfterViewInit, DoCheck {
  @Input()
  @HostBinding('rows')
  public rows = 1;

  constructor(private elem: ElementRef, private renderer: Renderer2) {}

  @HostListener('input')
  private resize() {
    const textarea = this.elem.nativeElement as HTMLTextAreaElement;
    const borderHeight = textarea.offsetHeight - textarea.clientHeight;
    this.setHeight('auto');
    this.setHeight(`${textarea.scrollHeight + borderHeight}px`);
  }

  public ngAfterViewInit() {
    this.resize();
  }

  public ngDoCheck() {
    this.resize();
  }

  private setHeight(value: string) {
    this.renderer.setStyle(this.elem.nativeElement, 'height', value);
  }
}
