import { Component } from '@angular/core';
import { hideForDemo } from 'src/environments/demo';
@Component({
  selector: 'app-memory-indicator',
  templateUrl: './memory-indicator.component.html',
  styleUrls: ['./memory-indicator.component.scss'],
})
export class MemoryIndicatorComponent {
  hideFor = hideForDemo;
}
