import * as uuid from 'uuid';
import { BaseCollection } from './base-collection';
import { BaseFile } from './base-file';
import { ContentTypeENUM } from './content-types.enum';

export class DocumentsCollection extends BaseCollection<DocumentModel> {
  constructor(collection: Partial<DocumentsCollection>, items: DocumentModel[]) {
    super(collection.typeId, collection.id, collection.order, collection.updatedAt);
    this.name = collection.name;
    this.items = items
      ? items.map(
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          (z) =>
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            new DocumentModel(z.name, z.documentPath, z.fileId, z.authorId, z.uploadAt),
        )
      : [];
  }

  static getNew(): DocumentsCollection {
    const obj: Partial<DocumentsCollection> = {
      typeId: ContentTypeENUM.Documents,
      id: uuid.v4(),
      updatedAt: new Date(),
    };
    return new DocumentsCollection(obj, obj.items);
  }

  isTextOrCollectionInfoEqual(content: DocumentsCollection): boolean {
    return this.name === content.name;
  }

  copy(): DocumentsCollection {
    return new DocumentsCollection(this, this.items);
  }

  copyBase(): DocumentsCollection {
    const obj = new DocumentsCollection(this, this.items);
    obj.name = null;
    obj.items = null;
    return obj;
  }

  patch(content: DocumentsCollection) {
    this.name = content.name;
    this.items = content.items;
  }
}

export class DocumentModel extends BaseFile {
  documentPath: string;

  constructor(
    name: string,
    documentPath: string,
    fileId: string,
    authorId: string,
    uploadAt: Date,
  ) {
    super(name, fileId, authorId, uploadAt);
    this.documentPath = documentPath;
  }

  isEqual(content: DocumentModel): boolean {
    return (
      this.name === content.name &&
      this.fileId === content.fileId &&
      this.documentPath === content.documentPath &&
      this.authorId === content.authorId
    );
  }
}

export class ApiDocumentsCollection extends DocumentsCollection {
  documents: DocumentModel[];
}
