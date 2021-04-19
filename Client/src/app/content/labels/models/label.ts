export interface Label {
  id: string;
  name: string;
  isDeleted: boolean;
  color: string;
  countNotes: number;
  isSelected?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
