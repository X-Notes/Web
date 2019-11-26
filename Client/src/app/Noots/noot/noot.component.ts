import { Component, OnInit, Input } from '@angular/core';
import { Noot } from 'src/app/Models/Noots/Noot';

@Component({
  selector: 'app-noot',
  templateUrl: './noot.component.html',
  styleUrls: ['./noot.component.sass']
})
export class NootComponent implements OnInit {

  @Input() noot: Noot;

  constructor() { }

  ngOnInit() {
  }

}
