export enum TypeUploadFormats {
  photos = 'image/jpeg,image/png',
  audios = 'audio/mp3,audio/ogg,audio/wav,audio/*;capture=microphone',
  videos = 'video/mp4',
  documents = '.pdf,.doc,.docx,.txt,.rtf,.xlsx,.xls,.xlsm,.xlsb,.ppt,.pptx,.pptm,.ppsm,.ppsx',
}

export const docFormats = ['doc', 'docx', 'rtf'];

export const excelFormats = ['xlsx', 'xls', 'xlsm', 'xlsb'];

export const pdfFormats = ['pdf'];

export const presentationFormats = ['ppt', 'pptx', 'pptm', 'ppsm', 'ppsx'];
