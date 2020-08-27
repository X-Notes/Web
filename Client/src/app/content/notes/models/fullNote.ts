import { NoteType } from 'src/app/shared/enums/NoteTypes';

export interface FullNote {
    id: string;
    title: string;
    color: string;
    labelsIds: number[];
    noteType: NoteType;
}
