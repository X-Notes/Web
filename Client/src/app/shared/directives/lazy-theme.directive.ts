import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from '../enums/ThemeEnum';

@Directive({
  selector: '[appLazyTheme]',
})
export class LazyThemeDirective implements OnInit, OnDestroy {
  @Input() themeClass = '';

  @Input() element?: any;

  @Input() attributeName?: string;

  destroy = new Subject<void>();

  constructor(private el: ElementRef, private renderer: Renderer2, private store: Store) {}

  ngOnInit(): void {
    if (!this.themeClass) {
      throw new Error('themeClass must be defined');
    }
    this.store
      .select(UserStore.getUserTheme)
      .pipe(takeUntil(this.destroy))
      .subscribe((theme) => {
        if (!theme) {
          return;
        }
        if (theme.name === ThemeENUM.Dark) {
          if (this.element && this.attributeName) {
            this.element[this.attributeName] = `dark-${this.themeClass}`;
          } else {
            this.renderer.addClass(this.el.nativeElement, `dark-${this.themeClass}`);
            this.renderer.removeClass(this.el.nativeElement, `light-${this.themeClass}`);
          }
        } else {
          // eslint-disable-next-line no-lonely-if
          if (this.element && this.attributeName) {
            this.element[this.attributeName] = `light-${this.themeClass}`;
          } else {
            this.renderer.removeClass(this.el.nativeElement, `dark-${this.themeClass}`);
            this.renderer.addClass(this.el.nativeElement, `light-${this.themeClass}`);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
