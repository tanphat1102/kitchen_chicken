export const getRelativePath = (fullPath: string, basePath: string): string => {
  if (fullPath.startsWith(basePath)) {
    const relative = fullPath.slice(basePath.length);
    return relative.replace(/^\/+/, "");
  }
  return fullPath;
};
