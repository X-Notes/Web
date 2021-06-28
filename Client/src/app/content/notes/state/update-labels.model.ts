import { Label } from '../../labels/models/label.model';

export interface UpdateLabelEvent {
  id: string;
  labels: Label[];
}
