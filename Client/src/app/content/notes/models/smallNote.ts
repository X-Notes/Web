import { RefType } from 'src/app/core/models/refType';
import { Label } from '../../labels/models/label';


export interface SmallNote {
    id: string;
    title: string;
    color: string;
    labels: Label[];
    refType: RefType;
}
