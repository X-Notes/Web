import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { MenuSelectionService } from '../menu-selection.service';

@Directive({
  selector: '[appTextEditMenu]',
})
export class TextEditMenuDirective implements OnInit, OnDestroy {
  listeners = [];

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    public menuSelectionService: MenuSelectionService,
  ) {}

  ngOnDestroy(): void {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }

  ngOnInit(): void {
    const scrollEventListener = this.renderer.listen(this.elementRef.nativeElement, 'scroll', () =>
      this.changeMenuPosition(),
    );
    this.listeners.push(scrollEventListener);
  }

  changeMenuPosition() {
    this.menuSelectionService.currentScroll = this.elementRef.nativeElement.scrollTop;
  }
}
