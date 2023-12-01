export abstract class BaseFile {
  public uploadAt: Date;

  public name: string;

  public fileId: string;

  public authorId: string;

  constructor(data: Partial<BaseFile>) {
    this.uploadAt = new Date(data.uploadAt);
    this.name = data.name;
    this.fileId = data.fileId;
    this.authorId = data.authorId;
  }

  abstract isEqual(content: BaseFile): boolean;
}
