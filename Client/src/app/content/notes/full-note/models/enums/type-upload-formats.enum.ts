export enum TypeUploadFormats {
  PHOTOS = 'image/jpeg,image/png',
  AUDIOS = 'audio/mp3,audio/ogg,audio/wav,audio/*;capture=microphone',
  VIDEOS = 'video/mp4',
  FILES = '.pdf,.doc,.docx,.txt,.rtf,.xlsx,.xls,.xlsm,.xlsb,.ppt,.pptx,.pptm,.ppsm,.ppsx',
}

export const docFormats = ['doc', 'docx', 'rtf'];

export const excelFormats = ['xlsx', 'xls', 'xlsm', 'xlsb'];

export const pdfFormats = ['pdf'];

export const presentationFormats = ['ppt', 'pptx', 'pptm', 'ppsm', 'ppsx'];
