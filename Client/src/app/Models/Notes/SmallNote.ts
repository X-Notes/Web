import { Label } from '../Labels/Label';

export interface SmallNote {
    id: string;
    email: string;
    title: string;
    labels: Label[];
    deleted: boolean;
    locked: boolean;
}
