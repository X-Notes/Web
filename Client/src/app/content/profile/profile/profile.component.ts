import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  check = true;

  constructor() { }

  ngOnInit(): void {
  }

  toggle() {
    this.check = !this.check;
  }

}
