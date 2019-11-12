import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';


@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.sass'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform : 'translateY(-70%)', opacity: '*'}),
        animate('300ms ease-out', style({transform: 'translateY(0%)', height: '*', 'z-index': '-1'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateY(-50%)', opacity: '0.5', height: '0px'}))
      ]),
    ])
  ]
})
export class LabelComponent implements OnInit {

  constructor() { }
  update = false;
  h1color = '#DDFFCD';
  element;
  changeIcon() {
    if (this.update === true) {
      this.element.setAttribute('style', 'transform: rotate(180deg)');
    } else {
      this.element.setAttribute('style', 'transform: rotate(0deg)');
    }
  }
  changeColor(id) {
    if ('firstLi' === id) {
      this.h1color = '#FFCDCD';
    } else if ('secondLi' === id) {
      this.h1color = '#FFEBCD';
    } else if ('thirdLi' === id) {
      this.h1color = '#FFFDCD';
    } else if ('fourthLi' === id) {
      this.h1color = '#DDFFCD';
    } else if ('fifthLi' === id) {
      this.h1color = '#CDFFD8';
    } else if ('sixLi' === id) {
      this.h1color = '#CDFFFC';
    } else if ('sevenLi' === id) {
      this.h1color = '#CDEEFF';
    } else if ('eithLi' === id) {
      this.h1color = '#CDD5FF';
    } else if ('nineLi' === id) {
      this.h1color = '#EFCDFF';
    } else if ('tenLi' === id) {
      this.h1color = '#FFCDF4';
    }
 }
  ngOnInit() {
    this.element = document.getElementsByClassName('image-options')[0];
  }

}
