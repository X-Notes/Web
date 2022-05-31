export abstract class BaseFile {
  public uploadAt: Date;

  constructor(public name: string, public fileId: string, public authorId: string, uploadAt: Date) {
    this.uploadAt = new Date(uploadAt);
  }

  abstract isEqual(content: BaseFile): boolean;
}
