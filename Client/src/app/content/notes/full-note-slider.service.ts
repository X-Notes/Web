import { Injectable, Renderer2, ElementRef } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { animate, AnimationBuilder, style } from '@angular/animations';

@Injectable()
export class FullNoteSliderService {

  active = 0;
  mainWidth = 0;
  animFactory: any;
  animating = false;
  animMS = 700;
  player;
  pos: number;
  total = 2;
  perc: number;
  helper: Element;
  rend: Renderer2;

  constructor(public pService: PersonalizationService,
              public builder: AnimationBuilder) { }



  initWidthSlide() {
    if (!this.pService.check()) {
      this.getSize();
    } else {
      this.mainWidth = null;
    }
  }

  animEnd(wrap: ElementRef) {
    this.perc = 0;
    if (this.active < 0) {
      this.active = this.total - 1;
    }
    if (this.active > this.total - 1) {
      this.active = 0;
    }
    this.pos = -(100 / this.total) * this.active;
    this.rend.setStyle(wrap.nativeElement, 'transform', 'translate3d( ' + this.pos + '%,0,0)');
    this.player.destroy();
  }

  getSize() {
    this.mainWidth = window.innerWidth;
  }

  buildAnim() {
    const arr = [];
    arr.push(animate(this.animMS + 'ms ease', style({ transform: 'translate3d( ' + this.pos + '% ,0,0)' })) );
    return arr;
  }

  goTo(to: number, wrap: ElementRef) {
    if (!this.animating) {
      this.active = to;
      this.pos = -(100 / this.total) * to;
      this.animating = true;
      this.animFactory = this.builder.build(this.buildAnim());
      this.player = this.animFactory.create(wrap.nativeElement);
      this.player.onDone(() => {
        this.animEnd(wrap);
        this.animating = false;
        this.animMS = 700;
      });
      this.player.play();
    }
  }

  panStart(e) {
    if (!this.pService.check()) {
      this.getSize();
    }
  }

  panMove(e, wrap: ElementRef) {
    this.helper = document.getElementsByClassName('second-helper')[0];
    if (!this.pService.check()) {
      this.perc = 100 / this.total * e.deltaX / (this.mainWidth * this.total);
      this.pos = this.perc - 100 / this.total * this.active;
      if (this.active === 0 && (this.pos > 2 || this.pos > 0)) {
        return;
      }
      if (this.active === 1 && (this.pos > 2 || this.pos < -50)) {
        return;
      }
      if (this.helper.hasChildNodes()) {
        return;
      }
      this.rend.setStyle(wrap.nativeElement, 'transform', 'translate3d( ' +  this.pos + '%,0,0)');
    }
  }

  panEnd(e, wrap: ElementRef) {
    if (!this.pService.check()) {
      if (e.velocityX > 1) {
        if (this.active === 0 && this.pos > 0) {
          this.goTo(this.active, wrap);
        }
        this.animMS = this.animMS / e.velocityX;
        this.goTo(this.active - 1, wrap);
      } else if (e.velocityX < -1) {
        if (this.active === 1 && this.pos < -50) {
          this.goTo(this.active, wrap);
        }
        this.animMS = this.animMS / -e.velocityX;
        this.goTo(this.active + 1, wrap);
      } else {
        if (this.perc <= -(25 / this.total)) {
          if (this.active === 1 && this.pos < -50) {
            this.goTo(this.active, wrap);
          }
          this.goTo(this.active + 1, wrap);
        } else if (this.perc >= (25 / this.total)) {
          if (this.active === 0 && this.pos > 0) {
            this.goTo(this.active, wrap);
          }
          this.goTo(this.active - 1, wrap);
        } else {
          this.goTo(this.active, wrap);
        }
      }
    }
  }

}
