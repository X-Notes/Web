import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-drag-drop-handler-container',
  templateUrl: './drag-drop-handler-container.component.html',
  styleUrls: ['./drag-drop-handler-container.component.scss'],
})
export class DragDropHandlerContainerComponent {
  @Input()
  isShow = false;

  @Input()
  classes: string;
}
