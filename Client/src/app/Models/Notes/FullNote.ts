import { Label } from '../Labels/Label';
import { Part } from '../Parts/Part';

export interface FullNote {
    id: string;
    title: string;
    parts: Part[];
    labels: Label[];
    locked: boolean;
}
