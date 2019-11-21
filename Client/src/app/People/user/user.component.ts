import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.sass']
})
export class UserComponent implements OnInit {

  constructor() { }

  element;
  update = false;

  changeIcon() {
    this.update = !this.update;
    if (this.update === true) {
      this.element.setAttribute('style', 'transform: rotate(180deg)');
    } else {
      this.element.setAttribute('style', 'transform: rotate(0deg)');
    }
  }
  ngOnInit() {
    this.element = document.getElementsByClassName('image-options')[0];
  }

}
