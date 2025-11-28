/**
 * Downloads a blob as a file with the specified filename
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a formatted filename with timestamp
 */
export function generateFilename(
  baseName: string,
  extension: string,
  includeTimestamp: boolean = true
): string {
  if (!includeTimestamp) {
    return `${baseName}.${extension}`;
  }
  const date = new Date();
  const dateString = date.toISOString().split('T')[0];
  return `${baseName}-${dateString}.${extension}`;
}
