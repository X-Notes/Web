import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-dialog-generic-save',
  templateUrl: './dialog-generic-save.component.html',
  styleUrls: ['./dialog-generic-save.component.scss'],
})
export class DialogGenericSaveComponent {
  @Output() saveOutput = new EventEmitter<string>();

  save() {
    this.saveOutput.emit();
  }
}
