import { Label } from '../Labels/Label';
import { Part } from '../Parts/Part';

export interface FullNote {
    Id: string;
    Title: string;
    Parts: Part[];
    Labels: Label[];
    Locked: boolean;
}
