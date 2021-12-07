import * as uuid from 'uuid';
import { ContentModelBase } from './content-model-base';
import { ContentTypeENUM } from './content-types.enum';

export class DocumentsCollection extends ContentModelBase {
  name: string;

  documents: DocumentModel[];

  isLoading = false;

  constructor(collection: Partial<DocumentsCollection>) {
    super(collection.typeId, collection.id, collection.order, collection.updatedAt);
    this.name = collection.name;
    this.documents = collection.documents
      ? collection.documents.map(
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
    return new DocumentsCollection(obj);
  }

  update(entity: DocumentsCollection) {
    this.name = entity.name;
    this.updatedAt = entity.updatedAt;
    this.documents = entity.documents;
  }

  isEqual(content: DocumentsCollection): boolean {
    return this.name === content.name && this.isEqualDocuments(content);
  }

  copy(): DocumentsCollection {
    return new DocumentsCollection(this);
  }

  copyBase(): DocumentsCollection {
    const obj = new DocumentsCollection(this);
    obj.name = null;
    obj.documents = null;
    return obj;
  }

  private isEqualDocuments(content: DocumentsCollection): boolean {
    if (content.documents.length !== this.documents.length) {
      return false;
    }

    const ids1 = content.documents.map((x) => x.fileId);
    const ids2 = this.documents.map((x) => x.fileId);
    if (!this.isIdsEquals(ids1, ids2)) {
      return false;
    }

    for (const documentsF of this.documents) {
      const documentsS = content.documents.find((x) => x.fileId === documentsF.fileId);
      if (!documentsF.isEqual(documentsS)) {
        return false;
      }
    }

    return true;
  }
}

export class DocumentModel {
  name: string;

  documentPath: string;

  fileId: string;

  authorId: string;

  uploadAt: Date;

  constructor(
    name: string,
    documentPath: string,
    fileId: string,
    authorId: string,
    uploadAt: Date,
  ) {
    this.name = name;
    this.documentPath = documentPath;
    this.fileId = fileId;
    this.authorId = authorId;
    this.uploadAt = uploadAt;
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
