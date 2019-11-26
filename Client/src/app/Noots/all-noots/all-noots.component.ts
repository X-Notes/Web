import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-all-noots',
  templateUrl: './all-noots.component.html',
  styleUrls: ['./all-noots.component.sass']
})
export class AllNootsComponent implements OnInit {

  constructor() { }
  update = false;
  items = [{component: 'app-noot'},
  {component: 'app-noot'},
  {component: 'app-noot'},
  {component: 'app-noot'}
  ];
  updateMenu = [];
  Changed(condition: any) {
    for (let num = 0; num < this.items.length; num++) {
      console.log(condition, 1);
      if (condition === false) {
        this.update = true;
        this.updateMenu.push({id: num});
        console.log(this.updateMenu);
        break;
      }
    }
    console.log(condition, 2);
    if (condition === true) {
      this.updateMenu.pop();
      console.log(this.updateMenu);
      if (this.updateMenu.length === 0) {
        this.update = false;
        console.log(condition, 3);
      }
    }
  }
  ngOnInit() {
  }

}
