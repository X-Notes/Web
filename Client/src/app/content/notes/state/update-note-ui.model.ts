import { Label } from '../../labels/models/label.model';

export class UpdateNoteUI {
  id: string;

  color: string;

  title: string;
  
  labels: Label[];
}
