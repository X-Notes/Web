import { EntityRef } from 'src/app/shared/models/entityRef';
import { NoteType } from 'src/app/shared/models/noteType';
import { Label } from '../../labels/models/label';
import { Album, BaseText } from './ContentMode';

export interface FullNote {
    id: string;
    title: string;
    color: string;
    labels: Label[];
    refType: EntityRef;
    noteType: NoteType;
    contents: BaseText[] | Album[];
}
