import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.sass']
})
export class LabelsComponent implements OnInit {

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
