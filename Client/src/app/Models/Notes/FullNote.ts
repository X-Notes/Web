import { Label } from '../Labels/Label';

export interface FullNote {
    id: string;
    title: string;
    labels: Label[];
    locked: boolean;
}
