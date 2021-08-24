
export const generateFormData = (files: File[], name: string): FormData => {
    const data = new FormData();
    for (const file of files) {
      data.append(name, file);
    }
    return data;
}


export const nameForUploadPhotos = 'photos';
export const nameForUploadAudios = 'audios';
export const nameForUploadVideos = 'video';
export const nameForUploadDocuments = 'file';