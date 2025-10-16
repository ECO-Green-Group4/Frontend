export function mapFilesToMockUrls(files: File[], prefix: string = "image"): string[] {
  return (files || []).map((_, index) => `https://example.com/${prefix}-${index + 1}.jpg`);
}


