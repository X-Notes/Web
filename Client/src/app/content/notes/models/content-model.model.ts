/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-underscore-dangle */
import * as uuid from 'uuid';

export abstract class ContentModel {
  typeId: ContentTypeENUM;

  id: string;

  updatedAt: Date;

  order: number;

  constructor(type: ContentTypeENUM, id: string, order: number, updatedAt: Date) {
    this.typeId = type;
    this.id = id;
    this.updatedAt = updatedAt;
    this.order = order;
  }

  isIdsEquals(ids1: string[], ids2: string[]): boolean {
    const res1 = ids1.filter((name) => !ids2.includes(name));
    const res2 = ids2.filter((name) => !ids1.includes(name));
    return res1.length === 0 && res2.length === 0;
  }

  abstract copy(): ContentModel;
  abstract copyBase(): ContentModel;
  abstract isEqual(content: ContentModel): boolean;
}

export class BaseText extends ContentModel {

  number?: number;

  content: string;

  headingTypeId?: HeadingTypeENUM;

  noteTextTypeId: NoteTextTypeENUM;

  checked?: boolean;

  isBold: boolean;

  isItalic: boolean;

  constructor(text: Partial<BaseText>) {
    super(text.typeId, text.id, text.order, text.updatedAt);
    this.content = text.content;
    this.headingTypeId = text.headingTypeId;
    this.noteTextTypeId = text.noteTextTypeId;
    this.checked = text.checked;
    this.isBold = text.isBold;
    this.isItalic = text.isItalic;
  }

  static getNew(): BaseText {
    const obj: Partial<BaseText> = {
      typeId: ContentTypeENUM.Text,
      id: uuid.v4(),
      updatedAt: new Date(),
    };
    return new BaseText(obj);
  }

  copy(): BaseText {
    return new BaseText(this);
  }

  copyBase(): BaseText{
    const obj = new BaseText(this);
    obj.content = null;
    obj.headingTypeId = null;
    obj.noteTextTypeId = null;
    obj.checked = null;
    obj.isBold = null;
    obj.isItalic = null;
    return obj;
  }

  isEqual(content: BaseText): boolean {
    return this.content === content.content && 
           this.headingTypeId === content.headingTypeId &&
           this.noteTextTypeId === content.noteTextTypeId &&
           this.checked === content.checked &&
           this.isBold === content.isBold &&
           this.isItalic === content.isItalic;
  }

  update(text: BaseText){
    this.content = text.content;
    this.headingTypeId = text.headingTypeId;
    this.noteTextTypeId = text.noteTextTypeId;
    this.checked = text.checked;
    this.isBold = text.isBold;
    this.isItalic = text.isItalic;
    this.updatedAt = text.updatedAt;
  }

  get contentSG(): string {
    return this.content;
  }

  set contentSG(content: string) {
    this.content = content;
    this.updateDate();
  }

  get headingTypeIdSG(): HeadingTypeENUM {
    return this.headingTypeId;
  }

  set headingTypeIdSG(headingTypeId: HeadingTypeENUM) {
    this.headingTypeId = headingTypeId;
    this.updateDate();
  }

  get noteTextTypeIdSG(): NoteTextTypeENUM {
    return this.noteTextTypeId;
  }

  set noteTextTypeIdSG(noteTextTypeId: NoteTextTypeENUM) {
    this.noteTextTypeId = noteTextTypeId;
    this.updateDate();
  }

  get checkedSG(): boolean {
    return this.checked;
  }

  set checkedSG(_checked: boolean) {
    this.checked = _checked;
    this.updateDate();
  }

  get isBoldSG(): boolean {
    return this.isBold;
  }

  set isBoldSG(_isBold: boolean) {
    this.isBold = _isBold;
    this.updateDate();
  }

  get isItalicSG(): boolean {
    return this.isItalic;
  }

  set isItalicSG(_isItalic: boolean) {
    this.isItalic = _isItalic;
    this.updateDate();
  }

  private updateDate() {
    this.updatedAt = new Date();
  }
}

export class AudiosCollection extends ContentModel {
  name: string;

  audios: AudioModel[];

  isLoading = false;

  constructor(collection: Partial<AudiosCollection>) {
    super(collection.typeId, collection.id, collection.order, collection.updatedAt);
    this.name = collection.name;
    this.audios = collection.audios ? collection.audios.map(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      (z) =>
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        new AudioModel(z.name, z.audioPath, z.fileId, z.authorId),
    ): [];
  }

  copy(): AudiosCollection {
    return new AudiosCollection(this);
  }

  copyBase(): AudiosCollection {
    const obj = new AudiosCollection(this);
    obj.name = null;
    obj.audios = null;
    return obj;
  }

  isEqual(content: AudiosCollection): boolean {
    return this.name === content.name && this.isEqualAudios(content);
  }

  private isEqualAudios(content: AudiosCollection): boolean {
    
    if(content.audios.length !== this.audios.length) {
      return false;
    }

    const ids1 = content.audios.map(x => x.fileId);
    const ids2 = this.audios.map(x => x.fileId);
    if(!this.isIdsEquals(ids1, ids2)){
      return false;
    }

    for(const audioF of this.audios) {
      const audioS = content.audios.find(x => x.fileId === audioF.fileId);
      if(!audioF.isEqual(audioS)){
        return false;
      }
    }

    return true;
  }
}

export class AudioModel {
  fileId: string;

  name: string;

  audioPath: string;

  authorId: string;

  constructor(name: string, audioPath: string, fileId: string, authorId: string) {
    this.name = name;
    this.audioPath = audioPath;
    this.fileId = fileId;
    this.authorId = authorId;
  }

  isEqual(content: AudioModel): boolean {
    return this.name === content.name &&
           this.fileId === content.fileId &&
           this.audioPath === content.audioPath &&
           this.authorId === content.authorId;
  }
}

export class VideosCollection extends ContentModel {
  name: string;

  videos: VideoModel[];

  isLoading = false;

  constructor(collection: Partial<VideosCollection>) {
    super(collection.typeId, collection.id, collection.order, collection.updatedAt);
    this.name = collection.name;
    this.videos = collection.videos ? collection.videos.map(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      (z) =>
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        new VideoModel(z.name, z.videoPath, z.fileId, z.authorId),
    ): [];
  }

  copy(): VideosCollection {
    return new VideosCollection(this);
  }

  copyBase(): VideosCollection {
    const obj = new VideosCollection(this);
    obj.name = null;
    obj.videos = null;
    return obj;
  }

  isEqual(content: VideosCollection): boolean {
    return this.name === content.name && this.isEqualVideos(content);
  }

  private isEqualVideos(content: VideosCollection): boolean {
    
    if(content.videos.length !== this.videos.length) {
      return false;
    }

    const ids1 = content.videos.map(x => x.fileId);
    const ids2 = this.videos.map(x => x.fileId);
    if(!this.isIdsEquals(ids1, ids2)){
      return false;
    }

    for(const videoF of this.videos) {
      const videoS = content.videos.find(x => x.fileId === videoF.fileId);
      if(!videoF.isEqual(videoS)){
        return false;
      }
    }

    return true;
  }
}

export class VideoModel {
  name: string;

  videoPath: string;

  fileId: string;

  authorId: string;

  constructor(name: string, videoPath: string, fileId: string, authorId: string) {
    this.name = name;
    this.videoPath = videoPath;
    this.fileId = fileId;
    this.authorId = authorId;
  }

  isEqual(content: VideoModel): boolean {
    return this.name === content.name &&
           this.fileId === content.fileId &&
           this.videoPath === content.videoPath &&
           this.authorId === content.authorId;
  }
}

export class DocumentsCollection extends ContentModel {
  name: string;

  documents: DocumentModel[];

  isLoading = false;

  constructor(collection: Partial<DocumentsCollection>) {
    super(collection.typeId, collection.id, collection.order, collection.updatedAt);
    this.name = collection.name;
    this.documents = collection.documents ? collection.documents.map(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      (z) =>
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        new DocumentModel(z.name, z.documentPath, z.fileId, z.authorId),
    ) : [];
    
  }

  isEqual(content: DocumentsCollection): boolean {
    return this.name === content.name && this.isEqualDocuments(content);
  }

  private isEqualDocuments(content: DocumentsCollection): boolean {
    
    if(content.documents.length !== this.documents.length) {
      return false;
    }

    const ids1 = content.documents.map(x => x.fileId);
    const ids2 = this.documents.map(x => x.fileId);
    if(!this.isIdsEquals(ids1, ids2)){
      return false;
    }

    for(const documentsF of this.documents) {
      const documentsS = content.documents.find(x => x.fileId === documentsF.fileId);
      if(!documentsF.isEqual(documentsS)){
        return false;
      }
    }

    return true;
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
}

export class DocumentModel {
  name: string;

  documentPath: string;

  fileId: string;

  authorId: string;

  constructor(name: string, documentPath: string, fileId: string, authorId: string) {
    this.name = name;
    this.documentPath = documentPath;
    this.fileId = fileId;
    this.authorId = authorId;
  }

  isEqual(content: DocumentModel): boolean {
    return this.name === content.name &&
           this.fileId === content.fileId &&
           this.documentPath === content.documentPath &&
           this.authorId === content.authorId;
  }
}

export class PhotosCollection extends ContentModel {
  photos: Photo[];

  height: string;

  width: string;

  countInRow: number;

  isLoading = false;
  
  constructor(collection: Partial<PhotosCollection>) {
    super(collection.typeId, collection.id, collection.order, collection.updatedAt);
    this.countInRow = collection.countInRow;
    this.height = collection.height;
    this.width = collection.width;
    this.photos = collection.photos ? collection.photos.map(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      (z) =>
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        new Photo(
          z.fileId,
          z.photoPathSmall,
          z.photoPathMedium,
          z.photoPathBig,
          z.loaded,
          z.name,
          z.authorId,
        ),
    ): [];
  }

  isEqual(content: PhotosCollection): boolean {
    return this.height === content.height && 
           this.width === content.width &&
           this.countInRow === content.countInRow &&
           this.isEqualPhotos(content);
  }

  private isEqualPhotos(content: PhotosCollection): boolean {
    
    if(content.photos.length !== this.photos.length) {
      return false;
    }

    const ids1 = content.photos.map(x => x.fileId);
    const ids2 = this.photos.map(x => x.fileId);
    if(!this.isIdsEquals(ids1, ids2)){
      return false;
    }

    for(const photoF of this.photos) {
      const photoS = content.photos.find(x => x.fileId === photoF.fileId);
      if(!photoF.isEqual(photoS)){
        return false;
      }
    }

    return true;
  }

  copy(): PhotosCollection {
    return new PhotosCollection(this);
  }

  copyBase(): PhotosCollection {
    const obj = new PhotosCollection(this);
    obj.height = null;
    obj.width = null;
    obj.photos = null;
    obj.countInRow = null;
    return obj;
  }
}

export class Photo {
  fileId: string;

  name: string;

  photoPathSmall: string;

  photoPathMedium: string;

  photoPathBig: string;

  authorId: string;

  loaded: boolean;

  get photoFromBig() {
    return this.photoPathBig ?? this.photoPathMedium ?? this.photoPathSmall;
  }

  get photoFromSmall() {
    return this.photoPathSmall ?? this.photoPathMedium ?? this.photoPathBig;
  }

  constructor(
    fileId: string,
    photoPathSmall: string,
    photoPathMedium: string,
    photoPathBig: string,
    loaded: boolean,
    name: string,
    authorId: string,
  ) {
    this.fileId = fileId;
    this.photoPathSmall = photoPathSmall;
    this.photoPathMedium = photoPathMedium;
    this.photoPathBig = photoPathBig;
    this.loaded = loaded;
    this.name = name;
    this.authorId = authorId;
  }

  isEqual(content: Photo): boolean {
    return this.name === content.name &&
           this.fileId === content.fileId &&
           this.photoPathSmall === content.photoPathSmall &&
           this.photoPathMedium === content.photoPathMedium &&
           this.photoPathBig === content.photoPathBig &&
           this.authorId === content.authorId;
  }
}

export enum HeadingTypeENUM {
  H1 = 1,
  H2 = 2,
  H3 = 3,
}

export enum ContentTypeENUM {
  Text = 1,
  Photos = 2,
  Documents = 3,
  Audios = 4,
  Videos = 5,
}

export enum NoteTextTypeENUM {
  Default = 1,
  Heading = 2,
  Dotlist = 3,
  Numberlist = 4,
  Checklist = 5,
}
