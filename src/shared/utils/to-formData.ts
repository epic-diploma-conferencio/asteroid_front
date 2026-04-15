export const toFormData = (file: File): FormData => {
  const fd = new FormData();
  fd.append('file', file);
  return fd;
};
