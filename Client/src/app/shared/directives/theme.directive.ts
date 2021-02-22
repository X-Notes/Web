import { Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from '../../core/stateUser/user-state';
import { ThemeNaming } from '../enums/ThemeEnum';

@Directive({
  selector: '[appTheme]'
})
export class ThemeDirective implements OnDestroy {

  destroy = new Subject<void>();

  constructor(private el: ElementRef,
              private renderer: Renderer2,
              private store: Store) {
    this.store.select(UserStore.getUserTheme)
    .pipe(takeUntil(this.destroy))
    .subscribe(theme => {
      if (!theme)
      {
        return;
      }
      if (theme.name === ThemeNaming.Dark)
      {
        this.renderer.addClass(this.el.nativeElement, 'dark');
        this.renderer.removeClass(this.el.nativeElement, 'light');
      }else{
        this.renderer.removeClass(this.el.nativeElement, 'dark');
        this.renderer.addClass(this.el.nativeElement, 'light');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
