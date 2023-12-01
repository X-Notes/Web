export class Label {
  id: string;

  name: string;

  isDeleted: boolean;

  color: string;

  order: number;

  countNotes: number;

  isDisplay?: boolean;
  
  createdAt?: Date;

  updatedAt?: Date;

  deletedAt?: Date;

  constructor(obj: Partial<Label>) {
    Object.assign(this, obj);
  }
}
