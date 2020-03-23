import { Label } from '../Labels/Label';

export interface FullNote {
    Id: string;
    Title: string;
    InnerHTML: string;
    Labels: Label[];
    Locked: boolean;
}
