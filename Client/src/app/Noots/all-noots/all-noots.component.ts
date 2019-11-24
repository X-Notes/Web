import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-all-noots',
  templateUrl: './all-noots.component.html',
  styleUrls: ['./all-noots.component.sass']
})
export class AllNootsComponent implements OnInit {

  constructor() { }
  update = false;
  Changed(increased: any) {
    console.log(1, increased);
    increased = !increased;
    this.update = increased;
  }
  ngOnInit() {
  }

}
