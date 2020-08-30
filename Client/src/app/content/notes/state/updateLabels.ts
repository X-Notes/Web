import { NoteLabel } from '../models/noteLabel';

export interface UpdateLabelEvent {
    id: string;
    labels: NoteLabel[];
}
