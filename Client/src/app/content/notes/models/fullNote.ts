import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { NoteLabel } from './noteLabel';

export interface FullNote {
    id: string;
    title: string;
    color: string;
    labels: NoteLabel[];
    noteType: NoteType;
}
