import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-generic-delete-entity-message',
  templateUrl: './generic-delete-entity-message.component.html',
  styleUrls: ['./generic-delete-entity-message.component.scss'],
})
export class GenericDeleteEntityMessageComponent {
  @Input() message: string;
}
