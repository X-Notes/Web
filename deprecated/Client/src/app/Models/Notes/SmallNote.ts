import { Label } from '../Labels/Label';

export interface SmallNote {
    id: string;
    title: string;
    labels: Label[];
    locked: boolean;
}
