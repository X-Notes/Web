import { NoteLabel } from './noteLabel';

export interface SmallNote {
    id: string;
    title: string;
    color: string;
    labels: NoteLabel[];
}
