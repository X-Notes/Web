import { NoteTypeENUM } from "src/app/shared/enums/note-types.enum";
import { RefTypeENUM } from "src/app/shared/enums/ref-type.enum";

export class BaseNote {
    id!: string;
  
    title?: string;
  
    color!: string;
  
    labelIds?: string[];
  
    userId!: string;

    isCanEdit!: boolean;
  
    refTypeId!: RefTypeENUM;
  
    noteTypeId?: NoteTypeENUM;
  
    createdAt!: Date;
  
    updatedAt!: Date;
  
    version!: number;
  
    deletedAt!: Date;
  }
  