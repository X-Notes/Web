export const generateFormData = (file: File | Blob, name = 'noteFiles'): FormData => {
  const data = new FormData();
  data.append(name, file);
  return data;
};
