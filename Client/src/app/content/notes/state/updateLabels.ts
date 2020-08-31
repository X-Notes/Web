import { Label } from '../../labels/models/label';

export interface UpdateLabelEvent {
    id: string;
    labels: Label[];
}
