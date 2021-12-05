export const generateFormData = (files: File[]): FormData => {
  const data = new FormData();
  for (const file of files) {
    data.append('noteFiles', file);
  }
  return data;
};
