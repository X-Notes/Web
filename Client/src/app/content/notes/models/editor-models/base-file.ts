export abstract class BaseFile {

    constructor(
        public name: string, 
        public fileId: string, 
        public authorId: string, 
        public uploadAt: Date
    ){}

    abstract isEqual(content: BaseFile): boolean;
}