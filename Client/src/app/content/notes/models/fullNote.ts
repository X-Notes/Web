import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { Label } from '../../labels/models/label';

export interface FullNote {
    id: string;
    title: string;
    color: string;
    labels: Label[];
    noteType: NoteType;
}
