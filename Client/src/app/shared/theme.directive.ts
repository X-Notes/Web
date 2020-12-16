import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserStore } from '../core/stateUser/user-state';
import { Theme } from './enums/Theme';

@Directive({
  selector: '[appTheme]'
})
export class ThemeDirective {

  private theme = '';

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.theme$.subscribe(
      x => x === 1 ? this.theme = 'dark' : this.theme = 'light'
    );
    this.renderer.addClass(this.el.nativeElement, this.theme);
  }
}
