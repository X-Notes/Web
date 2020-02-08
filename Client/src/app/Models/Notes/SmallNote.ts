import { Label } from '../Labels/Label';

export interface SmallNote {
    id: string;
    title: string;
    order: number;
    labels: Label[];
    locked: boolean;
}
