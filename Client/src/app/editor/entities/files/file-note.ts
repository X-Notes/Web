import { FileNoteMetaData } from './file-note-metadata';

export class PathSuffixes {
  small: string;

  medium: string;

  large: string;

  default: string;

  constructor(obj: Partial<PathSuffixes>) {
    this.small = obj.small;
    this.medium = obj.medium;
    this.large = obj.large;
    this.default = obj.default;
  }

  get fromDefaultToSmall(): string {
    return this.default ?? this.large ?? this.medium ?? this.small;
  }

  get fromSmallToDefault(): string {
    return this.small ?? this.medium ?? this.large ?? this.default;
  }
}

export class FileNote {
  id: string;

  storageUrl: string;

  pathPrefix: string;

  pathFileId: string;

  pathSuffixes: PathSuffixes;

  authorId: string;

  createdAt: Date;

  name: string;

  metaData: FileNoteMetaData;

  constructor(obj: Partial<FileNote>) {
    Object.assign(this, obj);
    this.pathSuffixes = new PathSuffixes(obj.pathSuffixes);
  }

  get fromDefaultToSmall(): string {
    return this.buildPath(this.pathSuffixes.fromDefaultToSmall);
  }

  get fromSmallToDefault(): string {
    return this.buildPath(this.pathSuffixes.fromSmallToDefault);
  }

  buildPath(path: string): string {
    if (!path) return null;
    return (
      this.storageUrl +
      '/' +
      this.authorId +
      '/' +
      this.pathPrefix +
      '/' +
      this.pathFileId +
      '/' +
      path
    );
  }
}
