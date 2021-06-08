import { Component } from '@angular/core';
import { hideForDemo } from 'src/environments/demo';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent {
  hideFor = hideForDemo;
}
